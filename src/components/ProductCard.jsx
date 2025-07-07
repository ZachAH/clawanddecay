// src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

// Simple styling for demonstration - you can replace with Tailwind, CSS modules, etc.
// NOTE: For better practice, consider moving these styles to App.css or a dedicated ProductCard.css
const cardStyle = {
  border: '1px solid var(--color-detail-grey)', // Using CSS variable for consistency
  borderRadius: '8px',
  padding: '16px',
  margin: '8px',
  textAlign: 'center',
  maxWidth: '300px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.3)', // Slightly stronger shadow
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  backgroundColor: '#3A3A3A', // Darker background for the card
  color: 'var(--color-light-text)', // Light text on dark card
  transition: 'transform 0.2s ease-in-out', // Smooth transition for any future transforms
  cursor: 'pointer', // Indicate it's clickable
};

const imageStyle = {
  width: '100%',
  height: '200px',
  objectFit: 'cover',
  borderRadius: '4px',
  marginBottom: '12px',
};

const titleStyle = {
  fontSize: '1.2em',
  fontWeight: 'bold',
  marginBottom: '8px',
  height: '3em',
  overflow: 'hidden',
  color: 'var(--color-light-text)', // Ensure title is light
};

const priceStyle = {
  fontSize: '1.1em',
  color: 'var(--color-accent-red)', // Use accent red for price
  fontWeight: '600',
  marginTop: 'auto',
};

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
    // Wrap the entire card with a Link component
    // The `to` prop specifies the URL. `product.id` comes from the API response.
    // The `style` here removes default link underline and keeps text color inherited.
    <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
      </div>
    </Link>
  );
}

export default ProductCard;