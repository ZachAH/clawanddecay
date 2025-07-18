// src/pages/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// Import your local SVG asset for the fallback image
import ReactSvgFallback from '../assets/react.svg'; // Adjust the path based on your file structure

// Define the fallback image URL using the imported SVG.
// This ensures that when an image is not available, a local asset is used.
const FALLBACK_IMAGE_URL = ReactSvgFallback;

const NUM_BLOOD_STREAMS = 20;
const STREAM_ANIMATION_CYCLE_MS = 4000;

/**
 * ProductDetailPage Component
 * Displays detailed information for a single product, fetched by its ID.
 * Includes product image, description, variants, and a loading animation.
 */
function ProductDetailPage() {
  const { productId } = useParams(); // Get the product ID from the URL parameters.
  const [product, setProduct] = useState(null); // State to store the fetched product data.
  const [loading, setLoading] = useState(true); // State to manage loading status.
  const [error, setError] = useState(null); // State to store any error messages.
  const [currentImage, setCurrentImage] = useState(null); // State to manage the currently displayed main image.

  // Effect hook to fetch product details when the component mounts or productId changes.
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Fetch product data from the Netlify function by product ID.
        const response = await fetch(`/.netlify/functions/get-product-by-id?id=${productId}`);

        if (!response.ok) {
          const errorDetails = await response.json();
          throw new Error(errorDetails.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json(); // Parse the JSON response.
        setProduct(data); // Set the fetched product data.

        // Set the initial main image to the first product image, or the fallback if none exist.
        if (data.images && data.images.length > 0) {
          setCurrentImage(data.images[0].src);
        } else {
          setCurrentImage(FALLBACK_IMAGE_URL);
        }

      } catch (err) {
        console.error("Failed to fetch single product:", err); // Log any errors during fetching.
        setError(err.message || "Failed to load product details."); // Set error state.
      } finally {
        setLoading(false); // Set loading to false regardless of success or failure.
      }
    };

    // Only fetch if a productId is available.
    if (productId) {
      fetchProduct();
    } else {
      setLoading(false);
      setError("No product ID provided.");
    }
  }, [productId]); // Dependency array: re-run effect if productId changes.

  // Handler for when a thumbnail image is clicked, updates the main displayed image.
  const handleThumbnailClick = (imageUrl) => {
    setCurrentImage(imageUrl);
  };

  // Check if product title includes "tee" (case-insensitive) to conditionally show description.
  const showTeeDescription = product?.title?.toLowerCase().includes("tee");

  // Render loading state with a blood stream animation.
  if (loading) {
    return (
      <div className="product-detail-page-container">
        <div className="spinner-container" style={{ position: 'relative', overflow: 'hidden', width: '100%' }}>
          <div className="blood-stream-animation-wrapper">
            {Array.from({ length: NUM_BLOOD_STREAMS }).map((_, i) => (
              <div
                key={i}
                className="blood-stream-drip"
                style={{
                  left: `${(i / NUM_BLOOD_STREAMS) * 90 + 5}%`,
                  animation: `bloodStreamDrip ${STREAM_ANIMATION_CYCLE_MS / 1000}s linear infinite`,
                  animationDelay: `${(STREAM_ANIMATION_CYCLE_MS / NUM_BLOOD_STREAMS / 1000) * i}s`,
                }}
              ></div>
            ))}
          </div>
          <span style={{ position: 'relative', zIndex: 10 }}>Loading product details...</span>
        </div>
      </div>
    );
  }

  // Render error message if there was an error fetching product details.
  if (error) {
    return (
      <div className="product-detail-page-container">
        <p className="product-detail-message">Error: {error}</p>
      </div>
    );
  }

  // Render "Product not found" message if no product data is available after loading.
  if (!product) {
    return (
      <div className="product-detail-page-container">
        <p className="product-detail-message">Product not found.</p>
      </div>
    );
  }

  // Main product detail page content.
  return (
    <div className="product-detail-page-container">
      <h1 className="product-detail-title">{product.title}</h1>

      <div className="product-detail-image-and-description">
        <div className="product-detail-image-container">
          {/* Main product image, uses currentImage or fallback. */}
          <img
            src={currentImage || FALLBACK_IMAGE_URL}
            alt={product.title}
            className="product-detail-image"
            // Error handler for the main image, falls back to FALLBACK_IMAGE_URL.
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = FALLBACK_IMAGE_URL;
            }}
          />
        </div>

        {/* Conditionally display tee-specific description. */}
        {showTeeDescription && (
          <div className="tee-description-anim">
            <h2>COMFORT COLORS 1717</h2>
            <p>
              We print exclusively on these tees, widely regarded as the GOAT of T-shirt materials. Celebrated for their durable, high-quality fabric and rich, vintage-inspired colors. Soft, breathable, and built to last.
            </p>
          </div>
        )}
      </div>

      {/* Thumbnail images for products with multiple images. */}
      {product.images && product.images.length > 1 && (
        <div className="thumbnail-container">
          {product.images.map((image, index) => (
            <img
              key={image.src || index} // Unique key for list rendering.
              src={image.src || FALLBACK_IMAGE_URL} // Thumbnail image source, with fallback.
              alt={`${product.title} view ${index + 1}`}
              className={`thumbnail-image ${image.src === currentImage ? 'active' : ''}`} // Active class for the currently selected thumbnail.
              onClick={() => handleThumbnailClick(image.src)} // Click handler to change main image.
              // Error handler for thumbnails, falls back to FALLBACK_IMAGE_URL.
              onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE_URL; }}
            />
          ))}
        </div>
      )}

      {/* Product description, rendered as HTML if available. */}
      {product.description && (
        <p className="product-detail-description" dangerouslySetInnerHTML={{ __html: product.description }}></p>
      )}

      {/* Product variants display. */}
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
