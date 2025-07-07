// src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

// --- IMPORTANT: These styles are now being moved to src/App.css. ---
// You will no longer need these 'const' declarations here in your final code.
// I'm keeping them commented out for reference to show what was removed.

/*
const cardStyle = {
  border: '1px solid var(--color-detail-grey)',
  borderRadius: '8px',
  padding: '16px',
  margin: '8px',
  textAlign: 'center',
  maxWidth: '300px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  backgroundColor: '#3A3A3A',
  color: 'var(--color-light-text)',
  transition: 'transform 0.2s ease-in-out',
  cursor: 'pointer',
};

const imageStyle = {
  width: '100%',
  height: '200px',
  objectFit: 'cover',
  borderRadius: '4px',
  marginBottom: '12px',
};

const titleStyle = { // THIS ONE IS REMOVED
  fontSize: '1.2em',
  fontWeight: 'bold',
  marginBottom: '8px',
  height: '3em',
  overflow: 'hidden',
  color: 'var(--color-light-text)',
};

const priceStyle = { // THIS ONE IS REMOVED
  fontSize: '1.1em',
  color: 'var(--color-accent-red)',
  fontWeight: '600',
  marginTop: 'auto',
};
*/

const FALLBACK_IMAGE_URL = "https://via.placeholder.com/400x300?text=No+Image";


function ProductCard({ product }) {
  let displayPrice = 'N/A';
  const enabledVariants = product.variants ? product.variants.filter(variant => variant.is_enabled) : [];

  if (enabledVariants.length > 0) {
    const minPrice = Math.min(...enabledVariants.map(variant => variant.price));
    displayPrice = (minPrice / 100).toFixed(2);
  }

  const primaryImageUrl = product.images && product.images.length > 0
    ? product.images[0].src
    : null;

  return (
    <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      {/* Apply cardStyle as an inline style for now, or move to a class later */}
      {/* If you've already moved cardStyle to a class, replace style={cardStyle} with className="product-card" */}
      <div style={
        // You can keep cardStyle as inline for now, or define .product-card in App.css and use className="product-card"
        {
          border: '1px solid var(--color-detail-grey)',
          borderRadius: '8px',
          padding: '16px',
          margin: '8px',
          textAlign: 'center',
          maxWidth: '300px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#3A3A3A', // Darker background for the card
          color: 'var(--color-light-text)', // Light text on dark card
          transition: 'transform 0.2s ease-in-out',
          cursor: 'pointer',
        }
      }>
        <img
          src={primaryImageUrl || FALLBACK_IMAGE_URL}
          alt={product.title}
          style={
            // You can keep imageStyle as inline for now, or define .product-card-image in App.css and use className="product-card-image"
            {
              width: '100%',
              height: '200px',
              objectFit: 'cover',
              borderRadius: '4px',
              marginBottom: '12px',
            }
          }
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = FALLBACK_IMAGE_URL;
          }}
        />
        {/* Use class names for title and price */}
        <h3 className="product-card-title">{product.title}</h3>
        <p className="product-card-price">${displayPrice}</p>
      </div>
    </Link>
  );
}

export default ProductCard;