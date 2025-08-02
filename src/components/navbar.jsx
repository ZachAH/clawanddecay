// src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Navbar({ selectedTag, onSelectTag }) {
  const location = useLocation();
  const navigate = useNavigate();

  const merchTags = [
    "All",
    "Crewneck",
    "Long-Sleeve",
    "Hoodie",
    "Tee",
    "Snapback",
    "Quarter-Sleeve"
  ];

  const handleTagClick = (tag) => {
    onSelectTag(tag);
    navigate("/"); // Always go back to homepage when selecting merch
  };

  return (
    <nav className="main-navbar">
      <ul className="navbar-list">
        <li className="navbar-item dropdown">
          <span
            className={`navbar-link ${location.pathname === '/' ? 'active-glow' : ''}`}
          >
            Merch
          </span>
          <div className="navbar-dropdown">
            {merchTags.map(tag => (
              <button
                key={tag}
                className={`navbar-dropdown-link ${selectedTag === tag ? 'active' : ''}`}
                onClick={() => handleTagClick(tag)}
                type="button"
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
