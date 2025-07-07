// src/pages/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// No longer needed here as styles are in App.css
// const detailPageStyle = { ... };
// ... (all other const style declarations were removed in previous steps) ...

const FALLBACK_IMAGE_URL = "https://via.placeholder.com/400x300?text=No+Image";

// Define how long each drop animation lasts (must match CSS @keyframes fallAndDrip)
const DROP_DURATION_MS = 1500; // 1.5 seconds per drip
// Define how frequently new drops appear
const NEW_DROP_INTERVAL_MS = 200; // New drop every 200ms


function ProductDetailPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);

  // NEW STATE: To manage the individual blood drops for the animation
  const [drops, setDrops] = useState([]);
  const dropIdCounter = React.useRef(0); // To give unique IDs to drops


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


  // NEW EFFECT: Manage the blood drip animation while loading is true
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setDrops(prevDrops => {
          const now = Date.now();
          const newDrops = [
            ...prevDrops,
            {
              id: dropIdCounter.current++,
              createdAt: now, // Store creation time to filter old drops
              // Random X position to make it look like a stream
              left: `${Math.random() * 80 + 10}%`, // 10% to 90% across container
            }
          ];
          // Clean up old drops that have finished animating and are off-screen
          return newDrops.filter(drop => {
            return now - drop.createdAt < DROP_DURATION_MS * 2; // Keep for a bit longer than animation duration
          });
        });
      }, NEW_DROP_INTERVAL_MS);

      // Cleanup interval when component unmounts or loading stops
      return () => clearInterval(interval);
    } else {
      // Clear drops once loading is complete
      setDrops([]);
    }
  }, [loading]); // Run this effect when loading state changes


  // Function to handle thumbnail clicks, updating the main image
  const handleThumbnailClick = (imageUrl) => {
    setCurrentImage(imageUrl);
  };


  // --- Conditional Rendering for Loading, Error, and Not Found States ---
  if (loading) {
    return (
      <div className="product-detail-page-container">
        <div className="spinner-container" style={{ position: 'relative', overflow: 'hidden', width: '100%' }}> {/* Apply relative positioning here for absolute drops */}
          {/* Render the individual blood drops */}
          {drops.map(drop => (
            <div
              key={drop.id}
              className="blood-stream-drop"
              style={{ left: drop.left, animationDuration: `${DROP_DURATION_MS / 1000}s` }} // Apply dynamic left and animation duration
            ></div>
          ))}
          {/* Always display loading text or a fixed element on top of drops */}
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

      {/* Future: You can add an "Add to Cart" form, quantity selectors, etc. here */}
    </div>
  );
}

export default ProductDetailPage;