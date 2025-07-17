// src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom'; 

const FALLBACK_IMAGE_URL = "https://via.placeholder.com/400x300?text=No+Image";


function ProductCard({ product }) {
  let displayPrice = 'N/A';
  // Filter for only enabled variants
  const enabledVariants = product.variants ? product.variants.filter(variant => variant.is_enabled) : [];

  if (enabledVariants.length > 0) {
    // Find the minimum price among the enabled variants
    const minPrice = Math.min(...enabledVariants.map(variant => variant.price));
    displayPrice = (minPrice / 100).toFixed(2);
  }

  // Get the primary image URL from the Printify product data
  const primaryImageUrl = product.images && product.images.length > 0
    ? product.images[0].src
    : null;

  return (
    // Wrap the entire card with a Link component.
    // Use the class "product-card-link" for styling the link wrapper.
    <Link to={`/products/${product.id}`} className="product-card-link">
      {/* The main container for the product card. Use the "product-card" class. */}
      <div className="product-card">
        {/* Image for the product card. Use the "product-card-image" class. */}
        <img
          src={primaryImageUrl || FALLBACK_IMAGE_URL}
          alt={product.title}
          className="product-card-image"
          width="400"
          height="400"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loop if fallback also fails
            e.target.src = FALLBACK_IMAGE_URL; // Set fallback image on error
          }}
        />
        {/* Product title. Use the "product-card-title" class. */}
        <h3 className="product-card-title">{product.title}</h3>
        {/* Product price. Use the "product-card-price" class. */}
        <p className="product-card-price">${displayPrice}</p>
      </div>
    </Link>
  );
}

export default ProductCard;