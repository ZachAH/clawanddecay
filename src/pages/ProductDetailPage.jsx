// src/pages/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// No longer needed here as styles are in App.css
// const detailPageStyle = { ... };
// ... (all other const style declarations were removed in previous steps) ...

const FALLBACK_IMAGE_URL = "https://via.placeholder.com/400x300?text=No+Image";

// --- NEW CONSTANTS FOR BLOOD STREAM LOADER ---
// Number of blood streams/drips to show simultaneously
const NUM_BLOOD_STREAMS = 20; // Adjust this number for more or fewer streams
// Total duration of one full cycle for all streams (must match CSS animation-duration)
const STREAM_ANIMATION_CYCLE_MS = 4000; // 4 seconds for one full cycle


function ProductDetailPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);

  // Removed 'drops' state and 'dropIdCounter' ref as they are no longer needed for this stream effect


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/.netlify/functions/get-product-by-id?id=${productId}`);

        if (!response.ok) {
          const errorDetails = await response.json();
          throw new Error(errorDetails.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setCurrentImage(data.images[0].src);
        } else {
          setCurrentImage(FALLBACK_IMAGE_URL);
        }

      } catch (err) {
        console.error("Failed to fetch single product:", err);
        setError(err.message || "Failed to load product details.");
      } finally {
        setLoading(false);
      }
    }; // <--- Ensure there is NO SEMICOLON here!

    if (productId) {
      fetchProduct();
    } else {
      setLoading(false);
      setError("No product ID provided.");
    }
  }, [productId]);

  // The useEffect that previously managed 'drops' via setInterval has been removed
  // as the blood stream animation is now handled purely by CSS animation-delay and rendering fixed elements.

  // Function to handle thumbnail clicks, updating the main image
  const handleThumbnailClick = (imageUrl) => {
    setCurrentImage(imageUrl);
  };


  // --- Conditional Rendering for Loading, Error, and Not Found States ---
  if (loading) {
    return (
      <div className="product-detail-page-container">
        {/* NEW: Blood stream animation wrapper */}
        <div className="spinner-container" style={{ position: 'relative', overflow: 'hidden', width: '100%' }}>
          <div className="blood-stream-animation-wrapper">
            {/* Render a fixed number of blood stream drip elements */}
            {Array.from({ length: NUM_BLOOD_STREAMS }).map((_, i) => (
              <div
                key={i} // Using index as key is okay here as these are static instances
                className="blood-stream-drip"
                style={{
                  // Distribute streams horizontally across the container
                  left: `${(i / NUM_BLOOD_STREAMS) * 90 + 5}%`, // 5% to 95%
                  // Apply CSS animation and stagger their start times
                  animation: `bloodStreamDrip ${STREAM_ANIMATION_CYCLE_MS / 1000}s linear infinite`,
                  animationDelay: `${(STREAM_ANIMATION_CYCLE_MS / NUM_BLOOD_STREAMS / 1000) * i}s`,
                }}
              ></div>
            ))}
          </div>
          {/* Loading text always on top of the drips */}
          <span style={{ position: 'relative', zIndex: 10 }}>Loading product details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail-page-container">
        <p className="product-detail-message">Error: {error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page-container">
        <p className="product-detail-message">Product not found.</p>
      </div>
    );
  }


  // --- Main Product Detail Page Content (when product data is loaded) ---
  return (
    <div className="product-detail-page-container">
      <h1 className="product-detail-title">{product.title}</h1>

      {/* Main Product Image Display */}
      <div className="product-detail-image-container">
        <img
          src={currentImage || FALLBACK_IMAGE_URL}
          alt={product.title}
          className="product-detail-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = FALLBACK_IMAGE_URL;
          }}
        />
      </div>

      {/* Thumbnail Gallery (only show if product has more than one image) */}
      {product.images && product.images.length > 1 && (
        <div className="thumbnail-container">
          {product.images.map((image, index) => (
            <img
              key={image.src || index}
              src={image.src || FALLBACK_IMAGE_URL}
              alt={`${product.title} view ${index + 1}`}
              className={`thumbnail-image ${image.src === currentImage ? 'active' : ''}`}
              onClick={() => handleThumbnailClick(image.src)}
              onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE_URL; }}
            />
          ))}
        </div>
      )}

      {/* Product Description */}
      {product.description && (
        <p className="product-detail-description" dangerouslySetInnerHTML={{ __html: product.description }}></p>
      )}

      {/* Available Variants Section */}
      <div className="product-detail-variants-container">
        <h3>Available Variants:</h3>
        {product.variants && product.variants.length > 0 ? (
          product.variants.filter(variant => variant.is_enabled).length > 0 ? (
            product.variants
              .filter(variant => variant.is_enabled)
              .map(variant => (
                <div key={variant.id} className="product-detail-variant-item">
                  <span>{variant.title}</span>
                  <span className="product-detail-variant-price">${(variant.price / 100).toFixed(2)}</span>
                  {/* Future: Add "Add to Cart" button here for each variant */}
                </div>
              ))
          ) : (
            <p className="product-detail-message">No enabled variants found for this product.</p>
          )
        ) : (
          <p className="product-detail-message">No variants available for this product.</p>
        )}
      </div>
    </div>
  );
}

export default ProductDetailPage;