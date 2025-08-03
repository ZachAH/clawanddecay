import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // Make sure your CartContext exists and provides addToCart
import ReactSvgFallback from '../assets/react.svg'; // Adjust the path based on your file structure

const FALLBACK_IMAGE_URL = ReactSvgFallback;
const NUM_BLOOD_STREAMS = 20;
const STREAM_ANIMATION_CYCLE_MS = 4000;

function ProductDetailPage() {
  const { productId } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState(null);

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

        // Set initial selected variant if any enabled variants exist
        const enabledVariants = data.variants?.filter(v => v.is_enabled) || [];
        if (enabledVariants.length > 0) {
          setSelectedVariantId(enabledVariants[0].id);
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

  const handleAddToCart = () => {
    if (!selectedVariantId) {
      alert("Please select a variant.");
      return;
    }
    const selectedVariant = product.variants.find(v => v.id === selectedVariantId);
    if (!selectedVariant) {
      alert("Selected variant not found.");
      return;
    }

    addToCart({
      id: selectedVariant.id,
      title: `${product.title} - ${selectedVariant.title}`,
      price: selectedVariant.price,
      quantity: 1,
    });
    alert(`Added ${product.title} - ${selectedVariant.title} to cart.`);
  };

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

  const enabledVariants = product.variants.filter(v => v.is_enabled);

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
              We print exclusively on these tees, widely regarded as the GOAT of T-shirt materials. Celebrated for their durable, high-quality fabric and rich, vintage-inspired colors. Soft, breathable, and built to last.
            </p>
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

        {enabledVariants.length > 1 && (
          <select
            className="mb-4 w-full border rounded px-3 py-2"
            value={selectedVariantId}
            onChange={e => setSelectedVariantId(Number(e.target.value))}
          >
            {enabledVariants.map(variant => (
              <option key={variant.id} value={variant.id}>
                {variant.title} (${(variant.price / 100).toFixed(2)})
              </option>
            ))}
          </select>
        )}

        {enabledVariants.length === 1 && (
          <p>
            {enabledVariants[0].title} - ${(enabledVariants[0].price / 100).toFixed(2)}
          </p>
        )}

        {enabledVariants.length === 0 && (
          <p>No enabled variants available.</p>
        )}

        <button
          onClick={handleAddToCart}
          className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded mt-2 w-full"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductDetailPage;
