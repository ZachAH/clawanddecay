// src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';


function Navbar({ selectedTag, onSelectTag }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

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
    const params = new URLSearchParams();
    if (tag && tag !== 'All') params.set('tag', tag);
    navigate(`/merch?${params.toString()}`);
  };

  const isMerchActive = location.pathname === '/merch' || location.pathname === '/';

  return (
    <nav className="main-navbar">
      <ul className="navbar-list">
        <li className="navbar-item dropdown">
          {/* Clicking Merch goes to /merch */}
          <span
            role="button"
            className={`navbar-link ${location.pathname.startsWith('/merch') ? 'active-glow' : ''}`}
            onClick={() => {
              onSelectTag('All');
              navigate('/merch');
            }}
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
        <li className="navbar-item">
          <Link to="/cart" className="navbar-link">
            Cart ({itemCount})
          </Link>
        </li>

      </ul>
    </nav>
  );
}

export default Navbar;
