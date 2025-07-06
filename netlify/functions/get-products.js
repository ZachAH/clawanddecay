// netlify/functions/get-products.js

// This function acts as a secure proxy to fetch products from the Printify API.
// It uses environment variables for the API token and shop ID, keeping them secret.

// Note: Node.js 18+ has native 'fetch'. If you are using an older Node.js version
// (which is less common for new Netlify builds but possible), you might need to
// install 'node-fetch' (npm install node-fetch@2) and uncomment the line below:
// const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    // 1. Retrieve API token and Shop ID from Netlify environment variables.
    //    These MUST be set in your Netlify dashboard under Site Settings -> Build & Deploy -> Environment.
    const PRINTIFY_API_TOKEN = process.env.PRINTIFY_API_TOKEN;
    const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;

    // 2. Basic validation for missing environment variables.
    if (!PRINTIFY_API_TOKEN || !PRINTIFY_SHOP_ID) {
      console.error("Function Error: Missing environment variables.");
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Server configuration error: Printify API token or Shop ID missing. Please ensure they are set in Netlify environment variables.",
          debug: {
            tokenSet: !!PRINTIFY_API_TOKEN,
            shopIdSet: !!PRINTIFY_SHOP_ID
          }
        })
      };
    }

    // 3. Construct the Printify API URL to fetch products for your specific shop.
    //    This endpoint lists all products created by you within that shop.
    const printifyApiUrl = `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products.json`;

    // 4. Make the secure, server-side request to the Printify API.
    //    The Authorization header includes your API token.
    const response = await fetch(printifyApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PRINTIFY_API_TOKEN}`, // Authentication with your token
        'Content-Type': 'application/json'               // Specify content type
      }
    });

    // 5. Handle non-2xx HTTP responses from Printify (e.g., authentication errors, not found).
    if (!response.ok) {
      const errorText = await response.text(); // Get raw error text for debugging
      console.error(`Printify API Error (${response.status}):`, errorText);
      return {
        statusCode: response.status, // Pass through Printify's status code
        body: JSON.stringify({
          message: `Error from Printify API: ${response.statusText}`,
          details: errorText // Include raw error for more detailed debugging
        })
      };
    }

    // 6. Parse the JSON response from Printify.
    const productsData = await response.json();

    // 7. Return the fetched data to your frontend.
    //    The frontend's `ProductGrid.jsx` will receive this JSON.
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json" // Tell the client it's JSON
      },
      body: JSON.stringify(productsData) // Send the Printify data as a string
    };

  } catch (error) {
    // 8. Catch any unexpected errors during function execution (e.g., network issues, coding errors).
    console.error('Unhandled Error in Netlify Function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to fetch products due to an unexpected server error.',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined // Include stack in dev for debugging
      })
    };
  }
};