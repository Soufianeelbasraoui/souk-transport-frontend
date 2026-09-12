import React from 'react';
import { FiCheck, FiLock, FiMapPin } from 'react-icons/fi';

const features = [
  {
    icon: <FiCheck className="text-dark fs-4" />,
    title: 'Trajets vérifiés',
    description: 'Chaque trajet publié est contrôlé par notre équipe.',
  },
  {
    icon: <FiLock className="text-dark fs-4" />,
    title: 'Paiement sécurisé',
    description: "Escrow: l'argent est libéré à la livraison confirmée.",
  },
  {
    icon: <FiMapPin className="text-danger fs-4" />,
    title: 'Tracking temps réel',
    description: 'Suivez vos cargaisons en direct sur la carte.',
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-5 bg-light">
      <div className="container py-4">
        <div className="text-center mb-5">
          <h2 className="fw-bold text-dark">Tout ce dont vous avez besoin</h2>
        </div>

        <div className="row g-4">
          {features.map((feature, index) => (
            <div key={index} className="col-md-4">
              <div className="card h-100 border-1 p-4 rounded-3">
                <div className="mb-3">{feature.icon}</div>
                <h5 className="fw-bold text-dark mb-2">{feature.title}</h5>
                <p className="text-muted small mb-0">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;