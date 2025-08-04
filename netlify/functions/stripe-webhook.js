// netlify/functions/stripe-webhook.js

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const admin = require('firebase-admin');
const fetch = require('node-fetch'); // npm install node-fetch@2 if needed
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

let stripe; // cached Stripe client
let signingSecret; // cached webhook signing secret

// Load variant map JSON once, from root folder
const variantIdToPrintifyMap = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../variant-map.json'), 'utf8')
);

// Initialize Firebase Admin once
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}
const bucket = admin.storage().bucket();

// Secret Manager client
const secretClient = new SecretManagerServiceClient({
  credentials: JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT),
});

// Helper: fetch secret by name from Google Secret Manager
async function accessSecret(secretName) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  const projectId = serviceAccount.project_id;
  const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
  const [version] = await secretClient.accessSecretVersion({ name });
  return version.payload.data.toString('utf8');
}

// Map your variant ID from Stripe metadata to Printify product/variant IDs
function mapToPrintifyVariant(variantId) {
  return variantIdToPrintifyMap[variantId] || null;
}

async function sendOrderToPrintify(session, lineItems, shippingAddress) {
  const printifyLineItems = lineItems.map(item => {
    // Assuming variantId is in metadata.variant_id inside product_data
    const variantId = item.price_data.product_data.metadata.variant_id;
    const printifyVariant = mapToPrintifyVariant(variantId);

    if (!printifyVariant) {
      throw new Error(`No Printify mapping found for variant ID ${variantId}`);
    }

    return {
      product_id: printifyVariant.product_id,
      variant_id: parseInt(variantId, 10), // Use the original variant ID as int if needed
      quantity: item.quantity,
    };
  });

  const orderData = {
    external_id: session.id,
    label: `Order ${session.id}`,
    send_shipping_notification: true,
    line_items: printifyLineItems,
    shipping_address: {
      first_name: shippingAddress.name?.split(' ')[0] || 'Customer',
      last_name: shippingAddress.name?.split(' ')[1] || '',
      address1: shippingAddress.address.line1,
      address2: shippingAddress.address.line2 || '',
      city: shippingAddress.address.city,
      region: shippingAddress.address.state,
      country: shippingAddress.address.country,
      zip: shippingAddress.address.postal_code,
      phone: shippingAddress.phone || '',
    },
  };

  const response = await fetch(
    `https://api.printify.com/v1/shops/${process.env.PRINTIFY_SHOP_ID}/orders.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Printify order creation failed: ${response.status} ${errorBody}`);
  }

  return await response.json();
}

exports.handler = async function(event, context) {
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
    // Lazy init Stripe client and webhook signing secret
    if (!stripe) {
      const stripeSecretKey = await accessSecret('STRIPE_SECRET_KEY');
      if (!stripeSecretKey) throw new Error('Missing STRIPE_SECRET_KEY');
      const Stripe = require('stripe');
      stripe = Stripe(stripeSecretKey);
    }
    if (!signingSecret) {
      signingSecret = await accessSecret('SIGNING_SECRET');
      if (!signingSecret) throw new Error('Missing SIGNING_SECRET');
    }

    // Verify webhook signature
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

      // Fetch line items for the session
      const lineItemsResponse = await stripe.checkout.sessions.listLineItems(session.id);
      const lineItems = lineItemsResponse.data;

      // Shipping info from Stripe session
      const shippingAddress = session.shipping || session.customer_details || {};
      if (!shippingAddress || !shippingAddress.address) {
        throw new Error('No shipping address found in session');
      }

      // Send order to Printify
      try {
        const printifyOrder = await sendOrderToPrintify(session, lineItems, shippingAddress);
        console.log('Printify order created:', printifyOrder.id);
      } catch (printifyError) {
        console.error('Failed to create Printify order:', printifyError);
        // Optionally: notify admin, retry, or save for manual intervention
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
