import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import ProductCard from './ProductCard';

function extractTagFromTitle(title) {
  const TAGS = ["Crewneck", "Long-Sleeve", "Hoodie", "Tee", "Snapback", "Quarter-Sleeve"];
  const words = title.trim().split(/\s+/);
  const lastWord = words[words.length - 1].toLowerCase();
  return TAGS.find(tag => tag.toLowerCase() === lastWord) || "Other";
}

function ProductGrid({ selectedTag = "All" }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track when filtering happens to show skeleton briefly if selectedTag changes
  const [isFiltering, setIsFiltering] = useState(false);
  const prevTagRef = React.useRef(selectedTag);

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
          tag: extractTagFromTitle(product.title),
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

  // Detect tag change to briefly show filtering skeleton
  useEffect(() => {
    if (prevTagRef.current !== selectedTag) {
      setIsFiltering(true);
      const t = setTimeout(() => {
        setIsFiltering(false);
      }, 300); // small delay to simulate transition; adjust if needed
      prevTagRef.current = selectedTag;
      return () => clearTimeout(t);
    }
  }, [selectedTag]);

  const filteredProducts = useMemo(() => {
    return selectedTag === "All" ? products : products.filter(p => p.tag === selectedTag);
  }, [products, selectedTag]);

  const firstImageUrl = filteredProducts.length > 0 && filteredProducts[0].images?.[0]?.src;

  if (loading) {
    return (
      <div className="product-grid-wrapper">
        <div className="product-grid-container">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="product-skeleton" key={i}>
              <div className="skeleton-image" />
              <div className="skeleton-text" style={{ width: '80%' }} />
              <div className="skeleton-price" />
            </div>
          ))}
        </div>
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
        {firstImageUrl && <link rel="preload" as="image" href={firstImageUrl} />}
      </Helmet>

      <div className="product-grid-container">
        {(isFiltering
          ? Array.from({ length: Math.min(6, filteredProducts.length) }).map((_, i) => (
              <div className="product-skeleton" key={`filter-skel-${i}`}>
                <div className="skeleton-image" />
                <div className="skeleton-text" style={{ width: '70%' }} />
                <div className="skeleton-price" />
              </div>
            ))
          : filteredProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                isFirst={idx === 0}
              />
            )))}
      </div>
    </div>
  );
}

export default ProductGrid;
