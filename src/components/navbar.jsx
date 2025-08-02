import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ProductGrid from './ProductGrid'; // Make sure the path is correct

function Navbar() {
  const location = useLocation();
  const [showMerch, setShowMerch] = useState(false);

  return (
    <nav className="main-navbar">
      <ul className="navbar-list">
        <li
          className="navbar-item merch-item"
          onMouseEnter={() => setShowMerch(true)}
          onMouseLeave={() => setShowMerch(false)}
          style={{ position: 'relative' }} // ensure dropdown positions correctly
        >
          {/* Merch link stays clickable */}
          <Link
            to="/"
            className={`navbar-link ${location.pathname === '/' ? 'active-glow' : ''}`}
            onClick={(e) => e.preventDefault()} // optional: prevent navigation on click if you want
          >
            Merch
          </Link>

          {/* Merch dropdown with product grid */}
          {showMerch && (
            <div className="merch-dropdown">
              <ProductGrid showTagSelector={true} />
            </div>
          )}
        </li>

        <li className="navbar-item">
          <Link
            to="/contact-us"
            className={`navbar-link ${location.pathname === '/contact-us' ? 'active-glow' : ''}`}
          >
            Contact Us
          </Link>
        </li>

        <li className="navbar-item">
          <Link
            to="/our-story"
            className={`navbar-link ${location.pathname === '/our-story' ? 'active-glow' : ''}`}
          >
            Our Story
          </Link>
        </li>

        <li className="navbar-item">
          <Link
            to="/faq-page"
            className={`navbar-link ${location.pathname === '/faq-page' ? 'active-glow' : ''}`}
          >
            FAQ
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
