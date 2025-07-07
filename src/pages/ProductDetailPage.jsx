// src/pages/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// --- IMPORTANT: All these styles are now defined in src/App.css. ---
// You should remove all these 'const' declarations (detailPageStyle, productDetailImageContainerStyle, etc.)
// from your actual file, as they are no longer used here in the JSX.
/*
const detailPageStyle = { ... };
const productDetailImageContainerStyle = { ... };
const productDetailImageStyle = { ... };
const thumbnailContainerStyle = { ... };
const thumbnailStyle = { ... };
const activeThumbnailStyle = { ... };
const titleStyle = { ... };
const descriptionStyle = { ... };
const variantsContainerStyle = { ... };
const variantStyle = { ... };
const variantPriceStyle = { ... };
*/

const FALLBACK_IMAGE_URL = "https://via.placeholder.com/400x300?text=No+Image";


function ProductDetailPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(null); // State for the currently displayed main image

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Call your Netlify Function, passing the product ID as a query parameter
        const response = await fetch(`/.netlify/functions/get-product-by-id?id=${productId}`);

        if (!response.ok) {
          const errorDetails = await response.json();
          throw new Error(errorDetails.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProduct(data);
        // Set the first image as the default current image
        if (data.images && data.images.length > 0) {
          setCurrentImage(data.images[0].src);
        } else {
          setCurrentImage(FALLBACK_IMAGE_URL); // Fallback if no images are provided
        }

      } catch (err) {
        console.error("Failed to fetch single product:", err);
        setError(err.message || "Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    if (productId) { // Only fetch if we have a product ID from the URL
      fetchProduct();
    } else {
      setLoading(false);
      setError("No product ID provided.");
    }
  }, [productId]); // Re-fetch if productId from URL changes

  // Function to handle thumbnail clicks, updating the main image
  const handleThumbnailClick = (imageUrl) => {
    setCurrentImage(imageUrl);
  };

  // --- Conditional Rendering for Loading, Error, and Not Found States ---
  if (loading) {
    return (
      // Apply the main container class for the detail page
      <div className="product-detail-page-container">
        {/* Spinner container and spinner classes from App.css */}
        <div className="spinner-container">
          <div className="spinner"></div>
          <span>Loading product details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      // Apply the main container class for the detail page
      <div className="product-detail-page-container">
        <p className="product-detail-message">Error: {error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      // Apply the main container class for the detail page
      <div className="product-detail-page-container">
        <p className="product-detail-message">Product not found.</p>
      </div>
    );
  }

  // --- Main Product Detail Page Content (when product data is loaded) ---
  return (
    // Apply the main container class for the detail page
    <div className="product-detail-page-container">
      <h1 className="product-detail-title">{product.title}</h1> {/* Apply class */}

      {/* Main Product Image Display */}
      <div className="product-detail-image-container"> {/* Apply class */}
        <img
          src={currentImage || FALLBACK_IMAGE_URL}
          alt={product.title}
          className="product-detail-image" {/* Apply class */}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = FALLBACK_IMAGE_URL;
          }}
        />
      </div>

      {/* Thumbnail Gallery (only show if product has more than one image) */}
      {product.images && product.images.length > 1 && (
        <div className="thumbnail-container"> {/* Apply class */}
          {product.images.map((image, index) => (
            <img
              key={image.src || index}
              src={image.src || FALLBACK_IMAGE_URL}
              alt={`${product.title} view ${index + 1}`}
              // Apply base thumbnail class and active class conditionally
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
      <div className="product-detail-variants-container"> {/* Apply class */}
        <h3>Available Variants:</h3>
        {product.variants && product.variants.length > 0 ? (
          product.variants.filter(variant => variant.is_enabled).length > 0 ? (
            product.variants
              .filter(variant => variant.is_enabled)
              .map(variant => (
                <div key={variant.id} className="product-detail-variant-item"> {/* Apply class */}
                  <span>{variant.title}</span>
                  <span className="product-detail-variant-price">${(variant.price / 100).toFixed(2)}</span> {/* Apply class */}
                  {/* Future: Add "Add to Cart" button here for each variant */}
                </div>
              ))
          ) : (
            // Message if no enabled variants are found after filtering
            <p className="product-detail-message">No enabled variants found for this product.</p>
          )
        ) : (
          // Message if no variants at all (or variants array is empty)
          <p className="product-detail-message">No variants available for this product.</p>
        )}
      </div>

      {/* Future: You can add an "Add to Cart" form, quantity selectors, etc. here */}
    </div>
  );
}

export default ProductDetailPage;