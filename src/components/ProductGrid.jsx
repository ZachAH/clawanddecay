// src/components/ProductGrid.jsx
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

// Define how long each drop animation lasts (must match CSS @keyframes fallAndDrip)
const DROP_DURATION_MS = 1500; // 1.5 seconds per drip
// Define how frequently new drops appear
const NEW_DROP_INTERVAL_MS = 200; // New drop every 200ms

// Styles for the product grid container (moved from inline styles in previous steps)
// These styles should be in App.css and accessed via className="product-grid-container"
/*
const gridContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '20px',
  padding: '20px',
  justifyItems: 'center',
  maxWidth: '1200px',
  margin: '0 auto',
};
*/


function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // NEW STATE: To manage the individual blood drops for the animation
  const [drops, setDrops] = useState([]);
  const dropIdCounter = React.useRef(0); // To give unique IDs to drops


  useEffect(() => {
    const fetchProductsFromBackend = async () => {
      try {
        const response = await fetch('/.netlify/functions/get-products');

        if (!response.ok) {
          const errorDetails = await response.json();
          throw new Error(errorDetails.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProducts(data.data || []); // Correctly access the 'data' array from Printify's response

      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError(err.message || "Failed to load products from Printify.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductsFromBackend();
  }, []); // Empty dependency array means this effect runs only once after initial render


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


  // --- Conditional Rendering for Loading, Error, and No Products States ---
  if (loading) {
    return (
      // Apply the main container class for the product grid page's content,
      // and add inline styles for positioning the drops
      <div className="product-grid-container" style={{ position: 'relative', overflow: 'hidden', minHeight: '300px' }}>
        <div className="spinner-container"> {/* Apply the spinner container class */}
          {/* Render the individual blood drops */}
          {drops.map(drop => (
            <div
              key={drop.id}
              className="blood-stream-drop"
              // Apply dynamic left and animation duration as inline styles
              style={{ left: drop.left, animationDuration: `${DROP_DURATION_MS / 1000}s` }}
            ></div>
          ))}
          {/* Always display loading text on top of drops */}
          <span style={{ position: 'relative', zIndex: 10 }}>Loading products...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="product-grid-container" style={{ textAlign: 'center', padding: '20px', color: 'red' }}>Error: {error}</div>;
  }

  if (products.length === 0) {
    return <div className="product-grid-container" style={{ textAlign: 'center', padding: '20px' }}>No products found.</div>;
  }


  // --- Main Product Grid Content (when products are loaded) ---
  return (
    <div className="product-grid-container"> {/* Apply the class for the grid layout */}
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default ProductGrid;