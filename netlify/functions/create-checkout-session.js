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

    // Modified to return both the product and variant
    const findProductAndVariant = (productId, variantId) => {
      const product = products.find(p => p.id === productId);
      if (!product) return null;
      
      const idNum = Number(variantId);
      const variant = product.variants.find(v => Number(v.id) === idNum);
      if (!variant) return null;

      return { product, variant };
    };

    const line_items = items.map(({ productId, variantId, quantity }) => {
      const productAndVariant = findProductAndVariant(productId, variantId);
      if (!productAndVariant) {
        throw new Error(`Variant ${variantId} for product ${productId} not found`);
      }
      
      const { product, variant } = productAndVariant;
      
      if (!variant.is_enabled || !variant.is_available) {
        throw new Error(`Variant ${variantId} is unavailable`);
      }

      // --- THE FIX IS HERE ---
      // Combine the product and variant titles for a descriptive name
      const itemName = `${product.title} - ${variant.title}`;

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: itemName, // Now using the full, descriptive name
            metadata: {
              sku: variant.sku || '',
              variant_id: String(variant.id),
              product_id: productId,
            },
          },
          unit_amount: variant.price,
          tax_behavior: 'exclusive',
        },
        quantity: Number(quantity),
      };
    });

    console.log('Received these items from the frontend:', JSON.stringify(items, null, 2));
    console.log('Sending to Stripe with these line items:', JSON.stringify(line_items, null, 2));

    const orderItemsForMetadata = items.map(i => ({ productId: i.productId, variantId: i.variantId }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 475, // $4.75 in cents
              currency: 'usd',
            },
            display_name: 'Standard Shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 5,
              },
              maximum: {
                unit: 'business_day',
                value: 7,
              },
            },
          },
        },
      ],
      phone_number_collection: {
        enabled: true
      },
      billing_address_collection: 'required',
      line_items,
      allow_promotion_codes: true,
      success_url: 'https://clawanddecay.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://clawanddecay.com/cancel',
      metadata: {
        order_items: JSON.stringify(orderItemsForMetadata),
      },
      automatic_tax: {
        enabled: true,
      },
      tax_id_collection: {
        enabled: true,
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