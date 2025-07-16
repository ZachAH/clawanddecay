const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if it hasn't been initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

// Get a reference to the Firebase Storage bucket
const bucket = admin.storage().bucket();

exports.handler = async function () {
  const fileName = 'cached-products.json'; // The name of the file you're expecting
  const file = bucket.file(fileName);

  try {
    // 1. Check if the file exists in the bucket
    const [exists] = await file.exists();
    if (!exists) {
      console.log(`${fileName} not found in Cloud Storage.`);
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'No cached product data available in Cloud Storage.' }),
      };
    }

    // 2. Download the file content
    const [raw] = await file.download(); // download() returns a Buffer

    console.log(`Successfully retrieved ${fileName} from Cloud Storage.`);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: raw.toString('utf8'), // Convert the Buffer to a UTF-8 string
    };
  } catch (err) {
    console.error('Failed to read cached product data from Cloud Storage:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to read cached product data from Cloud Storage.' }),
    };
  }
};