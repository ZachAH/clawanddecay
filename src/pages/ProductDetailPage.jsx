// src/pages/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const detailPageStyle = {
  padding: '20px',
  maxWidth: '900px',
  margin: '40px auto',
  backgroundColor: '#282828', /* Dark background for the detail card */
  borderRadius: '8px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
  color: 'var(--color-light-text)',
};

const productDetailImageStyle = {
  width: '100%',
  maxWidth: '500px', /* Limit image size */
  height: 'auto',
  borderRadius: '8px',
  marginBottom: '20px',
  display: 'block',
  margin: '0 auto',
};

const titleStyle = {
  fontSize: '2.5em',
  color: 'var(--color-accent-red)', /* Use your accent red */
  marginBottom: '10px',
  fontFamily: 'var(--font-heading)',
  textAlign: 'center',
};

const descriptionStyle = {
  fontSize: '1.1em',
  lineHeight: '1.6',
  marginBottom: '20px',
  color: 'var(--color-detail-grey)', /* Muted grey for description text */
};

const variantsContainerStyle = {
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
  const { productId } = useParams(); // Get the ID from the URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setProduct(data); // Set the single product data
      } catch (err) {
        console.error("Failed to fetch single product:", err);
        setError(err.message || "Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    if (productId) { // Only fetch if we have a product ID
      fetchProduct();
    } else {
      setLoading(false);
      setError("No product ID provided.");
    }
  }, [productId]); // Re-fetch if productId changes

  if (loading) {
    return <div style={detailPageStyle}>Loading product details...</div>;
  }

  if (error) {
    return <div style={detailPageStyle}>Error: {error}</div>;
  }

  if (!product) {
    return <div style={detailPageStyle}>Product not found.</div>;
  }

  // Find the first enabled variant to display its image, or fall back
  const primaryImageUrl = product.images && product.images.length > 0
    ? product.images[0].src
    : null;

  return (
    <div style={detailPageStyle}>
      <h1 style={titleStyle}>{product.title}</h1>
      <img
        src={primaryImageUrl || FALLBACK_IMAGE_URL}
        alt={product.title}
        style={productDetailImageStyle}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = FALLBACK_IMAGE_URL;
        }}
      />
      <p style={descriptionStyle} dangerouslySetInnerHTML={{ __html: product.description }}></p> {/* Render HTML description */}

      <div style={variantsContainerStyle}>
        <h3>Available Variants:</h3>
        {product.variants && product.variants.length > 0 ? (
          product.variants.filter(variant => variant.is_enabled).length > 0 ? (
            product.variants
              .filter(variant => variant.is_enabled) // Filter for enabled variants
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