import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaTruckMoving } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import { FiChevronDown } from "react-icons/fi";
import { jwtDecode } from "jwt-decode";

import { logout } from "../../services/authService";
import "../../styles/navbar.css";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const token = localStorage.getItem("token");

  let user = null;

  if (token) {
    try {
      user = jwtDecode(token);
    } catch (error) {
      localStorage.removeItem("token");
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getDashboardPath = () => {
    if (!user) {
      return "/login";
    }

    if (user.role === "ADMIN") {
      return "/admin/dashboard";
    }

    if (user.role === "TRANSPORTEUR") {
      return "/transporteur/dashboard";
    }

    if (user.role === "EXPEDITEUR") {
      return "/expediteur/dashboard";
    }

    return "/";
  };

  const closeMenu = () => {
    setIsOpen(false);
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    closeMenu();
    logout();
  };

  const prenom = user?.prenom || "";
  const nom = user?.nom || "";

  const nomComplet =
    `${prenom} ${nom}`.trim() || "Utilisateur";

  const initial = (  prenom ||  nom || user?.sub || "U").charAt(0).toUpperCase();

  return (
    <nav className="navbar navbar-expand-lg navbar-custom sticky-top bg-white">
      <div className="container">

        <Link
          to="/"
          className="navbar-brand d-flex align-items-center gap-2 me-4"
          onClick={closeMenu}
        >
          <div className="logo-icon-box">
            <FaTruckMoving size={20} />
          </div>

          <span className="brand-title">
            SoukTransport
          </span>
        </Link>

        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menu"
        >
          {isOpen ? (
            <HiX size={28} />
          ) : (
            <HiMenu size={28} />
          )}
        </button>

        <div
          className={`collapse navbar-collapse ${
            isOpen ? "show" : ""
          }`}
        >
          <ul className="navbar-nav mx-auto mb-3 mb-lg-0 gap-1">

            <li className="nav-item">
              <a
                href="#comment-ca-marche"
                className="nav-link nav-link-custom"
                onClick={closeMenu}
              >
                Comment ça marche
              </a>
            </li>

            <li className="nav-item">
              <a
                href="#fonctionnalites"
                className="nav-link nav-link-custom"
                onClick={closeMenu}
              >
                Fonctionnalités
              </a>
            </li>

            <li className="nav-item">
              <a
                href="#trajets-recents"
                className="nav-link nav-link-custom" onClick={closeMenu}>
                Trajets
              </a>
            </li>

            <li className="nav-item">
              <a href="#faq" className="nav-link nav-link-custom" onClick={closeMenu} >
                FAQ
              </a>
            </li>

          </ul>

          <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-3">
            {user ? (
              <div className="nav-user" ref={dropdownRef}>
                <button type="button" className="nav-user-btn" onClick={() =>setDropdownOpen(!dropdownOpen)} >
                  <span className="nav-avatar">
                    {initial}
                  </span>

                  <span className="nav-user-info">
                    <strong>{nomComplet}</strong>
                    <small>{user.role}</small>
                  </span>

                  <FiChevronDown
                    size={14}
                    className={
                      dropdownOpen ? "rotate" : ""
                    }
                  />
                </button>

                {dropdownOpen && (
                  <div className="nav-dropdown-menu">
                    <Link to={getDashboardPath()} className="nav-dropdown-link" onClick={closeMenu}> Tableau de bord </Link>
                    <button type="button" className="nav-dropdown-link nav-logout-link"  onClick={handleLogout}>
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-login text-center" onClick={closeMenu} > Connexion  </Link>
                <Link  to="/register" className="btn-cta text-center" onClick={closeMenu}  > Commencer gratuitement </Link>
              </>
             )}

          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;