// src/pages/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import tshirtIcon from '../assets/icons/tshirt-icon.svg';


const FALLBACK_IMAGE_URL = "https://via.placeholder.com/400x300?text=No+Image";

const NUM_BLOOD_STREAMS = 20;
const STREAM_ANIMATION_CYCLE_MS = 4000;

function ProductDetailPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);

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
    };

    if (productId) {
      fetchProduct();
    } else {
      setLoading(false);
      setError("No product ID provided.");
    }
  }, [productId]);

  const handleThumbnailClick = (imageUrl) => {
    setCurrentImage(imageUrl);
  };

  // Check if product title includes "tee" (case-insensitive)
  const showTeeDescription = product?.title?.toLowerCase().includes("tee");

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

  return (
    <div className="product-detail-page-container">
      <h1 className="product-detail-title">{product.title}</h1>

      <div className="product-detail-image-and-description">
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

        {showTeeDescription && (
          <div className="tee-description-anim">
            <h2>COMFORT COLORS 1717</h2>
            <p>
            We print exclusively on these tees, widely regarded as the GOAT of T-shirt materials. Celebrated for their durable, high-quality fabric and rich, vintage-inspired colors. Soft, breathable, and built to last.            </p>
          </div>
        )}
      </div>

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

      {product.description && (
        <p className="product-detail-description" dangerouslySetInnerHTML={{ __html: product.description }}></p>
      )}

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
