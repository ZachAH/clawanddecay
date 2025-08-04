// netlify/functions/create-checkout-session.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const bucket = process.env.FIREBASE_STORAGE_BUCKET;

exports.handler = async function(event, context) {
  // Handle CORS preflight for Netlify
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',  // restrict in production
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: 'OK',
    };
  }

  try {
    const { items } = JSON.parse(event.body);

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

    // Helper: find variant by id in cached products data
    const findVariantById = (variantId) => {
      for (const product of productsData) {
        if (product.variants && Array.isArray(product.variants)) {
          const variant = product.variants.find(v => v.id === variantId);
          if (variant) return variant;
        }
      }
      return null;
    };

    // Build Stripe line_items array securely
    const line_items = items.map(({ id, quantity }) => {
      const variant = findVariantById(id);
      if (!variant) throw new Error(`Variant with id ${id} not found`);
      if (variant.is_enabled === false) throw new Error(`Variant with id ${id} is disabled`);

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
          unit_amount: variant.price,  // assumed in cents
        },
        quantity,
      };
    });

    // Create Stripe Checkout session
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
        'Access-Control-Allow-Origin': '*',  // tighten in prod!
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
