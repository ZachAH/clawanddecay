// netlify/functions/stripe-webhook.js

const path = require('path');
const fs = require('fs');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const admin = require('firebase-admin');
const fetch = require('node-fetch');
const StripeModule = require('stripe');

const variantMapPath = path.join(__dirname, 'variant-map.json');
const variantIdToPrintifyMap = JSON.parse(fs.readFileSync(variantMapPath, 'utf8'));

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const secretClient = new SecretManagerServiceClient({
  credentials: JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT),
});

async function accessSecret(secretName) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  const projectId = serviceAccount.project_id;
  const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
  const [version] = await secretClient.accessSecretVersion({ name });
  return version.payload.data.toString('utf8');
}

function mapToPrintifyVariant(variantId) {
  return variantIdToPrintifyMap[variantId] || null;
}

async function sendOrderToPrintify(session, lineItems, shippingAddress) {
  console.log('Preparing Printify order from Stripe session:', session.id);

  const printifyLineItems = lineItems.map(item => {
    const variantId = item.price_data.product_data.metadata.variant_id;
    const printifyVariant = mapToPrintifyVariant(variantId);

    console.log(`Mapping Stripe variantId ${variantId} to Printify variant:`, printifyVariant);

    if (!printifyVariant) {
      throw new Error(`No Printify mapping found for variant ID ${variantId}`);
    }

    return {
      product_id: printifyVariant.product_id,
      variant_id: printifyVariant.variant_option_ids[0],
      quantity: item.quantity,
    };
  });

  const orderData = {
    external_id: session.id,
    label: `Order ${session.id}`,
    send_shipping_notification: true,
    line_items: printifyLineItems,
    shipping_address: {
      first_name: shippingAddress?.name?.split(' ')[0] || 'Customer',
      last_name: shippingAddress?.name?.split(' ')[1] || '',
      address1: shippingAddress?.address?.line1 || '',
      address2: shippingAddress?.address?.line2 || '',
      city: shippingAddress?.address?.city || '',
      region: shippingAddress?.address?.state || '',
      country: shippingAddress?.address?.country || '',
      zip: shippingAddress?.address?.postal_code || '',
      phone: shippingAddress?.phone || '',
    },
  };

  console.log('Sending order data to Printify:', JSON.stringify(orderData, null, 2));

  const response = await fetch(
    `https://api.printify.com/v1/shops/${process.env.PRINTIFY_SHOP_ID}/orders.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Printify API response error:', errorBody);
    throw new Error(`Printify order creation failed: ${response.status} ${errorBody}`);
  }

  const jsonResponse = await response.json();
  console.log('Printify order creation successful:', jsonResponse);
  return jsonResponse;
}

let stripe;
let signingSecret;

module.exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
      },
      body: 'OK',
    };
  }

  try {
    if (!stripe) {
      const stripeSecretKey = await accessSecret('STRIPE_SECRET_KEY');
      stripe = StripeModule(stripeSecretKey);
    }
    if (!signingSecret) {
      signingSecret = await accessSecret('SIGNING_SECRET');
    }

    const sig = event.headers['stripe-signature'];
    if (!sig) throw new Error('Missing Stripe signature header');

    let stripeEvent;
    try {
      stripeEvent = stripe.webhooks.constructEvent(event.body, sig, signingSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return { statusCode: 400, body: `Webhook Error: ${err.message}` };
    }

    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object;

      const lineItemsResponse = await stripe.checkout.sessions.listLineItems(session.id);
      const lineItems = lineItemsResponse.data;

      const shippingAddress =
        session.shipping ||
        session.customer_details?.shipping ||
        {};

      try {
        const printifyOrder = await sendOrderToPrintify(session, lineItems, shippingAddress);
        console.log('✅ Printify order created:', printifyOrder.id);
      } catch (printifyError) {
        console.error('❌ Failed to create Printify order:', printifyError);
      }
    } else {
      console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Webhook handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
