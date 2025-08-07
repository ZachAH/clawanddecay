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

// Product IDs to exclude completely
const EXCLUDED_PRODUCT_IDS = [
  '6892909bbe2bf49f2005a4cc',
  '6892915a18389fe78d00abed',
  '68929096be2bf49f2005a4c7',
];

const loadProductsHandler = async () => {
  console.log('productLoadHandler started.');

  const shopId = process.env.PRINTIFY_SHOP_ID;
  const apiKey = process.env.PRINTIFY_API_TOKEN_NEW;

  if (!shopId || !apiKey) {
    console.error('Missing PRINTIFY_SHOP_ID or PRINTIFY_API_TOKEN_NEW.');
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

    const existingProducts = existingData.data || [];

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

    // Filter out excluded products and keep only enabled variants
    const freshProducts = (freshData.data || [])
      .filter(product => product.variants?.some(variant => variant.is_enabled))
      .filter(product => !EXCLUDED_PRODUCT_IDS.includes(product.id));

    console.log(`Fetched ${freshProducts.length} fresh products after excluding.`);

    // 3. Merge fresh with existing, and filter variants inside
    const mergedProducts = freshProducts.map(newProduct => {
      const oldProduct = existingProducts.find(p => p.id === newProduct.id);
      const enabledVariants = newProduct.variants?.filter(variant => variant.is_enabled) || [];

      return {
        ...newProduct,
        variants: enabledVariants,
        images: (oldProduct?.images?.length) ? oldProduct.images : newProduct.images,
      };
    });

    // Optional: filter out any product with 0 remaining variants
    const cleanedProducts = mergedProducts.filter(product => product.variants.length > 0);

    const mergedData = {
      ...freshData,
      data: cleanedProducts,
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

export const handler = schedule('0 */6 * * *', loadProductsHandler); // runs every 6 hours
//export const handler = schedule('* * * * *', loadProductsHandler); // for testing every minute
