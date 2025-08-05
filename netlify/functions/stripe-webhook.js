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
  console.log('🛠️ [sendOrderToPrintify] Starting with session:', JSON.stringify(session, null, 2));
  console.log('🛠️ [sendOrderToPrintify] Received productVariants:', JSON.stringify(productVariants, null, 2));

  const printifyLineItems = [];

  for (const variant of productVariants) {
    console.log(`🔁 Processing variant: ${JSON.stringify(variant, null, 2)}`);
    const mapping = mapToPrintifyVariant(variant.id);
    console.log(`📘 Variant mapping result: ${JSON.stringify(mapping, null, 2)}`);

    if (!mapping) {
      throw new Error(`No Printify mapping found for variant ID ${variant.id}`);
    }

    const printifyProductId = mapping.product_id;
    const printifyVariantId = mapping.variant_option_ids[0];

    console.log(`Mapped variant ID ${variant.id} → product_id=${printifyProductId}, variant_option_id=${printifyVariantId}`);

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

    const productDetail = await productResp.json();
    console.log('📦 Full product detail response from Printify:', JSON.stringify(productDetail, null, 2));

    const availableProviders = productDetail.available_print_providers || [];
    if (availableProviders.length === 0) {
      throw new Error(`No print providers available for product ${printifyProductId}`);
    }
    console.log(`Product ${printifyProductId} has ${availableProviders.length} available print providers.`);

    const providerMap = {
      'LONG-SLEEVE': 99,
      'TEE': 29,
    };

    let printProviderId = 29;
    for (const key of Object.keys(providerMap)) {
      if (variant.title && variant.title.toUpperCase().includes(key)) {
        printProviderId = providerMap[key];
        break;
      }
    }

    console.log(`Assigned print_provider_id=${printProviderId} for variant title: "${variant.title}"`);

    const lineItem = {
      product_id: printifyProductId,
      variant_id: printifyVariantId,
      quantity: variant.quantity,
      print_provider_id: printProviderId,
    };

    console.log('Adding line item:', JSON.stringify(lineItem, null, 2));
    printifyLineItems.push(lineItem);
  }

  const orderData = {
    external_id: session.id,
    label: `Order ${session.id}`,
    send_shipping_notification: true,
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

  console.log('📤 Final order payload to Printify:', JSON.stringify(orderData, null, 2));

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
  console.log('✅ Printify order creation successful:', jsonResponse);
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

  console.log('⚡ Incoming webhook request body:', event.body);
  console.log('⚡ Incoming headers:', JSON.stringify(event.headers, null, 2));

  try {
    if (!stripe) {
      const stripeSecretKey = await accessSecret('STRIPE_SECRET_KEY');
      stripe = StripeModule(stripeSecretKey);
    }
    if (!signingSecret) {
      signingSecret = await accessSecret('SIGNING_SECRET');
    }

    const sig = event.headers['stripe-signature'];
    console.log('🔐 Stripe Signature:', sig);
    if (!sig) throw new Error('Missing Stripe signature header');

    let stripeEvent;
    try {
      stripeEvent = stripe.webhooks.constructEvent(event.body, sig, signingSecret);
      console.log('✅ Stripe event constructed successfully:', stripeEvent.type);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return { statusCode: 400, body: `Webhook Error: ${err.message}` };
    }

    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object;
      console.log('🧾 Stripe session received:', JSON.stringify(session, null, 2));
      console.log('🧾 Stripe metadata (raw):', session.metadata);

      let variantIds = [];
      try {
        variantIds = JSON.parse(session.metadata?.order_variant_ids || '[]');
      } catch (e) {
        console.warn('Failed to parse variant IDs from session metadata:', e);
      }

      const lineItemsResponse = await stripe.checkout.sessions.listLineItems(session.id);
      const lineItems = lineItemsResponse.data;
      console.log('📦 Stripe line items:', JSON.stringify(lineItems, null, 2));
      console.log('📦 Variant IDs from metadata:', variantIds);

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

      const productVariants = variantIds
        .map(variantId => {
          console.log(`🔍 Looking up variant ID: ${variantId}`);
          const variant = findVariantById(variantId);
          if (!variant) {
            console.warn(`⚠️ Variant ID ${variantId} not found in cached products`);
            return null;
          }

          const lineItem = lineItems.find(item => {
            return (
              item.price_data?.product_data?.metadata?.variant_id === String(variantId) ||
              item.description?.includes(variant.title)
            );
          });
          if (!lineItem) {
            console.warn(`⚠️ Line item not found for variant: ${variantId}`);
          }
          console.log(`✅ Mapped variant (${variantId}) with title: "${variant.title}" and quantity: ${lineItem?.quantity || 1}`);

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

      console.log('📮 Shipping address resolved:', JSON.stringify(shippingAddress, null, 2));

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