// src/pages/LandingPage.jsx
import React, { useEffect, useRef, useState } from 'react';
import ProductCard from '../components/ProductCard';
import './LandingPage.css'; // create alongside for specific styles

// Dummy featured products fetcher; you can replace with your real fetch logic or pass down via props
async function fetchFeaturedProducts() {
  const res = await fetch('/.netlify/functions/get-cached-products');
  const data = await res.json();
  const products = (data.data || []).slice(0, 6); // top 6
  return products;
}

function useRevealOnScroll(ref, options = {}) {
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, ...options }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options]);
}

function LandingPage({ selectedTag }) {
  const [featured, setFeatured] = useState([]);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);

  // fetch featured products once
  useEffect(() => {
    fetchFeaturedProducts().then(setFeatured).catch(console.error);
  }, []);

  // Hero mouse parallax
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const handle = (e) => {
      const rect = el.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
      const dy = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
      el.style.setProperty('--px', dx.toFixed(3));
      el.style.setProperty('--py', dy.toFixed(3));
    };
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, []);

  // reveal on scroll for features
  useRevealOnScroll(featuresRef);

  const handleSignup = (e) => {
    e.preventDefault();
    // stub: send to your email list backend
    setSubmitted(true);
  };

  return (
    <div className="landing-page">
      <section className="hero" ref={heroRef}>
        <div className="hero-content">
          <h1 className="hero-title">Claw & Decay</h1>
          <p className="hero-sub">
            Streetwear with bite. Limited drops. Bold statements.
          </p>
          <button className="hero-cta">Shop The Drop</button>
        </div>
        <div className="hero-overlay" />
      </section>

      <section className="features" ref={featuresRef}>
        <div className="feature-item">
          <h2>Premium Materials</h2>
          <p>Comfort without compromise—crafted to last.</p>
        </div>
        <div className="feature-item">
          <h2>Limited Editions</h2>
          <p>Every release is one of a kind. No restocks.</p>
        </div>
        <div className="feature-item">
          <h2>Made in Small Batches</h2>
          <p>Built with care, not mass-produced.</p>
        </div>
      </section>

      <section className="featured-products">
        <h2>Featured Drops</h2>
        <div className="product-grid">
          {featured.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              isFirst={idx === 0}
            />
          ))}
        </div>
      </section>

      <section className="email-signup">
        <div className="signup-inner">
          <div className="signup-text">
            <h3>Get Early Access</h3>
            <p>Join the list for exclusive drops and restock alerts.</p>
          </div>
          <form onSubmit={handleSignup} className="signup-form">
            <div className="input-wrapper">
              <input
                type="email"
                required
                placeholder="youremail@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitted}
              />
              <label className={email ? 'filled' : ''}>Email Address</label>
            </div>
            <button type="submit" disabled={submitted}>
              {submitted ? 'Thanks!' : 'Join'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
