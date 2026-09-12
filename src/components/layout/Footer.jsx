import React from 'react';
import { Link } from 'react-router-dom';
import { FaTruckMoving } from 'react-icons/fa';
import '../../styles/footer.css';

const Footer = () => {
  return (
    <footer className="footer-custom">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-12">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="footer-logo-box">
                <FaTruckMoving size={20} />
              </div>
              <span className="footer-brand-title">SoukTransport</span>
            </div>
            <p className="footer-description">
              La première plateforme B2B de transport collaboratif au Maroc.
            </p>
          </div>

          <div className="col-lg-2 col-md-4 col-6">
            <h6 className="footer-heading">Produit</h6>
            <ul className="footer-links">
              <li><Link to="#fonctionnalites">Fonctionnalités</Link></li>
              <li><Link to="#tarifs">Tarifs</Link></li>
              <li><Link to="#securite">Sécurité</Link></li>
              <li><Link to="#api">API</Link></li>
            </ul>
          </div>


          <div className="col-lg-2 col-md-4 col-6">
            <h6 className="footer-heading">Entreprise</h6>
            <ul className="footer-links">
              <li><Link to="#apropos">À propos</Link></li>
              <li><Link to="#blog">Blog</Link></li>
              <li><Link to="#carrieres">Carrières</Link></li>
              <li><Link to="#presse">Presse</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-4 col-6">
            <h6 className="footer-heading">Support</h6>
            <ul className="footer-links">
              <li><Link to="#aide">Centre d'aide</Link></li>
              <li><Link to="#contact">Contact</Link></li>
              <li><Link to="#cgu">CGU</Link></li>
              <li><Link to="#confidentialite">Confidentialité</Link></li>
            </ul>
          </div>
        </div>

        <hr className="footer-divider" />
        
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 footer-bottom-text">
          <div>
            © 2025 SoukTransport. Tous droits réservés.
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge-country">MA</span>
            <span>Casablanca, Maroc</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;