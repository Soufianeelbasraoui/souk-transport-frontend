import React from 'react';
import { Link } from 'react-router-dom';
import { FiExternalLink, FiCheck } from 'react-icons/fi';
import moroccoMap from '../../assets/morocco-map.png';
import '../../styles/hero.css';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="row align-items-center g-5">
    
          <div className="col-lg-7">
            <h1 className="hero-main-title">
              Remplissez vos<br />
              camions. <span className="text-orange">Réduisez<br />vos coûts.</span>
            </h1>

            <p className="hero-subtitle">
              La première plateforme B2B de transport collaboratif au Maroc
            </p>

            <div className="d-flex flex-column flex-sm-row gap-3 mb-4">
              <Link  to="/register"  className="btn-hero-orange d-inline-flex align-items-center justify-content-center gap-2" >
                <span>Je suis Transporteur</span>
                <FiExternalLink size={15} />
              </Link>

              <Link  to="/register"  className="btn-hero-outline d-inline-flex align-items-center justify-content-center gap-2">
                <span>J'expédie des marchandises</span>
                <FiExternalLink size={15} className="text-secondary" />
              </Link>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-4 pt-2">
              <div className="hero-feature-item">
                <FiCheck className="hero-feature-icon" size={18} />
                <span>Inscription gratuite</span>
              </div>
              <div className="hero-feature-item">
                <FiCheck className="hero-feature-icon" size={18} />
                <span>Sans engagement</span>
              </div>
              <div className="hero-feature-item">
                <FiCheck className="hero-feature-icon" size={18} />
                <span>Paiement sécurisé</span>
              </div>
            </div>
          </div>
          <div className="col-lg-5 text-center text-lg-end">
            <img src={moroccoMap} alt="Carte du Maroc Réseau SoukTransport"  className="hero-map-img"/>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;