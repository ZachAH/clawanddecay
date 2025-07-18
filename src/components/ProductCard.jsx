import React from 'react';
import { Link } from 'react-router-dom';
// Import your local SVG asset
import ReactSvgFallback from '../assets/react.svg'; // Adjust the path based on your file structure

// Define a fallback image URL.
// When importing an asset like this, the bundler processes it and provides a public URL.
const FALLBACK_IMAGE_URL = ReactSvgFallback;

/**
 * ProductCard Component
 * Renders a single product with its image, title, and price.
 * It also handles navigation to the product's detail page.
 *
 * @param {object} props - Component props.
 * @param {object} props.product - The product object containing details like id, title, images, and variants.
 */
function ProductCard({ product }) {
  let displayPrice = 'N/A'; // Default price display if no enabled variants are found.

  // Filter product variants to only include those that are enabled.
  // This ensures that only available prices are considered.
  const enabledVariants = product.variants
    ? product.variants.filter(variant => variant.is_enabled)
    : [];

  // Calculate the minimum price from the enabled variants.
  // If there are enabled variants, find the lowest price and format it to two decimal places.
  if (enabledVariants.length > 0) {
    const minPrice = Math.min(...enabledVariants.map(variant => variant.price));
    displayPrice = (minPrice / 100).toFixed(2); // Convert cents to dollars and format.
  }

  // Determine the primary image URL for the product.
  // It checks if product.images exists and has at least one image, then takes the src of the first image.
  // If no valid image is found, it defaults to null, which will trigger the fallback image.
  const primaryImageUrl = product.images && product.images.length > 0
    ? product.images[0].src
    : null;

  return (
    // The entire card is wrapped in a Link component for navigation to the product's detail page.
    <Link to={`/products/${product.id}`} className="product-card-link">
      <div className="product-card">
        {/*
          Image element:
          - src: Uses primaryImageUrl if available, otherwise falls back to FALLBACK_IMAGE_URL.
          - alt: Provides accessible text for the image.
          - loading="lazy": Improves performance by deferring image loading until it's near the viewport.
          - onError: If an image fails to load (e.g., broken URL), this handler replaces its src with the fallback.
        */}
        <img
          src={primaryImageUrl || FALLBACK_IMAGE_URL}
          alt={product.title}
          className="product-card-image"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null; // Prevents infinite loop if fallback also fails.
            e.target.src = FALLBACK_IMAGE_URL; // Sets the fallback image.
          }}
        />
        {/* Product title displayed below the image. */}
        <h3 className="product-card-title">{product.title}</h3>
        {/* Product price displayed below the title. */}
        <p className="product-card-price">${displayPrice}</p>
      </div>
    </Link>
  );
}

export default ProductCard;
