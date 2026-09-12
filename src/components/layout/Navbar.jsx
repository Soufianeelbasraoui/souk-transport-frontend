import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTruckMoving } from 'react-icons/fa';
import { HiMenu, HiX } from 'react-icons/hi';
import '../../styles/navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom sticky-top bg-white">
      <div className="container">
    
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 me-4" onClick={closeMenu}>
          <div className="logo-icon-box">
            <FaTruckMoving size={20} />
          </div>
          <div className="d-flex flex-column">
            <span className="brand-title">SoukTransport</span>
            <span className="brand-subtitle">سوق ترانسبور</span>
          </div>
        </Link>
        <button className="navbar-toggler border-0 shadow-none" type="button"   onClick={toggleMenu} aria-expanded={isOpen} aria-label="Toggle navigation">
          {isOpen ? <HiX size={28} color="#1e293b" /> : <HiMenu size={28} color="#1e293b" />}
        </button>
        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`}>

          <ul className="navbar-nav mx-auto mb-3 mb-lg-0 gap-1">
            <li className="nav-item">
              <a className="nav-link nav-link-custom" href="#comment-ca-marche" onClick={closeMenu}>
                Comment ça marche
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link nav-link-custom" href="#fonctionnalites" onClick={closeMenu}>
                Fonctionnalités
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link nav-link-custom" href="#trajets-recents" onClick={closeMenu}>
                Trajets
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link nav-link-custom" href="#faq" onClick={closeMenu}>
                FAQ
              </a>
            </li>
          </ul>

          <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-3">
            <Link to="/login" className="btn-login text-center" onClick={closeMenu}>
              Connexion
            </Link>
            <Link to="/register" className="btn-cta text-center" onClick={closeMenu}>
              Commencer gratuitement
            </Link>
          </div>

        </div>

      </div>
    </nav>
  );
};

export default Navbar;