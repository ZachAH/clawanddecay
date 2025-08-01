import React from 'react';
import { Link } from 'react-router-dom';
import ReactSvgFallback from '../assets/react.svg'; // Adjust path as needed

const FALLBACK_IMAGE_URL = ReactSvgFallback;

/**
 * ProductCard Component
 * @param {object} props
 * @param {object} props.product - Product data
 * @param {boolean} [props.isFirst=false] - If true, image loads eagerly (for LCP)
 */
function ProductCard({ product, isFirst = false }) {
  let displayPrice = 'N/A';

  const enabledVariants = product.variants
    ? product.variants.filter(variant => variant.is_enabled)
    : [];

  if (enabledVariants.length > 0) {
    const minPrice = Math.min(...enabledVariants.map(variant => variant.price));
    displayPrice = (minPrice / 100).toFixed(2);
  }

  const primaryImageUrl = product.images && product.images.length > 0
    ? product.images[0].src
    : null;

  return (
    <Link to={`/products/${product.id}`} className="product-card-link">
      <div className="product-card">
        <img
          src={primaryImageUrl || FALLBACK_IMAGE_URL}
          alt={product.title}
          className="product-card-image"
          loading={isFirst ? 'eager' : 'lazy'} // Conditional loading
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = FALLBACK_IMAGE_URL;
          }}
        />
        <h3 className="product-card-title">{product.title}</h3>
        <p className="product-card-price">${displayPrice}</p>
      </div>
    </Link>
  );
}

export default ProductCard;
