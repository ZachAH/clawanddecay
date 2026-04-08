import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ProductGridPage from './pages/ProductGridPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ContactUsPage from './pages/ContactUsPage';
import OurStoryPage from './pages/OurStoryPage';
import FaqPage from './pages/faqPage';
import './App.css';
import desktopHeaderImage from './assets/clawanddecay-header.webp';
import mobileHeaderImage from './assets/clawanddecay-header-mobile.webp';
import Navbar from './components/navbar';
import { CartProvider } from './context/CartContext';
import CartPage from './pages/CartPage';
import stripeLogo from './assets/stripe.png'
import Chatbot from './components/chatbot'


// Google Analytics route-change tracker.
// Fires a `page_view` event on every SPA navigation so GA4 sees every route.
function RouteChangeTracker() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [location]);

  return null;
}

// Rock hands loader component
function RockHandsLoader() {
  const numHands = 15;
  const hands = Array.from({ length: numHands }).map((_, i) => {
    const left = Math.floor(Math.random() * 100); // random horizontal position
    const delay = Math.random() * 2; // random stagger
    return (
      <div
        key={i}
        className="hand"
        style={{
          left: `${left}%`,
          animationDelay: `${delay}s`,
        }}
      >
        🤘
      </div>
    );
  });

  return <div className="loading-screen">{hands}</div>;
}

// Simple Success Page component
function SuccessPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">Thank you for your order!</h1>
      <p>Your payment was successful. We’ll send you a confirmation email shortly.</p>
    </div>
  );
}

// Simple Cancel Page component
function CancelPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">Order canceled</h1>
      <p>Your checkout was canceled. You can continue shopping or try again anytime.</p>
    </div>
  );
}

function App() {
  const [selectedTag, setSelectedTag] = useState('All');
  const [loading, setLoading] = useState(false); // Loading state here

  return (
    <Router>
      <RouteChangeTracker />
      <CartProvider>
        <div className="App">
          {/* WCAG: Skip to main content link for keyboard / screen-reader users */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>

          <header className="app-header" role="banner">
            <div className="desktop-header-content">
              <img
                src={desktopHeaderImage}
                alt="Claw and Decay — Alternative streetwear brand banner"
                className="header-banner-image"
                width="1200"
                height="300"
                fetchpriority="high"
              />
            </div>
            <div className="mobile-header-content">
              <img
                src={mobileHeaderImage}
                alt="Claw and Decay — Alternative streetwear brand banner"
                className="header-banner-mobile-image"
                width="400"
                height="100"
                fetchpriority="high"
              />
            </div>
            <Navbar selectedTag={selectedTag} onSelectTag={setSelectedTag} />
          </header>

          <main className="app-main" id="main-content" role="main" tabIndex="-1">
            {/* Show loading spinner when loading is true */}
            {loading && (
              <div className="loading-overlay" role="status" aria-live="polite" aria-label="Loading content">
                {/* Your cool loading animation here, e.g., the rock hands or just text */}
                <div className="spinner-container" style={{ position: 'relative', overflow: 'hidden', width: '100%' }}>
                  <div className="rock-hands-fall-wrapper">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={i}
                        className="rock-hand"
                        style={{
                          left: `${(i / 20) * 90 + 5}%`,
                          animationDelay: `${(4000 / 20 / 1000) * i}s`,
                        }}
                      >
                        🤘
                      </div>
                    ))}
                  </div>
                  <span style={{ position: 'relative', zIndex: 10 }}>Loading...</span>
                </div>
              </div>
            )}

            <Routes>
              <Route path="/" element={<LandingPage selectedTag={selectedTag} />} />
              <Route
                path="/merch"
                element={
                  <ProductGridPage
                    selectedTag={selectedTag}
                    setSelectedTag={setSelectedTag}
                  />
                }
              />
              {/* Pass setLoading prop to ProductDetailPage */}
              <Route path="/products/:productId" element={<ProductDetailPage setLoading={setLoading} />} />
              <Route path="/contact-us" element={<ContactUsPage />} />
              <Route path="/our-story" element={<OurStoryPage />} />
              <Route path="/faq-page" element={<FaqPage />} />
              <Route path="/cart" element={<CartPage />} />

              {/* Stripe redirect routes */}
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/cancel" element={<CancelPage />} />
            </Routes>
          </main>

          <footer className="app-footer flex flex-col items-center gap-2 p-6 bg-black text-white" role="contentinfo" aria-label="Site footer">
            <p>&copy; {new Date().getFullYear()} Claw and Decay. All rights reserved.</p>

            <div className="footer-logos flex flex-wrap justify-center gap-4 mt-2" aria-label="Built with">
              <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" alt="React logo" className="footer-logo" loading="lazy" width="40" height="40" />
              <img src={stripeLogo} alt="Powered by Stripe" className="footer-logo" loading="lazy" width="40" height="40" />
              <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/firebase/firebase-plain.svg" alt="Firebase logo" className="footer-logo" loading="lazy" width="40" height="40" />
              <img src="https://www.vectorlogo.zone/logos/netlify/netlify-icon.svg" alt="Netlify logo" className="footer-logo" loading="lazy" width="40" height="40" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/9/99/Unofficial_JavaScript_logo_2.svg" alt="JavaScript logo" className="footer-logo" loading="lazy" width="40" height="40" />
            </div>
          </footer>
          <Chatbot />
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
