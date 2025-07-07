// src/pages/ProductDetailPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom'; // To get the product ID from the URL

function ProductDetailPage() {
  const { productId } = useParams(); // Get the ID from the URL, e.g., /products/123 -> productId is "123"

  return (
    <div>
      <h2>Product Details for: {productId}</h2>
      <p>Loading product information...</p>
      {/* We'll add the actual fetch logic and display here in the next steps */}
    </div>
  );
}

export default ProductDetailPage;