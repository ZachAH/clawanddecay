import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useCart } from '../context/CartContext';
import ReactSvgFallback from '../assets/react.svg';

const FALLBACK_IMAGE_URL = ReactSvgFallback;

function ProductDetailPage({ setLoading }) {
  const { productId } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [enabledVariants, setEnabledVariants] = useState([]);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  useEffect(() => {
    // This effect runs whenever productId changes, ensuring a fresh start.
    const fetchProduct = async () => {
      // Reset all state for the new product
      setProduct(null);
      setEnabledVariants([]);
      setError(null);
      setCurrentImage(null);
      setSelectedVariantId(null);

      if (!productId) {
        setError("No product ID provided.");
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(`/.netlify/functions/get-product-by-id?id=${productId}`);

        if (!response.ok) {
          const errorDetails = await response.json();
          throw new Error(errorDetails.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProduct(data);

        const mainImage = (data.images && data.images.length > 0) ? data.images[0].src : FALLBACK_IMAGE_URL;
        setCurrentImage(mainImage);

        const sizeOrder = ['XS', 'S', 'Small', 'M', 'Medium', 'L', 'Large', 'XL', '2XL', '3XL', '4XL'];
        const sortedEnabled = (data.variants?.filter(v => v.is_enabled) || []).sort((a, b) => {
          const aIndex = sizeOrder.findIndex(size => a.title.includes(size));
          const bIndex = sizeOrder.findIndex(size => b.title.includes(size));
          return (aIndex === -1 ? sizeOrder.length : aIndex) - (bIndex === -1 ? sizeOrder.length : bIndex);
        });

        setEnabledVariants(sortedEnabled);

        if (sortedEnabled.length > 0) {
          setSelectedVariantId(sortedEnabled[0].id);
        } else {
          setSelectedVariantId(null);
        }

      } catch (err) {
        console.error("Failed to fetch single product:", err);
        setError(err.message || "Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, setLoading]);

  const handleThumbnailClick = (imageUrl) => {
    setCurrentImage(imageUrl);
  };

  const handleAddToCart = () => {
    // Ensure we are using the most current state values here.
    if (!selectedVariantId) {
      alert("Please select a variant.");
      return;
    }

    const selectedVariant = enabledVariants.find(v => v.id === selectedVariantId);
    if (!selectedVariant || !product) {
      alert("Selected variant or product details are missing. Please try again.");
      return;
    }
    
    // --- UPDATED LOGIC HERE ---
    addToCart({
      productId: product.id,
      variantId: selectedVariant.id,
      product_title: product.title,
      variant_title: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      image_url: currentImage || FALLBACK_IMAGE_URL
    });

    alert(`Added ${product.title} - ${selectedVariant.title} to cart.`);
  };

  const title = product?.title?.toLowerCase() || "";
  const showTeeDescription = title.includes("tee");
  const showLongSleeveDescription = title.includes("long-sleeve");

  // --- Render logic remains the same ---
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

  // Strip HTML for meta description
  const plainDescription = (product.description || '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);

  // Build product structured data
  const lowestPrice = enabledVariants.length
    ? (Math.min(...enabledVariants.map(v => v.price)) / 100).toFixed(2)
    : null;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "description": plainDescription || `${product.title} from Claw & Decay.`,
    "image": currentImage || FALLBACK_IMAGE_URL,
    "brand": {
      "@type": "Brand",
      "name": "Claw & Decay"
    },
    ...(lowestPrice && {
      "offers": {
        "@type": "Offer",
        "priceCurrency": "USD",
        "price": lowestPrice,
        "availability": enabledVariants.length > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        "url": typeof window !== 'undefined' ? window.location.href : ''
      }
    })
  };

  return (
    <article className="product-detail-page-container" aria-labelledby="product-title">
      <Helmet>
        <title>{product.title} — Claw &amp; Decay</title>
        <meta
          name="description"
          content={plainDescription || `${product.title} — alternative streetwear from Claw & Decay.`}
        />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${product.title} — Claw & Decay`} />
        <meta property="og:description" content={plainDescription || `${product.title} from Claw & Decay.`} />
        <meta property="og:image" content={currentImage || FALLBACK_IMAGE_URL} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${product.title} — Claw & Decay`} />
        <meta name="twitter:image" content={currentImage || FALLBACK_IMAGE_URL} />
        <script type="application/ld+json">
          {JSON.stringify(productJsonLd)}
        </script>
      </Helmet>

      <h1 id="product-title" className="product-detail-title">{product.title}</h1>

      <div className="product-detail-image-and-description">
        <div className="product-detail-image-container">
          <img
            src={currentImage || FALLBACK_IMAGE_URL}
            alt={`${product.title} — Claw & Decay product photo`}
            className="product-detail-image"
            width="600"
            height="600"
            fetchpriority="high"
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
        {showLongSleeveDescription && (
          <div className="tee-description-anim">
            <h2>COMFORT COLORS 6014</h2>
            <p>
              We print exclusively on these long sleeves, the heavyweight champions of comfort. Crafted with ultra-soft, garment-dyed cotton for a lived-in feel and timeless look. Built to last, with rich colors and a relaxed fit that wears even better over time.
            </p>
          </div>
        )}

      </div>

      {product.images && product.images.length > 1 && (
        <div className="thumbnail-container" role="list" aria-label="Product image gallery">
          {product.images.map((image, index) => (
            <button
              key={image.src || index}
              type="button"
              onClick={() => handleThumbnailClick(image.src)}
              aria-label={`View image ${index + 1} of ${product.title}`}
              aria-pressed={image.src === currentImage}
              className="thumbnail-button"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <img
                src={image.src || FALLBACK_IMAGE_URL}
                alt={`${product.title} — view ${index + 1}`}
                className={`thumbnail-image ${image.src === currentImage ? 'active' : ''}`}
                loading="lazy"
                width="86"
                height="86"
                onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE_URL; }}
              />
            </button>
          ))}
        </div>
      )}

      {product.description && (
        <p className="product-detail-description" dangerouslySetInnerHTML={{ __html: product.description }}></p>
      )}

      <div className="product-detail-variants-container">
        <h2>Available Variants</h2>

        {enabledVariants.length > 1 && (
          <>
            <label htmlFor="variant-select" className="visually-hidden">
              Choose a variant
            </label>
            <select
              id="variant-select"
              className="mb-4 w-full border rounded px-3 py-2"
              value={selectedVariantId || ''}
              onChange={e => setSelectedVariantId(Number(e.target.value))}
              aria-label="Choose a product variant"
            >
              {enabledVariants.map(variant => (
                <option key={variant.id} value={variant.id}>
                  {variant.title} (${(variant.price / 100).toFixed(2)})
                </option>
              ))}
            </select>
          </>
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
          type="button"
          onClick={handleAddToCart}
          className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded mt-2 w-full"
          aria-label={`Add ${product.title} to cart`}
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}

export default ProductDetailPage;