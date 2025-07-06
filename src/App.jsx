// src/App.jsx
import React from 'react';
import ProductGrid from './components/ProductGrid';
import './App.css'; // Keep or modify your main app CSS for general styles

// --- Import your header image here ---
import headerImage from './assets/clawanddecay-header.png'; // <--- ADJUST THIS PATH AND FILENAME!
// If your image is an SVG, you might name it logo.svg, etc.

function App() {
  return (
    <div className="App" style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--color-dark-bg)', minHeight: '100vh', color: 'var(--color-light-text)' }}>
      <header style={{ backgroundColor: 'var(--color-dark-bg)', padding: '20px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
        {/* --- Replace the h1 with your image --- */}
        <img
          src={headerImage} // Use the imported image variable
          alt="Claw and Decay Logo" // IMPORTANT for accessibility! Describe your logo here.
          style={{ maxWidth: '300px', height: 'auto', marginBottom: '10px' }} // Basic inline style
        />
        <p style={{ fontSize: '1.2em', opacity: 0.8 }}>Unique Products for Unique Individuals</p>
      </header>

      <main style={{ padding: '20px' }}>
        <h2 style={{ textAlign: 'center', margin: '40px 0 20px', fontSize: '2em', color: 'var(--color-light-text)', fontFamily: 'var(--font-heading)' }}>Our Products</h2>
        <ProductGrid />
      </main>

      <footer style={{ backgroundColor: 'var(--color-dark-bg)', color: 'var(--color-light-text)', textAlign: 'center', padding: '20px', marginTop: 'auto', boxShadow: '0 -2px 4px rgba(0,0,0,0.2)' }}>
        <p>&copy; {new Date().getFullYear()} Claw and Decay. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;