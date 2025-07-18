import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { URL } from 'url';

if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const bucket = getStorage().bucket();
const bucketName = process.env.FIREBASE_STORAGE_BUCKET;

export const handler = async () => {
  const fileName = 'cached-products.json';
  const file = bucket.file(fileName);

  try {
    const [exists] = await file.exists();
    if (!exists) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'No cached product data available.' }),
      };
    }

    const [raw] = await file.download();
    const data = JSON.parse(raw.toString('utf8'));

    // If your JSON is an array of products
    const products = Array.isArray(data) ? data : [data];

    for (const product of products) {
      const productId = product.id;
      if (!productId || !product.images) continue;

      product.images = product.images.map((image) => {
        try {
          const oldSrc = new URL(image.src);
          const filename = oldSrc.pathname.split('/').pop(); // grab filename from URL
          const encodedPath = encodeURIComponent(`products/${productId}/${filename}`);
          const newSrc = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`;

          return {
            ...image,
            src: newSrc,
          };
        } catch (err) {
          console.warn('Failed to parse or update image:', err);
          return image; // fallback to original
        }
      });
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Array.isArray(data) ? products : products[0]),
    };
  } catch (err) {
    console.error('Failed to process cached product data:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to read or process data.' }),
    };
  }
};
