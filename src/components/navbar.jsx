import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ onSelectTag }) {
  const location = useLocation();

  const merchTags = [
    "All",
    "Crewneck",
    "Long-Sleeve",
    "Hoodie",
    "Tee",
    "Snapback",
    "Quarter-Sleeve"
  ];

  return (
    <nav className="main-navbar">
      <ul className="navbar-list">
        <li className="navbar-item dropdown">
          <span className={`navbar-link ${location.pathname === '/' ? 'active-glow' : ''}`}>
            Merch
          </span>
          <div className="navbar-dropdown">
            {merchTags.map(tag => (
              <button
                key={tag}
                className="navbar-dropdown-link"
                onClick={() => onSelectTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
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
