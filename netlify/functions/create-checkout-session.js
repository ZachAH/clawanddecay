// netlify/functions/create-checkout-session.js

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const admin = require('firebase-admin');

let stripe; // cache Stripe client

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

async function accessStripeSecret() {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  const projectId = serviceAccount.project_id;
  const name = `projects/${projectId}/secrets/STRIPE_SECRET_KEY/versions/latest`;
  const [version] = await secretClient.accessSecretVersion({ name });
  return version.payload.data.toString('utf8');
}

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: 'OK',
    };
  }

  try {
    if (!stripe) {
      const stripeSecretKey = await accessStripeSecret();
      if (!stripeSecretKey) throw new Error('Failed to retrieve Stripe secret');
      const Stripe = require('stripe');
      stripe = Stripe(stripeSecretKey);
    }

    const { items } = JSON.parse(event.body || '{}');
    if (!items?.length) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'No items provided' }),
      };
    }

    // Load cached product data from Firebase Storage
    const file = bucket.file('cached-products.json');
    const [raw] = await file.download();
    const productsData = JSON.parse(raw.toString('utf8'));
    const products = productsData.data || productsData;

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

    const line_items = items.map(({ id, quantity }) => {
      const variant = findVariantById(id);
      if (!variant) throw new Error(`Variant ${id} not found`);
      if (!variant.is_enabled || !variant.is_available) {
        throw new Error(`Variant ${id} is unavailable`);
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: variant.title,
            metadata: {
              sku: variant.sku || '',
              variant_id: String(variant.id),
            },
          },
          unit_amount: variant.price,
        },
        quantity: Number(quantity),
      };
    });

    // Add variant IDs as JSON metadata string
    const variantIdsForMetadata = items.map(i => i.id);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      phone_number_collection: {
        enabled: true
      },
      billing_address_collection: 'required',
      line_items,
      allow_promotion_codes: true,
      success_url: 'https://clawanddecay.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://clawanddecay.com/cancel',
      metadata: {
        order_variant_ids: JSON.stringify(variantIdsForMetadata),
      },
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    console.error('Checkout Session Error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
