// src/App.jsx
import React from 'react';
import ProductGrid from 'ß/components/ProductGrid'; // Import your new ProductGrid component
import './App.css'; // Keep or modify your main app CSS for general styles

function App() {
  return (
    <div className="App" style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <header style={{ backgroundColor: '#282c34', padding: '20px', color: 'white', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
        <h1 style={{ margin: 0, fontSize: '2.5em' }}>Claw and Decay</h1>
        <p style={{ fontSize: '1.2em', opacity: 0.8 }}>Unique Products for Unique Individuals</p>
      </header>

      <main style={{ padding: '20px' }}>
        <h2 style={{ textAlign: 'center', margin: '40px 0 20px', fontSize: '2em', color: '#333' }}>Our Products</h2>
        <ProductGrid /> {/* This is where your products will appear! */}
      </main>

      <footer style={{ backgroundColor: '#282c34', color: 'white', textAlign: 'center', padding: '20px', marginTop: 'auto', boxShadow: '0 -2px 4px rgba(0,0,0,0.2)' }}>
        <p>&copy; {new Date().getFullYear()} Claw and Decay. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;