import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();

  return (
    <header 
      className="header" 
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        minHeight: '80px',
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <Link to="/" className="logo" style={{ background: 'transparent' }}>
        <h1 style={{ background: 'transparent', color: 'white', margin: 0, fontSize: '2.2rem', fontWeight: 800 }}>SplitSmart</h1>
        <span className="tagline" style={{ background: 'transparent', color: 'white', opacity: 0.9 }}>Split expenses smartly</span>
      </Link>
      
      <nav className="nav" style={{ background: 'transparent' }}>
        <Link 
          to="/" 
          className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            color: 'white', 
            textDecoration: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontWeight: location.pathname === '/' ? 600 : 500
          }}
        >
          Dashboard
        </Link>
      </nav>
    </header>
  );
};

export default Header;