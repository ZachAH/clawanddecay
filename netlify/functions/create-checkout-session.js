// netlify/functions/create-checkout-session.js

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const admin = require('firebase-admin');

let stripe; // cache Stripe client

// Initialize Firebase Admin once
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // e.g. your-project-id.appspot.com
  });
}
const bucket = admin.storage().bucket();

// Secret Manager client
const secretClient = new SecretManagerServiceClient({
  credentials: JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT),
});

// Helper: fetch latest version of secret named "STRIPE_SECRET_KEY"
async function accessStripeSecret() {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  const projectId = serviceAccount.project_id;
  const name = `projects/${projectId}/secrets/STRIPE_SECRET_KEY/versions/latest`;
  const [version] = await secretClient.accessSecretVersion({ name });
  return version.payload.data.toString('utf8');
}

exports.handler = async function(event, context) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // tighten in production
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: 'OK',
    };
  }

  try {
    // Lazy init Stripe client by fetching secret key once
    if (!stripe) {
      const stripeSecretKey = await accessStripeSecret();
      if (!stripeSecretKey) {
        throw new Error('Failed to retrieve Stripe secret from Secret Manager.');
      }
      const Stripe = require('stripe');
      stripe = Stripe(stripeSecretKey);
    }

    const { items } = JSON.parse(event.body || '{}');
    if (!items || !Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'No items provided' }),
      };
    }

    // Download cached products JSON from Firebase Storage
    const file = bucket.file('cached-products.json');
    const [raw] = await file.download();
    const productsData = JSON.parse(raw.toString('utf8'));

    // If your products are inside productsData.data, adjust here:
    const products = productsData.data || productsData;

    if (!Array.isArray(products)) {
      throw new Error('Invalid cached products format: expected array in data field');
    }

    // Helper to find variant by id (adjust if your structure differs)
    const findVariantById = (variantId) => {
      // Normalize variantId to number for comparison (assuming input may be string)
      const idNum = Number(variantId);
    
      for (const product of products) {
        if (product.variants && Array.isArray(product.variants)) {
          const variant = product.variants.find(v => Number(v.id) === idNum);
          if (variant) return variant;
        }
      }
      return null;
    };

    // Build Stripe line_items array
    const line_items = items.map(({ id, quantity }) => {
      const variant = findVariantById(id);
      if (!variant) throw new Error(`Variant with id ${id} not found`);
      if (!variant.is_enabled || !variant.is_available) {
        throw new Error(`Variant with id ${id} is disabled or unavailable`);
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
          unit_amount: variant.price, // price in cents
        },
        quantity,
      };
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url: 'https://clawanddecay.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://clawanddecay.com/cancel',
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // tighten in prod
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
