import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
      <CartProvider>
        <div className="App">
          <header className="app-header">
            <div className="desktop-header-content">
              <img
                src={desktopHeaderImage}
                alt="Claw and Decay Desktop Banner"
                className="header-banner-image"
              />
            </div>
            <div className="mobile-header-content">
              <img
                src={mobileHeaderImage}
                alt="Claw and Decay Mobile Banner"
                className="header-banner-mobile-image"
              />
            </div>
            <Navbar selectedTag={selectedTag} onSelectTag={setSelectedTag} />
          </header>

          <main className="app-main">
            {/* Show loading spinner when loading is true */}
            {loading && (
              <div className="loading-overlay">
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
              {/* This is the key change to fix the stale state bug */}
              <Route
                path="/products/:productId"
                element={<ProductDetailPage setLoading={setLoading} key={location.pathname} />}
              />
              <Route path="/contact-us" element={<ContactUsPage />} />
              <Route path="/our-story" element={<OurStoryPage />} />
              <Route path="/faq-page" element={<FaqPage />} />
              <Route path="/cart" element={<CartPage />} />

              {/* Stripe redirect routes */}
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/cancel" element={<CancelPage />} />
            </Routes>
          </main>

          <footer className="app-footer">
            <p>&copy; {new Date().getFullYear()} Claw and Decay. All rights reserved.</p>
          </footer>
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;