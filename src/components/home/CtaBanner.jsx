import React from 'react';
import { Link } from 'react-router-dom';
import './style/ctaBanner.css';

const CtaBanner = () => {
  return (
    <section className="cta-banner-section">
      <div className="container">
        <div className="cta-banner-card text-center">
        
          <h2 className="cta-banner-title mb-3">
            Prêt à optimiser vos transports et réduire vos coûts ?
          </h2>
          <p className="cta-banner-subtitle mb-4">
            Rejoignez plus de 4 000 professionnels du transport au Maroc.
          </p>
          <div className="d-flex flex-column flex-sm-row justify-content-center align-items-center gap-3">
            <Link to="/register?role=TRANSPORTEUR" className="btn-cta-orange">
              Je suis Transporteur
            </Link>
            <Link to="/register?role=EXPEDITEUR" className="btn-cta-outline">
              J'expédie des marchandises
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CtaBanner;