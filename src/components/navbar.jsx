// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Navbar({ selectedTag, onSelectTag }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const [merchOpen, setMerchOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    setMerchOpen(false);
  };

  // Close dropdown on outside click + Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMerchOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setMerchOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const isMerchActive =
    location.pathname === '/merch' || location.pathname.startsWith('/products');

  return (
    <nav className="main-navbar" role="navigation" aria-label="Primary navigation">
      <ul className="navbar-list">
        <li
          className="navbar-item dropdown"
          ref={dropdownRef}
          onMouseEnter={() => setMerchOpen(true)}
          onMouseLeave={() => setMerchOpen(false)}
        >
          <button
            type="button"
            className={`navbar-link ${isMerchActive ? 'active-glow' : ''}`}
            aria-haspopup="true"
            aria-expanded={merchOpen}
            aria-controls="merch-dropdown"
            aria-current={isMerchActive ? 'page' : undefined}
            onClick={() => {
              onSelectTag('All');
              navigate('/merch');
              setMerchOpen(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setMerchOpen(true);
              }
            }}
          >
            Merch
          </button>
          <div
            id="merch-dropdown"
            className="navbar-dropdown"
            role="menu"
            aria-label="Merch categories"
          >
            {merchTags.map(tag => (
              <button
                key={tag}
                className={`navbar-dropdown-link ${selectedTag === tag ? 'active' : ''}`}
                onClick={() => handleTagClick(tag)}
                type="button"
                role="menuitem"
                aria-current={selectedTag === tag ? 'true' : undefined}
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
            aria-current={location.pathname === '/contact-us' ? 'page' : undefined}
          >
            Contact Us
          </Link>
        </li>
        <li className="navbar-item">
          <Link
            to="/our-story"
            className={`navbar-link ${location.pathname === '/our-story' ? 'active-glow' : ''}`}
            aria-current={location.pathname === '/our-story' ? 'page' : undefined}
          >
            Our Story
          </Link>
        </li>
        <li className="navbar-item">
          <Link
            to="/faq-page"
            className={`navbar-link ${location.pathname === '/faq-page' ? 'active-glow' : ''}`}
            aria-current={location.pathname === '/faq-page' ? 'page' : undefined}
          >
            FAQ
          </Link>
        </li>
        <li className="navbar-item">
          <Link
            to="/cart"
            className="navbar-link"
            aria-label={`Shopping cart, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
            aria-current={location.pathname === '/cart' ? 'page' : undefined}
          >
            Cart (<span aria-hidden="true">{itemCount}</span>)
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
