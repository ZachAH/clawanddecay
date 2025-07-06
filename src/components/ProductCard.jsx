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

const FALLBACK_IMAGE_URL = "https://via.placeholder.com/400x300?text=No+Image";


function ProductCard({ product }) {
  // --- UPDATED PRICE LOGIC ---
  let displayPrice = 'N/A';
  // Filter for only enabled variants
  const enabledVariants = product.variants ? product.variants.filter(variant => variant.is_enabled) : [];
  
  if (enabledVariants.length > 0) {
    // Find the minimum price among the enabled variants
    const minPrice = Math.min(...enabledVariants.map(variant => variant.price));
    displayPrice = (minPrice / 100).toFixed(2);
  }
  // --- END UPDATED PRICE LOGIC ---


  // Get the primary image URL from the Printify product data
  const primaryImageUrl = product.images && product.images.length > 0
    ? product.images[0].src
    : null;

  return (
    <div style={cardStyle}>
      <img
        src={primaryImageUrl || FALLBACK_IMAGE_URL}
        alt={product.title}
        style={imageStyle}
        onError={(e) => {
          e.target.onerror = null;
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