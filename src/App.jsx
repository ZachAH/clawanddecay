// src/App.jsx
import React from 'react';
import ProductGrid from './components/ProductGrid';
import './App.css'; // This is where all your new CSS styles will go

// --- Import your header image here ---
import headerImage from './assets/clawanddecay-header.png'; // <-- ADJUST THIS PATH AND FILENAME TO YOUR ACTUAL IMAGE!

function App() {
  return (
    // The main App div will now get its base styles from App.css via the "App" class
    <div className="App">
      {/* Updated header with a class for styling in App.css */}
      <header className="app-header">
        <img
          src={headerImage} // Use the imported image variable
          alt="Claw and Decay Logo" // IMPORTANT for accessibility! Describe your logo here.
          className="header-logo" // Class for styling the logo in App.css
        />
        {/* The <p> tag with "Unique Products for Unique Individuals" has been removed */}
      </header>

      {/* Main content area with a class for styling */}
      <main className="app-main">
        {/* h2 tag now gets its font-family and color from global CSS or app-main styles */}
        <h2>Our Products</h2>
        <ProductGrid />
      </main>

      {/* Footer with a class for styling */}
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Claw and Decay. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;