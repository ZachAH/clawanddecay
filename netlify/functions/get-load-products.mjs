import { schedule } from '@netlify/functions';
import fetch from 'node-fetch';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // uses env var
  });
}

const bucket = getStorage().bucket(); // uses the default bucket set above

const loadProductsHandler = async () => {
  console.log('productLoadHandler started.');

  const shopId = process.env.PRINTIFY_SHOP_ID;
  const apiKey = process.env.PRINTIFY_API_TOKEN; // match env var name

  if (!shopId || !apiKey) {
    console.error('Missing PRINTIFY_SHOP_ID or PRINTIFY_API_TOKEN.');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing API credentials.' }),
    };
  }

  try {
    console.log(`Fetching from Printify API for shopId: ${shopId}`);
    const response = await fetch(`https://api.printify.com/v1/shops/${shopId}/products.json`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Printify API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`Fetched ${data.length} products.`);

    const fileName = 'cached-products.json';
    const file = bucket.file(fileName);

    await file.save(JSON.stringify(data), {
      contentType: 'application/json',
      metadata: { cacheControl: 'public, max-age=300' },
    });

    console.log(`Saved ${fileName} to Cloud Storage.`);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Product cache updated', count: data.length }),
    };
  } catch (err) {
    console.error('Error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

export const handler = schedule('0 */6 * * *', loadProductsHandler);
//export const handler = schedule('* * * * *', loadProductsHandler);

