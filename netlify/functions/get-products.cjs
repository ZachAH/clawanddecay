// netlify/functions/get-products.js

exports.handler = async function(event, context) {
  try {
    const PRINTIFY_API_TOKEN_NEW = process.env.PRINTIFY_API_TOKEN_NEW;
    const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;
    const FIREBASE_BUCKET_NAME = process.env.FIREBASE_STORAGE_BUCKET;

    if (!PRINTIFY_API_TOKEN_NEW || !PRINTIFY_SHOP_ID || !FIREBASE_BUCKET_NAME) {
      console.error("Function Error: Missing environment variables.");
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Server configuration error: Missing Printify API token, Shop ID, or Firebase bucket env variables.",
          debug: {
            tokenSet: !!PRINTIFY_API_TOKEN_NEW,
            shopIdSet: !!PRINTIFY_SHOP_ID,
            bucketSet: !!FIREBASE_BUCKET_NAME
          }
        })
      };
    }

    const printifyProductsApiUrl = `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products.json`;

    const productsResponse = await fetch(printifyProductsApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PRINTIFY_API_TOKEN_NEW}`,
        'Content-Type': 'application/json'
      }
    });

    if (!productsResponse.ok) {
      const errorText = await productsResponse.text();
      console.error(`Printify Products API Error (${productsResponse.status}):`, errorText);
      return {
        statusCode: productsResponse.status,
        body: JSON.stringify({
          message: `Error from Printify Products API: ${productsResponse.statusText}`,
          details: errorText
        })
      };
    }

    const productsData = await productsResponse.json();

    // --- Start of image URL fetching and rewriting ---
    // Use Promise.all to fetch mockups for all products concurrently
    const productsWithImages = await Promise.all(productsData.data.map(async product => {
      try {
        // Adjust this URL based on Printify's actual Mockup API endpoint
        // It might be using 'uploads/{upload_id}/mockups.json' if images are tied to design uploads
        // Or 'shops/{shop_id}/products/{product_id}/mockups.json'
        const printifyMockupApiUrl = `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products/${product.id}/mockups.json`; // Assuming this endpoint

        const mockupResponse = await fetch(printifyMockupApiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${PRINTIFY_API_TOKEN_NEW}`,
            'Content-Type': 'application/json'
          }
        });

        if (!mockupResponse.ok) {
          const mockupErrorText = await mockupResponse.text();
          console.warn(`Printify Mockup API Error for product ${product.id} (${mockupResponse.status}):`, mockupErrorText);
          // If mockups fail, return the product without images or with default images
          return { ...product, images: [] }; // Or handle as needed
        }

        const mockupData = await mockupResponse.json();
        const originalImages = mockupData.map(mockup => ({ src: mockup.src })); // Extract src from mockups

        product.images = originalImages.map(image => {
          const originalUrl = image.src;
          // Example: original Printify URL might be https://cdn.printify.com/upload-id/file-name.jpg
          const fileName = originalUrl.split('/').pop().split('?')[0];

          // Construct Firebase Storage public URL
          // This part should be correct based on your Firebase structure (products/product_id/file_name)
          const firebaseUrl = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(FIREBASE_BUCKET_NAME)}/o/${encodeURIComponent('products/' + product.id + '/' + fileName)}?alt=media`;

          return {
            ...image, // Keep other image properties if any
            src: firebaseUrl
          };
        });
        return product;

      } catch (mockupError) {
        console.error(`Error fetching mockups for product ${product.id}:`, mockupError);
        return { ...product, images: [] }; // Return product without images on error
      }
    }));
    // --- End of image URL fetching and rewriting ---

    // Debug: Log first product’s rewritten image URLs
    console.log('Sample product images after rewrite:',
      productsWithImages.slice(0, 1).map(p => p.images.map(img => img.src))
    );

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        current_page: productsData.current_page, // Keep original pagination info
        data: productsWithImages
      })
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