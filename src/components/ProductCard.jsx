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

  const primaryImageUrl =
    product.images?.find(img => img.src.includes('pfy-prod-products-mockup-media'))?.src ||
    product.images?.[0]?.src ||
    FALLBACK_IMAGE_URL;

  return (
    <Link
      to={`/products/${product.id}`}
      className="product-card-link"
      role="listitem"
      aria-label={`${product.title}, ${displayPrice !== 'N/A' ? `from $${displayPrice}` : 'view details'}`}
    >
      <article className="product-card">
        <img
          src={primaryImageUrl}
          alt={`${product.title} — Claw & Decay product photo`}
          className="product-card-image"
          loading={isFirst ? 'eager' : 'lazy'}
          decoding="async"
          fetchpriority={isFirst ? 'high' : 'auto'}
          width="300"
          height="300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = FALLBACK_IMAGE_URL;
          }}
        />
        <h3 className="product-card-title">{product.title}</h3>
        <p className="product-card-price" aria-label={`Price from ${displayPrice} dollars`}>
          ${displayPrice}
        </p>
      </article>
    </Link>
  );
}

export default ProductCard;
