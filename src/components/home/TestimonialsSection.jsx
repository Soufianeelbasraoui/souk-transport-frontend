import React from 'react';
import { FaStar } from 'react-icons/fa';
import './style/testimonials.css';

const TESTIMONIALS_DATA = [
  {
    id: 1,
    quote: "J'ai réduit mes trajets à vide de 40% sur l'axe Casablanca-Agadir. La plateforme est très simple à utiliser.",
    initial: 'M',
    name: 'Mohammed A.',
    role: 'Transporteur Indépendant'
  },
  {
    id: 2,
    quote: "Une solution parfaite pour trouver des transporteurs fiables rapidement. Le système de paiement sécurisé est un gros plus.",
    initial: 'S',
    name: 'Sara B.',
    role: 'Société Agroalimentaire'
  },
  {
    id: 3,
    quote: "Nous avons pu optimiser notre logistique et réduire nos coûts de transport de manière significative depuis que nous utilisons SoukTransport.",
    initial: 'K',
    name: 'Karim T.',
    role: 'Directeur Logistique'
  }
];

const TestimonialsSection = () => {
  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold text-dark">Ce que disent nos utilisateurs</h2>
        </div>

        <div className="row g-4">
          {TESTIMONIALS_DATA.map((item) => (
            <div key={item.id} className="col-lg-4 col-md-6">
              <div className="testimonial-card h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="stars-group">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} size={15} />
                    ))}
                  </div>

                  <p className="testimonial-quote">
                    "{item.quote}"
                  </p>
                </div>

                <div className="d-flex align-items-center gap-3 pt-2">
                  <div className="avatar-circle">
                    {item.initial}
                  </div>
                  <div>
                    <div className="user-name">{item.name}</div>
                    <div className="user-role">{item.role}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;