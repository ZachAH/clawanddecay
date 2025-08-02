import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import ProductCard from './ProductCard';

function extractTagFromTitle(title) {
  const TAGS = ["Crewneck", "Long-Sleeve", "Hoodie", "Tee", "Snapback", "Quarter-Sleeve"];
  const words = title.trim().split(/\s+/);
  const lastWord = words[words.length - 1].toLowerCase();
  return TAGS.find(tag => tag.toLowerCase() === lastWord) || "Other";
}

function ProductGrid({ showTagSelector = true }) {
  const [products, setProducts] = useState([]);
  const [selectedTag, setSelectedTag] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
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
        setError(err.message || "Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return selectedTag === "All" ? products : products.filter(p => p.tag === selectedTag);
  }, [products, selectedTag]);

  const uniqueTags = ["All", ...new Set(products.map(p => p.tag))];

  const firstImageUrl = filteredProducts.length > 0 && filteredProducts[0].images?.[0]?.src;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader" />
      </div>
    );
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (filteredProducts.length === 0) {
    return <div className="no-products">No products found.</div>;
  }

  return (
    <div className="product-grid-wrapper">
      <Helmet>
        {firstImageUrl && (
          <link rel="preload" as="image" href={firstImageUrl} />
        )}
      </Helmet>

      <div className="product-grid-container">
        {filteredProducts.map((product, idx) => (
          <ProductCard
            key={product.id}
            product={product}
            isFirst={idx === 0} // eager load the first visible product image
          />
        ))}
      </div>
    </div>
  );
}

export default ProductGrid;
