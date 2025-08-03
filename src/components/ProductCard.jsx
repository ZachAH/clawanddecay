import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ReactSvgFallback from '../assets/react.svg'; // Adjust path as needed
import { useCart } from '../context/CartContext'; // Make sure you have this context set up

const FALLBACK_IMAGE_URL = ReactSvgFallback;

/**
 * ProductCard Component
 * @param {object} props
 * @param {object} props.product - Product data
 * @param {boolean} [props.isFirst=false] - If true, image loads eagerly (for LCP)
 */
function ProductCard({ product, isFirst = false }) {
  const { addToCart } = useCart();

  // Filter enabled variants
  const enabledVariants = product.variants
    ? product.variants.filter(variant => variant.is_enabled)
    : [];

  // For display price, show minimum enabled variant price
  let displayPrice = 'N/A';
  if (enabledVariants.length > 0) {
    const minPrice = Math.min(...enabledVariants.map(variant => variant.price));
    displayPrice = (minPrice / 100).toFixed(2);
  }

  // Track selected variant id for adding to cart
  const [selectedVariantId, setSelectedVariantId] = useState(
    enabledVariants.length > 0 ? enabledVariants[0].id : null
  );

  const selectedVariant = enabledVariants.find(v => v.id === selectedVariantId);

  const primaryImageUrl = product.images && product.images.length > 0
    ? product.images[0].src
    : null;

  // Add to cart handler
  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent navigating to product page on button click inside link

    if (!selectedVariant) {
      alert('Please select a valid variant.');
      return;
    }

    addToCart({
      id: selectedVariant.id,
      title: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
    });
  };

  return (
    <Link to={`/products/${product.id}`} className="product-card-link relative block p-4 border rounded hover:shadow-md">
      <img
        src={primaryImageUrl || FALLBACK_IMAGE_URL}
        alt={product.title}
        className="product-card-image w-full h-auto mb-2"
        loading={isFirst ? 'eager' : 'lazy'}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = FALLBACK_IMAGE_URL;
        }}
      />
      <h3 className="product-card-title font-semibold text-lg">{product.title}</h3>
      <p className="product-card-price text-gray-700 mb-2">${displayPrice}</p>

      {/* Variant Selector (only show if more than one variant) */}
      {enabledVariants.length > 1 && (
        <select
          className="mb-2 w-full border rounded px-2 py-1"
          value={selectedVariantId}
          onChange={e => setSelectedVariantId(Number(e.target.value))}
          onClick={e => e.stopPropagation()} // Prevent Link navigation on dropdown click
        >
          {enabledVariants.map(variant => (
            <option key={variant.id} value={variant.id}>
              {variant.title} (${(variant.price / 100).toFixed(2)})
            </option>
          ))}
        </select>
      )}

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        className="bg-green-600 hover:bg-green-700 text-white w-full py-2 rounded"
        onMouseDown={e => e.stopPropagation()} // Prevent Link navigation on button click
      >
        Add to Cart
      </button>
    </Link>
  );
}

export default ProductCard;
