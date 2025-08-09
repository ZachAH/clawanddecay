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

// Function to calculate dynamic shipping costs
function calculateDynamicShipping(cartItems, products) {
  if (cartItems.length === 0) return 0;

  const rates = [];

  for (const item of cartItems) {
    const product = products.find(p => p.id === item.productId);
    
    // Fallback to a common T-shirt shipping provider if product data is missing
    if (product && product.print_details && product.print_details.length > 0) {
        const shipping = product.print_details[0]?.shipping;
        if (shipping) {
            rates.push({
                base: shipping.cost,
                additional: shipping.additional_item_cost
            });
            continue; // Move to the next item
        }
    }
    
    // This is the fallback if no shipping details are found in the product data
    console.log(`Warning: No shipping rates found for product ${item.productId}. Using a default fallback rate.`);
    const fallbackBaseRate = 475; // $4.75
    const fallbackAdditionalRate = 250; // $2.50
    rates.push({ base: fallbackBaseRate, additional: fallbackAdditionalRate });
  }

  // Sort by base cost to find the highest
  rates.sort((a, b) => b.base - a.base);
  
  const highestBaseShipping = rates[0].base;
  const totalShipping = rates.slice(1).reduce((sum, rate) => sum + rate.additional, highestBaseShipping);

  // Return the total shipping in cents
  return totalShipping;
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

      const itemName = `${product.title} - ${variant.title}`;

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: itemName,
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

    const dynamicShippingCost = calculateDynamicShipping(items, products);
    
    console.log('Sending to Stripe with these line items:', JSON.stringify(line_items, null, 2));
    console.log('Calculated dynamic shipping cost:', dynamicShippingCost);

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
              amount: dynamicShippingCost, // Use the dynamically calculated cost
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