// netlify/functions/get-product-by-id.js

exports.handler = async function(event, context) {
    try {
      const PRINTIFY_API_TOKEN = process.env.PRINTIFY_API_TOKEN;
      const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;
  
      // Extract the product ID from the request path (e.g., /.netlify/functions/get-product-by-id?id=YOUR_PRODUCT_ID)
      // Or, more robustly, from event.queryStringParameters
      const productId = event.queryStringParameters.id;
  
      if (!productId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Product ID is required." })
        };
      }
  
      if (!PRINTIFY_API_TOKEN || !PRINTIFY_SHOP_ID) {
        console.error("Function Error: Missing environment variables.");
        return {
          statusCode: 500,
          body: JSON.stringify({
            message: "Server configuration error: Printify API token or Shop ID missing."
          })
        };
      }
  
      // Printify API endpoint for a single product
      const printifyApiUrl = `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products/${productId}.json`;
  
      const response = await fetch(printifyApiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PRINTIFY_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Printify API Error (${response.status}) for single product:`, errorText);
        return {
          statusCode: response.status,
          body: JSON.stringify({
            message: `Error from Printify API: ${response.statusText}`,
            details: errorText
          })
        };
      }
  
      const productData = await response.json();
  
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(productData)
      };
  
    } catch (error) {
      console.error('Unhandled Error in get-product-by-id function:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Failed to fetch single product due to an unexpected server error.',
          error: error.message
        })
      };
    }
  };