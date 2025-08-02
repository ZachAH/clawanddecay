// src/App.jsx
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

function App() {
  const [selectedTag, setSelectedTag] = useState('All');

  return (
    <Router>
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
          </Routes>
        </main>

        <footer className="app-footer">
          <p>&copy; {new Date().getFullYear()} Claw and Decay. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
