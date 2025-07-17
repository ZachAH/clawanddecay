import React, { useState, useEffect, useMemo } from 'react';
import ProductCard from './ProductCard';
import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

const NUM_BLOOD_STREAMS = 20;
const STREAM_ANIMATION_CYCLE_MS = 4000;

// Helper to extract tag from product title
function extractTagFromTitle(title) {
  const TAGS = ["Crewneck", "Long-Sleeve", "Hoodie", "Tee", "Snapback", "Quarter-Sleeve"];
  const words = title.trim().split(/\s+/);
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
        const response = await fetch('/.netlify/functions/get-cached-products');
        if (!response.ok) {
          const errorDetails = await response.json();
          throw new Error(errorDetails.message || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
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

  const filteredProducts = useMemo(() => {
    return selectedTag === "All" ? products : products.filter(p => p.tag === selectedTag);
  }, [products, selectedTag]);

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
      <div className="product-grid-container text-center py-6 text-red-500">
        Error: {error}
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="product-grid-container text-center py-6">
        No products found.
      </div>
    );
  }

  const uniqueTags = ["All", ...new Set(products.map(p => p.tag))];

  const columnWidth = 300;
  const rowHeight = 420;

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

      {/* Virtualized Responsive Grid */}
      <div style={{ height: '80vh' }}>
        <AutoSizer>
          {({ height, width }) => {
            const columnCount = Math.max(1, Math.floor(width / columnWidth));
            const rowCount = Math.ceil(filteredProducts.length / columnCount);

            const Cell = ({ columnIndex, rowIndex, style }) => {
              const productIndex = rowIndex * columnCount + columnIndex;
              if (productIndex >= filteredProducts.length) return null;
              const product = filteredProducts[productIndex];

              return (
                <div style={style}>
                  <ProductCard product={product} />
                </div>
              );
            };

            return (
              <Grid
                columnCount={columnCount}
                columnWidth={columnWidth}
                height={height}
                rowCount={rowCount}
                rowHeight={rowHeight}
                width={width}
              >
                {Cell}
              </Grid>
            );
          }}
        </AutoSizer>
      </div>
    </div>
  );
}

export default ProductGrid;
