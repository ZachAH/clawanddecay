import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const bucket = getStorage().bucket();

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

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: raw.toString('utf8'),
    };
  } catch (err) {
    console.error('Failed to read cached product data:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to read cached data.' }),
    };
  }
};
