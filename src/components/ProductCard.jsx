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
  height: '3em', // Ensure consistent height for titles
  overflow: 'hidden',
};

const priceStyle = {
  fontSize: '1.1em',
  color: '#333',
  fontWeight: '600',
  marginTop: 'auto', // Push price to the bottom if content above is shorter
};


function ProductCard({ product }) {
  // Get the price of the first variant, converting cents to dollars
  const displayPrice = product.variants && product.variants.length > 0
    ? (product.variants[0].price / 100).toFixed(2) // Format to 2 decimal places
    : 'N/A';

  // Use the mockupImage or the first image from the images array
  const imageUrl = product.mockupImage || (product.images && product.images[0]?.src);

  return (
    <div style={cardStyle}>
      {imageUrl && (
        <img src={imageUrl} alt={product.title} style={imageStyle} />
      )}
      <h3 style={titleStyle}>{product.title}</h3>
      <p style={priceStyle}>${displayPrice}</p>
      {/* You can add a "View Details" or "Add to Cart" button here later */}
    </div>
  );
}

export default ProductCard;