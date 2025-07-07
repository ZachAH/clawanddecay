// src/pages/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// Basic inline styles (consider moving to CSS classes in App.css later)
const detailPageStyle = {
  padding: '20px',
  maxWidth: '900px',
  margin: '40px auto',
  backgroundColor: '#282828',
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
  const [currentImage, setCurrentImage] = useState(null); // New state for current main image

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

    if (productId) {
      fetchProduct();
    } else {
      setLoading(false);
      setError("No product ID provided.");
    }
  }, [productId]); // Depend on productId to re-fetch if URL changes

  // Function to handle thumbnail clicks
  const handleThumbnailClick = (imageUrl) => {
    setCurrentImage(imageUrl);
  };

  if (loading) {
    return <div style={detailPageStyle}>Loading product details...</div>;
  }

  if (error) {
    return <div style={detailPageStyle}>Error: {error}</div>;
  }

  if (!product) {
    return <div style={detailPageStyle}>Product not found.</div>;
  }

  return (
    <div style={detailPageStyle}>
      <h1 style={titleStyle}>{product.title}</h1>

      {/* Main Product Image */}
      <div style={productDetailImageContainerStyle}>
        <img
          src={currentImage || FALLBACK_IMAGE_URL}
          alt={product.title}
          style={productDetailImageStyle}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = FALLBACK_IMAGE_URL;
          }}
        />
      </div>

      {/* Thumbnail Gallery */}
      {product.images && product.images.length > 1 && ( // Only show if more than one image
        <div style={thumbnailContainerStyle}>
          {product.images.map((image, index) => (
            <img
              key={index} // Using index as key is okay if images array doesn't change order/items
              src={image.src || FALLBACK_IMAGE_URL}
              alt={`${product.title} view ${index + 1}`}
              style={{
                ...thumbnailStyle, // Apply base thumbnail style
                ...(image.src === currentImage ? activeThumbnailStyle : {}), // Apply active style if current
              }}
              onClick={() => handleThumbnailClick(image.src)}
              onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE_URL; }}
            />
          ))}
        </div>
      )}

      <p style={descriptionStyle} dangerouslySetInnerHTML={{ __html: product.description }}></p>

      <div style={variantsContainerStyle}>
        <h3>Available Variants:</h3>
        {product.variants && product.variants.length > 0 ? (
          product.variants.filter(variant => variant.is_enabled).length > 0 ? (
            product.variants
              .filter(variant => variant.is_enabled)
              .map(variant => (
                <div key={variant.id} style={variantStyle}>
                  <span>{variant.title}</span>
                  <span style={variantPriceStyle}>${(variant.price / 100).toFixed(2)}</span>
                  {/* You'd add an "Add to Cart" button here later */}
                </div>
              ))
          ) : (
            <p style={{ color: 'var(--color-detail-grey)' }}>No enabled variants found for this product.</p>
          )
        ) : (
          <p style={{ color: 'var(--color-detail-grey)' }}>No variants available for this product.</p>
        )}
      </div>

      {/* You can add a "Add to Cart" form here later */}
    </div>
  );
}

export default ProductDetailPage;