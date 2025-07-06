// netlify/functions/get-products.js

// Node.js 18+ has native fetch. For older Node.js versions,
// you might need to install 'node-fetch' (npm install node-fetch@2)
// and then uncomment: const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    try {
      // Retrieve API token and Shop ID from Netlify environment variables
      // IMPORTANT: These variables MUST be set in Netlify dashboard!
      const PRINTIFY_API_TOKEN = process.env.PRINTIFY_API_TOKEN;
      const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;
  
      // Basic validation
      if (!PRINTIFY_API_TOKEN || !PRINTIFY_SHOP_ID) {
        console.error("Missing environment variables: PRINTIFY_API_TOKEN or PRINTIFY_SHOP_ID");
        return {
          statusCode: 500,
          body: JSON.stringify({ message: "Server configuration error: Printify API token or Shop ID missing. Please set them in Netlify environment variables." })
        };
      }
  
      // Construct the Printify API URL to fetch products for your shop
      // This fetches all products for the specified shop
      const printifyApiUrl = `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products.json`;
  
      // Make the secure, server-side request to Printify API
      const response = await fetch(printifyApiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PRINTIFY_API_TOKEN}`, // Use your token here
          'Content-Type': 'application/json'
        }
      });
  
      // Handle non-2xx HTTP responses from Printify (e.g., 401 Unauthorized, 404 Not Found)
      if (!response.ok) {
        const errorText = await response.text(); // Get raw error text
        console.error(`Printify API error (${response.status}):`, errorText);
        return {
          statusCode: response.status,
          body: JSON.stringify({
            message: `Error from Printify API: ${response.statusText}`,
            details: errorText // Include raw error for debugging
          })
        };
      }
  
      // Parse the JSON response from Printify
      const productsData = await response.json();
  
      // Return the data to your frontend
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(productsData)
      };
  
    } catch (error) {
      // Catch any unexpected errors during function execution (e.g., network issues)
      console.error('Error in Netlify Function:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Failed to fetch products due to internal server error.', error: error.message })
      };
    }
  };