import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin SDK
// This ensures Firebase is initialized only once across Netlify function invocations
if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // This is the bucket name, e.g., "your-project-id.appspot.com"
  });
}

const bucket = getStorage().bucket();

export const handler = async (event, context) => {
  const fileName = 'cached-products.json';
  const file = bucket.file(fileName);

  try {
    // Check if the cached file exists in Firebase Storage
    const [exists] = await file.exists();
    if (!exists) {
      console.warn(`Cached file '${fileName}' not found in Firebase Storage.`);
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `No cached product data available at ${fileName}.` }),
      };
    }

    // Download the raw JSON content from Firebase Storage
    const [raw] = await file.download();
    const productsData = JSON.parse(raw.toString('utf8')); // Parse the raw buffer into a JSON object

    // Defensive check: Ensure the data structure is as expected
    if (!productsData.data || !Array.isArray(productsData.data)) {
        console.warn("Cached data 'data' array is missing or not an array. Returning empty product list.");
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ current_page: 1, data: [] }) // Return empty or handle as appropriate
        };
    }

    // --- Apply Image URL Rewriting to the cached data ---
    // Use the correct bucket ID for URL construction (e.g., 'your-project-id.appspot.com')
    // This value MUST be correctly set in your Netlify environment variables.
    const FIREBASE_BUCKET_ID = process.env.FIREBASE_STORAGE_BUCKET;

    const productsWithRewrittenImages = productsData.data.map(product => {
        // Ensure product.images exists and is an array before mapping
        // The 'images' array in cached-products.json contains original Printify URLs.
        product.images = (product.images || []).map(image => {
            const originalUrl = image.src; // This is the original Printify URL from the cached JSON

            // Extract filename from the original Printify URL
            // Example: https://pfy-prod-products-mockup-media.s3.us-east-2.amazonaws.com/files/2025/07/FILENAME.png
            const fileName = originalUrl.split('/').pop().split('?')[0];

            // Construct the Firebase Storage public URL
            // This path must match your Firebase Storage structure: products/{product_id}/{image_file_name}
            const firebaseUrl = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(FIREBASE_BUCKET_ID)}/o/${encodeURIComponent('products/' + product.id + '/' + fileName)}?alt=media`;

            return {
                ...image, // Keep other image properties if any (e.g., position, variant_ids)
                src: firebaseUrl // Overwrite with the new Firebase URL
            };
        });
        return product;
    });

    // Log a sample to confirm rewriting is happening
    console.log('Sample cached product images AFTER dynamic rewrite:',
        productsWithRewrittenImages.slice(0, 1).map(p => p.images.map(img => img.src))
    );

    // Return the modified JSON data
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current_page: productsData.current_page, // Maintain original pagination info
        data: productsWithRewrittenImages
      }),
    };

  } catch (err) {
    console.error('Failed to read or process cached product data:', err); // Log full error object
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to read or process cached data.',
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined // Show stack in dev
      }),
    };
  }
};
