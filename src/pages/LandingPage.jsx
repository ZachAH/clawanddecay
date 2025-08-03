// src/pages/LandingPage.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import './LandingPage.css'; // landing-specific styles
import landingBgWebm from '../assets/CAD_vid.webm'; // your converted webm

// Featured products loader (reuse existing cached-products endpoint)
async function fetchFeaturedProducts() {
  const res = await fetch('/.netlify/functions/get-cached-products');
  const data = await res.json();
  const products = (data.data || []).slice(0, 3); // top 6
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

function LandingPage({ selectedTag = 'All' }) {
  const [featured, setFeatured] = useState([]);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const navigate = useNavigate();

  // fetch featured products once
  useEffect(() => {
    fetchFeaturedProducts().then(setFeatured).catch(console.error);
  }, []);

  // Hero mouse parallax (disabled for reduced motion)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
    // TODO: wire up real email capture / backend
    setSubmitted(true);
  };

  const handleShopNow = () => {
    // navigate to merch; preserve tag in query if desired
    navigate('/merch');
  };

  return (
    <div className="landing-page">
      <section className="hero" ref={heroRef}>
        {/* Background video only (no fallback mp4) */}
        {!window.matchMedia('(prefers-reduced-motion: reduce)').matches && (
          <div className="video-wrapper">
            <video
              className="hero-video"
              autoPlay
              muted
              loop
              playsInline
              poster="/assets/hero-poster.jpg" // optional poster image
              preload="auto"
              aria-hidden="true"
            >
              <source src={landingBgWebm} type="video/webm" />
              {/* No mp4 fallback */}
            </video>
          </div>
        )}

        <div className="hero-overlay" />

        <div className="hero-content">
          {/* Logo removed as requested */}
          {/* Removed button from here */}
        </div>
      </section>

      {/* New container for button below the video */}
      <div className="button-wrapper">
        <button className="hero-cta" onClick={handleShopNow}>
          Shop The Drop
        </button>
      </div>

      <section className="features" ref={featuresRef}>
        <div className="feature-item">
          <h2>For the Misfits & the Loud</h2>
          <p>We don’t fit in out there. But in here — lost in the music, shoulder to shoulder with strangers who feel like family — we belong.
          That feeling, that unity, is what this brand is built on. For the outcasts, the loud, the ones who live for the moments when the music hits and you’re surrounded by like-minded souls — this is your brand.

</p>
        </div>
        <div className="feature-item">
          <h2>Premium Materials</h2>
          <p>
          Comfort without compromise—crafted to last in and out of the PIT...or BAR.🤘
          </p>
        </div>
        <div className="feature-item">
          <h2>Made From The Ground Up</h2>
          <p>This website and products built with care and passion, straight from the MIDWEST! Every release is one of a kind. We work with artists in and from the
          scene to create our products! NO AI Here!!</p>
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

      {/* <section className="email-signup">
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
      </section> */}
    </div>
  );
}

export default LandingPage;
