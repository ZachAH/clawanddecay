// src/pages/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// Basic inline styles (consider moving these to CSS classes in App.css later for better maintainability)
const detailPageStyle = {
  padding: '20px',
  maxWidth: '900px',
  margin: '40px auto',
  backgroundColor: '#282828', /* Dark background for the detail card */
  borderRadius: '8px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
  color: 'var(--color-light-text)',
  display: 'flex',       // Use flexbox for layout
  flexDirection: 'column', // Stack children vertically
  alignItems: 'center',  // Center items horizontally
};

const productDetailImageContainerStyle = {
  width: '100%',
  maxWidth: '550px', // Main image max width
  marginBottom: '15px',
  backgroundColor: 'var(--color-dark-bg)', // Background for image area
  borderRadius: '8px',
  overflow: 'hidden', // Ensures image corners are rounded
};

const productDetailImageStyle = {
  width: '100%',
  height: 'auto',
  display: 'block',
};

const thumbnailContainerStyle = {
  display: 'flex',
  justifyContent: 'center', // Center thumbnails
  flexWrap: 'wrap', // Allow thumbnails to wrap to next line
  gap: '10px',      // Space between thumbnails
  marginBottom: '20px',
};

const thumbnailStyle = {
  width: '80px',    // Thumbnail size
  height: '80px',
  objectFit: 'cover',
  borderRadius: '4px',
  cursor: 'pointer',
  border: '2px solid transparent', // Default border
  transition: 'border 0.2s ease-in-out',
};

const activeThumbnailStyle = {
  borderColor: 'var(--color-accent-red)', // Highlight for active thumbnail
};

const titleStyle = {
  fontSize: '2.5em',
  color: 'var(--color-accent-red)',
  marginBottom: '10px',
  fontFamily: 'var(--font-heading)',
  textAlign: 'center',
  wordBreak: 'break-word', // Prevent very long titles from overflowing
};

const descriptionStyle = {
  fontSize: '1.1em',
  lineHeight: '1.6',
  marginBottom: '20px',
  color: 'var(--color-detail-grey)',
  textAlign: 'left',
};

const variantsContainerStyle = {
  width: '100%', // Ensure it takes full width of the detail page container
  marginTop: '20px',
  borderTop: '1px solid var(--color-detail-grey)',
  paddingTop: '20px',
};

const variantStyle = {
  backgroundColor: '#3A3A3A',
  padding: '10px',
  borderRadius: '5px',
  marginBottom: '10px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const variantPriceStyle = {
  fontWeight: 'bold',
  color: 'var(--color-accent-red)',
  fontSize: '1.1em',
};

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
      <div style={detailPageStyle}> {/* Use the same container style */}
        <div className="spinner-container"> {/* Apply the spinner container class (from App.css) */}
          <div className="spinner"></div> {/* The actual spinner (from App.css) */}
          <span>Loading product details...</span> {/* Your loading text */}
        </div>
      </div>
    );
  }

  if (error) {
    return <div style={detailPageStyle}>Error: {error}</div>;
  }

  if (!product) {
    return <div style={detailPageStyle}>Product not found.</div>;
  }

  // --- Main Product Detail Page Content (when product data is loaded) ---
  return (
    <div style={detailPageStyle}>
      <h1 style={titleStyle}>{product.title}</h1>

      {/* Main Product Image Display */}
      <div style={productDetailImageContainerStyle}>
        <img
          src={currentImage || FALLBACK_IMAGE_URL} // Display current image or fallback
          alt={product.title}
          style={productDetailImageStyle}
          onError={(e) => { // Handle cases where image fails to load (e.g., broken link)
            e.target.onerror = null; // Prevent infinite loop on error
            e.target.src = FALLBACK_IMAGE_URL; // Set fallback image on error
          }}
        />
      </div>

      {/* Thumbnail Gallery (only show if product has more than one image) */}
      {product.images && product.images.length > 1 && (
        <div style={thumbnailContainerStyle}>
          {product.images.map((image, index) => (
            <img
              key={image.src || index} // Use image.src as key if unique, otherwise index
              src={image.src || FALLBACK_IMAGE_URL}
              alt={`${product.title} view ${index + 1}`}
              style={{
                ...thumbnailStyle, // Apply base thumbnail style
                ...(image.src === currentImage ? activeThumbnailStyle : {}), // Apply active style if this is the current image
              }}
              onClick={() => handleThumbnailClick(image.src)} // Set main image on click
              onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE_URL; }}
            />
          ))}
        </div>
      )}

      {/* Product Description */}
      {/* dangerouslySetInnerHTML is used because Printify descriptions can contain HTML */}
      {product.description && <p style={descriptionStyle} dangerouslySetInnerHTML={{ __html: product.description }}></p>}

      {/* Available Variants Section */}
      <div style={variantsContainerStyle}>
        <h3>Available Variants:</h3>
        {product.variants && product.variants.length > 0 ? (
          // Filter variants to show only enabled ones
          product.variants.filter(variant => variant.is_enabled).length > 0 ? (
            product.variants
              .filter(variant => variant.is_enabled)
              .map(variant => (
                <div key={variant.id} style={variantStyle}>
                  <span>{variant.title}</span>
                  <span style={variantPriceStyle}>${(variant.price / 100).toFixed(2)}</span>
                  {/* Future: Add "Add to Cart" button here for each variant */}
                </div>
              ))
          ) : (
            // Message if no enabled variants are found after filtering
            <p style={{ color: 'var(--color-detail-grey)' }}>No enabled variants found for this product.</p>
          )
        ) : (
          // Message if no variants at all (or variants array is empty)
          <p style={{ color: 'var(--color-detail-grey)' }}>No variants available for this product.</p>
        )}
      </div>

      {/* Future: You can add an "Add to Cart" form, quantity selectors, etc. here */}
    </div>
  );
}

export default ProductDetailPage;