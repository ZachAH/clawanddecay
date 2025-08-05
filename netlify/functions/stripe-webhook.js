const path = require('path');
const fs = require('fs');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const admin = require('firebase-admin');
const fetch = require('node-fetch');
const StripeModule = require('stripe');

const variantMapPath = path.join(__dirname, 'variant-map.json');
let variantIdToPrintifyMap = {};
try {
  variantIdToPrintifyMap = JSON.parse(fs.readFileSync(variantMapPath, 'utf8'));
} catch (e) {
  console.error('Failed to load variant-map.json:', e);
}

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

//have to run update manually other failures ensue
async function getCachedProducts() {
  const bucket = admin.storage().bucket();
  const file = bucket.file('cached-products.json');
  const [raw] = await file.download();
  const productsData = JSON.parse(raw.toString('utf8'));
  return productsData.data || productsData;
}

function mapToPrintifyVariant(variantId) {
  return variantIdToPrintifyMap[variantId] || null;
}

async function sendOrderToPrintify(session, productVariants, shippingAddress) {
  console.log('Preparing Printify order from Stripe session:', session.id);

  const printifyLineItems = [];

  // Choose a default or dominant print provider ID for the whole order
  // For example, use the first variant's provider as a default
  let printProviderId = 29; // Default fallback

  for (const variant of productVariants) {
    const mapping = mapToPrintifyVariant(variant.id);
    if (!mapping) {
      throw new Error(`No Printify mapping found for variant ID ${variant.id}`);
    }

    const printifyProductId = mapping.product_id;
    const printifyVariantId = Number(variant.id);

    //console.log(`Mapped variant ID ${variant.id} → product_id=${printifyProductId}, variant_option_id=${printifyVariantId}`);

    // Fetch product to get available print providers
    const productResp = await fetch(
      `https://api.printify.com/v1/shops/${process.env.PRINTIFY_SHOP_ID}/products/${printifyProductId}.json`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!productResp.ok) {
      const body = await productResp.text();
      throw new Error(`Failed to fetch Printify product ${printifyProductId}: ${productResp.status} ${body}`);
    }
    
    // Determine print provider ID based on variant title
    const providerMap = {
      'LONG-SLEEVE': 99,
      'TEE': 29,
    };

    for (const key of Object.keys(providerMap)) {
      if (variant.title && variant.title.toUpperCase().includes(key)) {
        printProviderId = providerMap[key];
        break;
      }
    }
    console.log(`Assigned print_provider_id=${printProviderId} for variant title: "${variant.title}"`);

    // Add line item WITHOUT print_provider_id here
    const lineItem = {
      product_id: printifyProductId,
      variant_id: printifyVariantId,
      quantity: variant.quantity,
    };

    console.log('Adding line item:', JSON.stringify(lineItem, null, 2));
    printifyLineItems.push(lineItem);
  }

  const orderData = {
    external_id: session.id,
    label: `Order ${session.id}`,
    send_shipping_notification: true,
    print_provider_id: printProviderId,  // <-- print_provider_id at top level here
    line_items: printifyLineItems,
    shipping_address: {
      first_name: (shippingAddress?.name || '').split(' ')[0] || 'Customer',
      last_name: ((shippingAddress?.name || '').split(' ')[1] || ''),
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

      // Pull variant IDs that you attached in the session metadata
      let variantIds = [];
      try {
        variantIds = JSON.parse(session.metadata?.order_variant_ids || '[]');
      } catch (e) {
        console.warn('Failed to parse variant IDs from session metadata:', e);
      }

      // Get line items to potentially cross-check quantities / fallback
      const lineItemsResponse = await stripe.checkout.sessions.listLineItems(session.id);
      const lineItems = lineItemsResponse.data;

      // Load cached products to resolve variant details
      const products = await getCachedProducts();
      const findVariantById = (variantId) => {
        const idNum = Number(variantId);
        for (const product of products) {
          if (product.variants) {
            const variant = product.variants.find(v => Number(v.id) === idNum);
            if (variant) return variant;
          }
        }
        return null;
      };

      // Build productVariants array: { id, quantity, title }
      const productVariants = variantIds
        .map(variantId => {
          const variant = findVariantById(variantId);
          if (!variant) {
            console.warn(`Variant ID ${variantId} not found in cached products`);
            return null;
          }

          // Try to read quantity from Stripe line items via metadata or description fallback
          const lineItem = lineItems.find(item => {
            return (
              item.price_data?.product_data?.metadata?.variant_id === String(variantId) ||
              item.description?.includes(variant.title)
            );
          });
          return {
            id: variantId,
            quantity: lineItem?.quantity || 1,
            title: variant.title,
          };
        })
        .filter(Boolean);

      const shippingAddress =
        session.shipping ||
        session.customer_details?.shipping ||
        session.customer_details || {};

      if (productVariants.length === 0) {
        console.warn('No product variants to send to Printify, skipping order creation');
      } else {
        try {
          const printifyOrder = await sendOrderToPrintify(session, productVariants, shippingAddress);
          console.log('✅ Printify order created:', printifyOrder.id);
        } catch (printifyError) {
          console.error('❌ Failed to create Printify order:', printifyError);
        }
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
