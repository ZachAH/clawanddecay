// src/components/ProductGrid.jsx
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard'; // Import the ProductCard component
import { mockProducts } from '../data/mockProducts'; // Import your mock data

const gridContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', // Responsive grid
  gap: '20px',
  padding: '20px',
  justifyItems: 'center', // Center items horizontally in the grid cells
  maxWidth: '1200px', // Max width for the grid
  margin: '0 auto', // Center the grid container itself
};

function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate fetching data, e.g., from an API
    // In a real scenario, this would be your fetch('/.netlify/functions/get-products') call
    try {
      // Simulate a network delay
      setTimeout(() => {
        setProducts(mockProducts); // Set the mock data
        setLoading(false);
      }, 500); // 500ms delay to simulate loading
    } catch (err) {
      setError("Failed to load products.");
      setLoading(false);
    }
  }, []); // Empty dependency array means this effect runs only once after initial render

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading products...</div>;
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