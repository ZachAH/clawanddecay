// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation

function Navbar() {
  return (
    <nav className="main-navbar"> {/* Apply a class for styling in App.css */}
      <ul className="navbar-list"> {/* Apply a class for styling the list */}
        <li className="navbar-item">
          <Link to="/" className="navbar-link">Merch</Link> {/* Link to your homepage */}
        </li>
        <li className="navbar-item">
          <Link to="/contact-us" className="navbar-link">Contact Us</Link> {/* Link to Contact Us page */}
        </li>
        <li className="navbar-item">
          <Link to="/our-story" className="navbar-link">Our Story</Link> {/* Link to Our Story page */}
        </li>
        <li className="navbar-item">
          <Link to="/faq-page" className="navbar-link">FAQ</Link> {/* Link to Our Story page */}
        </li>
        {/* Future: Add a link for the shopping cart here */}
      </ul>
    </nav>
  );
}

export default Navbar;