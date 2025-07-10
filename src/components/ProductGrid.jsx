import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

const NUM_BLOOD_STREAMS = 20;
const STREAM_ANIMATION_CYCLE_MS = 4000;

// Helper to extract tag from product title
function extractTagFromTitle(title) {
  const TAGS = ["Crewneck", "Long-Sleeve", "Hoodie", "Tee", "Snapback", "Quarter-Sleeve"];
  const words = title.trim().split(/\s+/); // Split by space
  const lastWord = words[words.length - 1].toLowerCase();

  return TAGS.find(tag => tag.toLowerCase() === lastWord) || "Other";
}

function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [selectedTag, setSelectedTag] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductsFromBackend = async () => {
      try {
        const response = await fetch('/.netlify/functions/get-products');

        if (!response.ok) {
          const errorDetails = await response.json();
          throw new Error(errorDetails.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Tag each product
        const taggedProducts = (data.data || []).map(product => ({
          ...product,
          tag: extractTagFromTitle(product.title)
        }));

        setProducts(taggedProducts);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError(err.message || "Failed to load products from Printify.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductsFromBackend();
  }, []);

  if (loading) {
    return (
      <div className="product-grid-container" style={{ position: 'relative', overflow: 'hidden', minHeight: '300px' }}>
        <div className="spinner-container">
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
          <span style={{ position: 'relative', zIndex: 10 }}>Loading products...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-grid-container" style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
        Error: {error}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="product-grid-container" style={{ textAlign: 'center', padding: '20px' }}>
        No products found.
      </div>
    );
  }

  // Unique tags from products
  const uniqueTags = ["All", ...new Set(products.map(p => p.tag))];

  // Filtered products
  const filteredProducts =
    selectedTag === "All" ? products : products.filter(p => p.tag === selectedTag);

  return (
    <div className="product-grid-wrapper">
      {/* Tag Filter */}
      <div className="tag-selector flex flex-wrap gap-2 py-4 justify-center">
        {uniqueTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
              selectedTag === tag
                ? "bg-yellow-600 text-black border-yellow-600"
                : "bg-black text-yellow-500 border-yellow-500 hover:bg-yellow-500 hover:text-black"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="product-grid-container">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default ProductGrid;
