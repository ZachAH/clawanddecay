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
              <Route path="/products/:productId" element={<ProductDetailPage />} />
              <Route path="/contact-us" element={<ContactUsPage />} />
              <Route path="/our-story" element={<OurStoryPage />} />
              <Route path="/faq-page" element={<FaqPage />} />
              <Route path="/cart" element={<CartPage />} />

              {/* Added routes for Stripe redirect */}
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/cancel" element={<CancelPage />} />

              {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
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
