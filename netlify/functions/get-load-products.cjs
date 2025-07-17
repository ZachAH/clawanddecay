// netlify/functions/get-load-products.cjs
const admin = require('firebase-admin');
const { schedule } = require('@netlify/functions');

// Declare a variable for node-fetch at the top
let fetch;

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const bucket = admin.storage().bucket();

const productLoadHandler = async function () {
  console.log('productLoadHandler started.');

  // Dynamically import node-fetch inside the handler
  // This ensures it's loaded asynchronously and correctly
  if (!fetch) {
    // We use a try-catch here as dynamic imports can fail
    try {
      const nodeFetchModule = await import('node-fetch');
      fetch = nodeFetchModule.default; // node-fetch exports its main function as 'default'
      console.log('node-fetch imported dynamically.');
    } catch (e) {
      console.error('Failed to dynamically import node-fetch:', e.message);
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to load fetch module.' }) };
    }
  }

  const shopId = process.env.PRINTIFY_SHOP_ID;
  const apiKey = process.env.PRINTIFY_API_KEY;

  if (!shopId || !apiKey) {
    console.error('Missing PRINTIFY_SHOP_ID or PRINTIFY_API_KEY environment variables.');
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing API credentials.' }) };
  }
  console.log('API credentials appear to be present.');

  try {
    console.log(`Fetching from Printify API for shopId: ${shopId}`);
    const response = await fetch(`https://api.printify.com/v1/shops/${shopId}/products.json`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    console.log(`Printify API response status: ${response.status}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Printify API returned non-OK status: ${response.status} - ${errorText}`);
      throw new Error(`Printify API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`Successfully fetched ${data.length} products from Printify.`);

    const fileName = 'cached-products.json';
    const file = bucket.file(fileName);

    console.log(`Attempting to save to Firebase Storage file: ${fileName}`);
    await file.save(JSON.stringify(data), {
      contentType: 'application/json',
      metadata: { cacheControl: 'public, max-age=300' }
    });
    console.log(`Successfully saved ${fileName} to Cloud Storage.`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Product cache updated in Cloud Storage', count: data.length }),
    };
  } catch (err) {
    console.error('Error during product load and cache update:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'An unexpected error occurred during API fetch or Firebase write.' }),
    };
  }
};

exports.handler = schedule('0 */6 * * *', productLoadHandler);