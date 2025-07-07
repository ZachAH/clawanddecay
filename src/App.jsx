// src/App.jsx
import React from 'react';
// Import routing components
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import your page components (we'll create ProductDetailPage soon)
import ProductGridPage from './pages/ProductGridPage'; // We'll create this page component
import ProductDetailPage from './pages/ProductDetailPage'; // We'll create this page component

import './App.css';

// Import your header image
import headerImage from './assets/clawanddecay-header.png';


function App() {
  return (
    <Router> {/* Wrap your entire app with Router */}
      {/* The main App div will now get its base styles from App.css via the "App" class */}
      <div className="App">
        <header className="app-header">
          <img
            src={headerImage}
            alt="Claw and Decay Banner" // Alt text updated to reflect it's a banner
            className="header-banner-image" // New class for the banner image
          />        
        </header>

        {/* Main content area */}
        <main className="app-main">
          <Routes> {/* Define your routes here */}
            {/* Route for the homepage (your product grid) */}
            <Route path="/" element={<ProductGridPage />} />
            {/* Route for individual product detail pages */}
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            {/* You can add more routes here for About, Contact, Cart, etc. */}
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