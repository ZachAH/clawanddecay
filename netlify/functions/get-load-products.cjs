const fetch = require('node-fetch');
const admin = require('firebase-admin');
const { schedule } = require('@netlify/functions'); // For scheduled execution

// Initialize Firebase Admin SDK if it hasn't been initialized
// This check prevents re-initialization in subsequent invocations if the function instance persists
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // Your Firebase Storage bucket name
  });
}

// Get a reference to the Firebase Storage bucket
const bucket = admin.storage().bucket();

// Define the handler function for loading products
const productLoadHandler = async function () {
  const shopId = process.env.PRINTIFY_SHOP_ID;
  const apiKey = process.env.PRINTIFY_API_KEY;

  try {
    // 1. Fetch data from Printify API
    const response = await fetch(`https://api.printify.com/v1/shops/${shopId}/products.json`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Printify API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const fileName = 'cached-products.json'; // The name of the file in your storage bucket
    const file = bucket.file(fileName);

    // 2. Write the fetched data to Firebase Cloud Storage
    await file.save(JSON.stringify(data), {
      contentType: 'application/json',
      // Optional: Set cache control headers for better client-side caching if you serve this file directly later
      metadata: { cacheControl: 'public, max-age=300' } // Example: cache for 5 minutes
    });

    console.log(`Successfully updated ${fileName} in Cloud Storage. Products found: ${data.length}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Product cache updated in Cloud Storage', count: data.length }),
    };
  } catch (err) {
    console.error('Failed to load or update product cache:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'An unexpected error occurred.' }),
    };
  }
};

// Export the handler with a schedule. This will make it a Netlify Scheduled Function.
// Example: Run every 6 hours (0 */6 * * *)
// You can adjust the cron schedule to your needs: https://crontab.guru/
exports.handler = schedule('0 */6 * * *', productLoadHandler);

// If you also want to be able to manually trigger this function via an HTTP request,
// you can optionally export it separately. The scheduled function will not be callable via HTTP by default.
// exports.manualTrigger = productLoadHandler;