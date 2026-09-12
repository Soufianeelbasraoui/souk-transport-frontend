import React from 'react';
import { FaTruck, FaBox, FaMoneyBillWave } from 'react-icons/fa';

const steps = [
  {
    icon: <FaTruck className="text-warning fs-3" />,
    title: 'Publiez votre trajet',
    description: 'Indiquez votre route, disponibilités et espace libre en quelques clics.',
  },
  {
    icon: <FaBox className="text-warning fs-3" />,
    title: 'Recevez des offres',
    description: 'Des expéditeurs vérifiés vous contactent avec des cargaisons adaptées à votre trajet.',
  },
  {
    icon: <FaMoneyBillWave className="text-warning fs-3" />,
    title: 'Encaissez',
    description: 'Acceptez la meilleure offre et recevez votre paiement sécurisé directement.',
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-5 bg-white">
      <div className="container py-4">
        <div className="text-center mb-5">
          <h2 className="fw-bold text-dark mb-2">Comment ça marche ?</h2>
          <p className="text-muted">Simple, rapide, sécurisé.</p>
        </div>
        <div className="row g-4">
          {steps.map((step, index) => (
            <div key={index} className="col-md-4">
              <div className="card h-100 border-1  p-4 text-center rounded-3">
                <div className="d-inline-flex align-items-center justify-content-center bg-light rounded-circle mx-auto mb-4" style={{ width: '64px', height: '64px' }}>
                  {step.icon}
                </div>
                <h5 className="fw-bold text-dark mb-3">{step.title}</h5>
                <p className="text-muted small mb-0 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;