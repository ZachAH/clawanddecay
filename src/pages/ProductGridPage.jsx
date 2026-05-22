// src/pages/ProductGridPage.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import ProductGrid from '../components/ProductGrid';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const merchSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Shop Merch — Claw & Decay',
  description:
    'Browse all alternative streetwear from Claw & Decay. Limited drops, graphic tees, hoodies, and more — small-batch quality for the metal and punk scenes.',
  url: 'https://clawanddecay.com/merch',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://clawanddecay.com/' },
      { '@type': 'ListItem', position: 2, name: 'Merch', item: 'https://clawanddecay.com/merch' },
    ],
  },
};

function ProductGridPage({ selectedTag, setSelectedTag }) {
  const query = useQuery();
  const tagFromUrl = query.get('tag') || 'All';

  React.useEffect(() => {
    if (tagFromUrl !== selectedTag) {
      setSelectedTag(tagFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagFromUrl]);

  return (
    <div>
      <Helmet>
        <title>Shop Death Metal Merch — Claw &amp; Decay</title>
        <meta
          name="description"
          content="Browse all death metal and alternative clothing from Claw & Decay. Limited drops, graphic tees, hoodies — human-made art by real artists, no AI. Small-batch quality from Milwaukee, WI."
        />
        <link rel="canonical" href="https://clawanddecay.com/merch" />
        <meta property="og:title" content="Shop Death Metal Merch — Claw & Decay" />
        <meta
          property="og:description"
          content="Browse all death metal and alternative clothing. Limited drops, graphic tees, hoodies — human-made art, no AI, small-batch quality."
        />
        <meta property="og:url" content="https://clawanddecay.com/merch" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://clawanddecay.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Shop Merch — Claw & Decay" />
        <meta name="twitter:image" content="https://clawanddecay.com/og-image.jpg" />
        <script type="application/ld+json">{JSON.stringify(merchSchema)}</script>
      </Helmet>
      <ProductGrid selectedTag={selectedTag} />
    </div>
  );
}

export default ProductGridPage;
