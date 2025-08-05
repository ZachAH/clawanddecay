import { schedule } from '@netlify/functions';
import fetch from 'node-fetch';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin SDK once
if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const bucket = getStorage().bucket();

const loadProductsHandler = async () => {
  console.log('productLoadHandler started.');

  const shopId = process.env.PRINTIFY_SHOP_ID;
  const apiKey = process.env.PRINTIFY_API_TOKEN;

  if (!shopId || !apiKey) {
    console.error('Missing PRINTIFY_SHOP_ID or PRINTIFY_API_TOKEN.');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing API credentials.' }),
    };
  }

  const fileName = 'cached-products.json';
  const file = bucket.file(fileName);

  try {
    // 1. Download existing cached-products.json from Firebase Storage
    let existingData = {};
    try {
      const [buffer] = await file.download();
      existingData = JSON.parse(buffer.toString());
      console.log('✅ Existing cached-products.json downloaded and parsed.');
    } catch (e) {
      console.log('No existing cached-products.json found or failed to parse, starting fresh.');
      existingData = {};
    }

    // 2. Fetch fresh data from Printify API
    console.log(`Fetching fresh data from Printify API for shopId: ${shopId}`);
    const response = await fetch(`https://api.printify.com/v1/shops/${shopId}/products.json`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Printify API error: ${response.status} - ${errorText}`);
    }

    const freshData = await response.json();
    const freshProducts = freshData.data || [];
    console.log(`Fetched ${freshProducts.length} fresh products.`);

    // 3. Merge fresh data with existing cached data, preserving manual changes
    const existingProducts = existingData.data || [];

    const mergedProducts = freshProducts.map(newProduct => {
      const oldProduct = existingProducts.find(p => p.id === newProduct.id);
      if (!oldProduct) return newProduct;

      return {
        ...newProduct,
        images: (oldProduct.images && oldProduct.images.length) ? oldProduct.images : newProduct.images,
      };
    });

    const mergedData = {
      ...freshData,
      data: mergedProducts,
    };

    // 4. Save merged data back to Firebase Storage
    await file.save(JSON.stringify(mergedData), {
      contentType: 'application/json',
      metadata: { cacheControl: 'public, max-age=300' },
    });

    console.log(`✅ Saved merged cached-products.json to Cloud Storage.`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Product cache updated with merge', count: mergedProducts.length }),
    };
  } catch (err) {
    console.error('Error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

// Scheduled function: runs every 6 hours
export const scheduledHandler = schedule('0 */6 * * *', loadProductsHandler);

// Manual trigger handler: HTTP endpoint for POST requests
export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { Allow: 'POST' },
      body: 'Method Not Allowed. Use POST to trigger the product cache update.',
    };
  }

  try {
    const result = await loadProductsHandler();
    return {
      statusCode: 200,
      body: result.body,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
