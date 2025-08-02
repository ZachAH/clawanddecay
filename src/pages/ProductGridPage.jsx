// src/pages/ProductGridPage.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function ProductGridPage({ selectedTag, setSelectedTag }) {
  const query = useQuery();
  const tagFromUrl = query.get('tag') || 'All';

  // If the URL tag differs from prop/state, sync it
  React.useEffect(() => {
    if (tagFromUrl !== selectedTag) {
      setSelectedTag(tagFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagFromUrl]);

  return (
    <div>
      <ProductGrid selectedTag={selectedTag} />
    </div>
  );
}

export default ProductGridPage;
