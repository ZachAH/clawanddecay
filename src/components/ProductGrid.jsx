// src/components/ProductGrid.jsx
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

// !!! IMPORTANT: Make sure this line is commented out or deleted !!!
// import { mockProducts } from '../data/mockProducts';

const gridContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '20px',
  padding: '20px',
  justifyItems: 'center',
  maxWidth: '1200px',
  margin: '0 auto',
};

function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductsFromBackend = async () => {
      try {
        // This is the call to your Netlify Function!
        const response = await fetch('/.netlify/functions/get-products');

        if (!response.ok) {
          const errorDetails = await response.json();
          throw new Error(errorDetails.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Printify's API returns products nested under a 'products' array
        // Make sure you access the correct key: `data.products`
        setProducts(data.data || []);

      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError(err.message || "Failed to load products from Printify.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductsFromBackend();
  }, []); // Empty dependency array means this effect runs only once after initial render

  if (loading) {
    //return <div style={{ textAlign: 'center', padding: '20px' }}>Loading products...</div>;
    return (
      <div style={{ /* Re-use the ProductGridPage's container if you define one, or just add some height */
        display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px'
      }}>
        <div className="spinner-container"> {/* Apply the spinner container class */}
          <div className="spinner"></div> {/* The actual spinner */}
          <span>Loading products...</span> {/* Your loading text */}
        </div>
      </div>
    );
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>Error: {error}</div>;
  }

  if (products.length === 0) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>No products found.</div>;
  }

  return (
    <div style={gridContainerStyle}>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default ProductGrid;