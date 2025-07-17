// src/App.jsx
import React from 'react';
// Import routing components
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import your page components
import ProductGridPage from './pages/ProductGridPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ContactUsPage from './pages/ContactUsPage';
import OurStoryPage from './pages/OurStoryPage';
import FaqPage from './pages/faqPage';

import './App.css'; // Your main stylesheet

// --- IMPORT BOTH DESKTOP AND MOBILE HEADER IMAGES ---
import desktopHeaderImage from './assets/clawanddecay-header.webp'; // Your current wider desktop header image
import mobileHeaderImage from './assets/clawanddecay-header-mobile.webp'; // Your new mobile-optimized header image

// Import Navbar component
import Navbar from './components/navbar'; // Corrected casing to 'Navbar' if your file is 'Navbar.jsx'


function App() {
  return (
    <Router>
      <div className="App">
        {/* Header section with defined classes for styling in App.css */}
        <header className="app-header">
          {/* --- DESKTOP HEADER CONTENT (hidden on mobile) --- */}
          <div className="desktop-header-content">
            <img
              src={desktopHeaderImage} // Uses the imported desktop image
              alt="Claw and Decay Desktop Banner"
              className="header-banner-image" // Class for styling the desktop banner image
            />
          </div>

          {/* --- MOBILE HEADER CONTENT (hidden on desktop) --- */}
          <div className="mobile-header-content">
            <img
              src={mobileHeaderImage} // Uses the imported mobile image
              alt="Claw and Decay Mobile Banner"
              className="header-banner-mobile-image" // NEW class for mobile image styling
            />
          </div>
          
          {/* --- NAVBAR NESTED INSIDE THE HEADER --- */}
          <Navbar /> {/* The Navbar component, its styling will adapt via CSS */}
        </header>

        {/* Main content area where different pages will render based on the route */}
        <main className="app-main">
          <Routes>
            <Route path="/" element={<ProductGridPage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/contact-us" element={<ContactUsPage />} />
            <Route path="/our-story" element={<OurStoryPage />} />
            <Route path="/faq-page" element={<FaqPage />} />
          </Routes>
        </main>

        {/* Footer section with defined classes for styling in App.css */}
        <footer className="app-footer">
          <p>&copy; {new Date().getFullYear()} Claw and Decay. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;