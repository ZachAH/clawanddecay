// src/components/ProductGrid.jsx
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

// No longer needed here as styles are in App.css
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

// --- NEW CONSTANTS FOR BLOOD STREAM LOADER ---
// Number of blood streams/drips to show simultaneously
const NUM_BLOOD_STREAMS = 5; // Adjust this number for more or fewer streams
// Total duration of one full cycle for all streams (must match CSS animation-duration)
const STREAM_ANIMATION_CYCLE_MS = 4000; // 4 seconds for one full cycle


function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Removed 'drops' state and 'dropIdCounter' ref as they are no longer needed for this stream effect


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


  // Removed the useEffect that previously managed 'drops' via setInterval
  // as the blood stream animation is now handled purely by CSS animation-delay and rendering fixed elements.


  // --- Conditional Rendering for Loading, Error, and No Products States ---
  if (loading) {
    return (
      // Apply the main container class for the product grid page's content,
      // and add inline styles for positioning the drops
      <div className="product-grid-container" style={{ position: 'relative', overflow: 'hidden', minHeight: '300px' }}>
        <div className="spinner-container"> {/* Apply the spinner container class */}
          <div className="blood-stream-animation-wrapper">
            {/* Render a fixed number of blood stream drip elements */}
            {Array.from({ length: NUM_BLOOD_STREAMS }).map((_, i) => (
              <div
                key={i} // Use index as key here, as these are static instances
                className="blood-stream-drip"
                // Apply dynamic left and animation duration as inline styles
                style={{
                  left: `${(i / NUM_BLOOD_STREAMS) * 90 + 5}%`, // Distribute horizontally
                  animation: `bloodStreamDrip ${STREAM_ANIMATION_CYCLE_MS / 1000}s linear infinite`,
                  animationDelay: `${(STREAM_ANIMATION_CYCLE_MS / NUM_BLOOD_STREAMS / 1000) * i}s`, // Stagger animation start
                }}
              ></div>
            ))}
          </div>
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