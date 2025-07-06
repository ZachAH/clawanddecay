// src/components/ProductCard.jsx
import React from 'react';

// Simple styling for demonstration - you can replace with Tailwind, CSS modules, etc.
const cardStyle = {
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '16px',
  margin: '8px',
  textAlign: 'center',
  maxWidth: '300px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  backgroundColor: '#fff',
};

const imageStyle = {
  width: '100%',
  height: '200px', // Fixed height for consistency
  objectFit: 'cover', // Ensures image covers the area
  borderRadius: '4px',
  marginBottom: '12px',
};

const titleStyle = {
  fontSize: '1.2em',
  fontWeight: 'bold',
  marginBottom: '8px',
  height: '3em', // Ensure consistent height for titles (adjust as needed if titles are very long)
  overflow: 'hidden', // Hide overflow if title is too long for the fixed height
};

const priceStyle = {
  fontSize: '1.1em',
  color: '#333',
  fontWeight: '600',
  marginTop: 'auto', // Push price to the bottom if content above is shorter
};

// --- Start of updates ---

// Define a fallback image URL in case a product has no images from Printify
// You can change this to any image URL you prefer, or even a local image path if imported
const FALLBACK_IMAGE_URL = "https://via.placeholder.com/400x300?text=No+Image"; 
// Or, if your "via.placeholder.com" links don't work, try:
// "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/None.png/600px-None.png"


function ProductCard({ product }) {
  // Get the price of the first variant, converting cents to dollars
  const displayPrice = product.variants && product.variants.length > 0
    ? (product.variants[0].price / 100).toFixed(2) // Format to 2 decimal places
    : 'N/A';

  // Get the primary image URL from the Printify product data
  // Printify typically provides an 'images' array. We'll use the first one.
  const primaryImageUrl = product.images && product.images.length > 0
    ? product.images[0].src
    : null; // If no images are available, set to null

  return (
    <div style={cardStyle}>
      {/*
        Use the primaryImageUrl if available, otherwise fall back to FALLBACK_IMAGE_URL.
        The onError handler provides a last line of defense if the image URL is valid but fails to load (e.g., broken link).
      */}
      <img
        src={primaryImageUrl || FALLBACK_IMAGE_URL}
        alt={product.title}
        style={imageStyle}
        onError={(e) => {
          // Prevent infinite loops if the fallback image also fails
          e.target.onerror = null;
          // Set the source to the fallback image if the primary image fails to load
          e.target.src = FALLBACK_IMAGE_URL;
        }}
      />
      <h3 style={titleStyle}>{product.title}</h3>
      <p style={priceStyle}>${displayPrice}</p>
      {/* You can add a "View Details" or "Add to Cart" button here later */}
    </div>
  );
}

export default ProductCard;