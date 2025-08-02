// src/pages/ProductGridPage.jsx
import React from 'react';
import ProductGrid from '../components/ProductGrid';

function ProductGridPage({ selectedTag = "All" }) {
  return (
    <div>
      <ProductGrid selectedTag={selectedTag} />
    </div>
  );
}

export default ProductGridPage;
