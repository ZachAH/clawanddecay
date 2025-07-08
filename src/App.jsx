// src/App.jsx
import React from 'react';
// Import routing components
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import your page components
import ProductGridPage from './pages/ProductGridPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ContactUsPage from './pages/ContactUsPage'; // We'll create this
import OurStoryPage from './pages/OurStoryPage';   // We'll create this

import './App.css'; // Your main stylesheet

// Import your header image
import headerImage from './assets/clawanddecay-header.png'; // <-- Adjust this path and filename to your actual image!

// Import Navbar component
import Navbar from './components/navbar';


function App() {
  return (
    <Router> {/* Wrap your entire app with Router for client-side routing */}
      {/* The main App div gets its base styles from App.css via the "App" class */}
      <div className="App">
        {/* Header section with defined classes for styling in App.css */}
        <header className="app-header">
          <img
            src={headerImage} // Uses the imported image
            alt="Claw and Decay Banner" // Important for accessibility
            className="header-banner-image" // Class for styling the banner image
          />
        </header>
        <Navbar />
        {/* Main content area where different pages will render based on the route */}
        <main className="app-main">
          <Routes> {/* Defines your application's routes */}
            {/* Route for the homepage (your product grid) */}
            <Route path="/" element={<ProductGridPage />} />
            {/* Route for individual product detail pages, with a dynamic productId parameter */}
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            {/* Future: You can add more routes here for About, Contact, Cart, etc. */}
            <Route path="/contact-us" element={<ContactUsPage />} /> {/* New route */}
            <Route path="/our-story" element={<OurStoryPage />} />     {/* New route */}
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