// netlify/functions/get-products.js

// Note: Node.js 18+ has native 'fetch'. If using older Node, install 'node-fetch' and import it.

exports.handler = async function(event, context) {
  try {
    const PRINTIFY_API_TOKEN = process.env.PRINTIFY_API_TOKEN;
    const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;
    const FIREBASE_BUCKET_NAME = process.env.FIREBASE_STORAGE_BUCKET;

    if (!PRINTIFY_API_TOKEN || !PRINTIFY_SHOP_ID || !FIREBASE_BUCKET_NAME) {
      console.error("Function Error: Missing environment variables.");
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Server configuration error: Missing Printify API token, Shop ID, or Firebase bucket env variables.",
          debug: {
            tokenSet: !!PRINTIFY_API_TOKEN,
            shopIdSet: !!PRINTIFY_SHOP_ID,
            bucketSet: !!FIREBASE_BUCKET_NAME
          }
        })
      };
    }

    const printifyApiUrl = `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products.json`;

    const response = await fetch(printifyApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PRINTIFY_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Printify API Error (${response.status}):`, errorText);
      return {
        statusCode: response.status,
        body: JSON.stringify({
          message: `Error from Printify API: ${response.statusText}`,
          details: errorText
        })
      };
    }

    const productsData = await response.json();

    // --- Start of image URL rewriting ---
    productsData.data.forEach(product => {
      product.images = (product.images || []).map(image => {
        const originalUrl = image.src;
        const fileName = originalUrl.split('/').pop().split('?')[0]; // Remove query params

        // Construct Firebase Storage public URL
        const firebaseUrl = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(FIREBASE_BUCKET_NAME)}/o/${encodeURIComponent('products/' + product.id + '/' + fileName)}?alt=media`;
        return {
          ...image,
          src: firebaseUrl
        };
      });
    });
    // --- End of image URL rewriting ---

    // Debug: Log first product’s rewritten image URLs
    console.log('Sample product images after rewrite:', 
      productsData.data.slice(0, 1).map(p => p.images.map(img => img.src))
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(productsData)
    };

  } catch (error) {
    console.error('Unhandled Error in Netlify Function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to fetch products due to an unexpected server error.',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};
