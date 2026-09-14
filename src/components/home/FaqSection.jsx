import React from 'react';
import './style/faq.css';

const FAQ_ITEMS = [
  {
    id: 'faq1',
    question: 'Comment fonctionne le paiement sécurisé ?',
    answer: "Le paiement est conservé en toute sécurité via un système d'Escrow. L'argent est bloqué lors de la réservation et n'est libéré au transporteur qu'une fois la livraison confirmée par l'expéditeur."
  },
  {
    id: 'faq2',
    question: 'Quels sont les documents requis pour les transporteurs ?',
    answer: 'Pour publier des trajets et accepter des cargaisons, vous devez fournir une patente valide, la carte grise du véhicule, le permis de conduire du chauffeur ainsi que la patente de transport de marchandises.'
  },
  {
    id: 'faq3',
    question: 'Comment sont calculées les commissions ?',
    answer: 'L inscription et la publication de trajets sont 100% gratuites. SoukTransport prévient une légère commission fixe uniquement sur les transactions réussies pour couvrir les frais de service et d assurance.'
  },
  {
    id: 'faq4',
    question: 'Puis-je annuler ou modifier une réservation ?',
    answer: "Oui, les annulations sont possibles depuis votre tableau de bord selon nos conditions générales d'utilisation. Si l'annulation intervient plus de 24h avant le départ, l'expéditeur est intégralement remboursé."
  }
];

const FaqSection = () => {
  return (
    <section className="faq-section">
      <div className="container">
        
        <div className="text-center mb-5">
          <h2 className="fw-bold text-dark mb-2">Foire Aux Questions</h2>
          <p className="text-muted">Tout ce que vous devez savoir sur la plateforme</p>
        </div>
        <div className="faq-container">
          <div className="accordion custom-accordion" id="faqAccordion">
            {FAQ_ITEMS.map((item, index) => (
              <div key={item.id} className="accordion-item">
                <h2 className="accordion-header" id={`heading-${item.id}`}>
                  <button
                    className={`accordion-button ${index !== 0 ? 'collapsed' : ''}`}
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse-${item.id}`}
                    aria-expanded={index === 0 ? 'true' : 'false'}
                    aria-controls={`collapse-${item.id}`}
                  >
                    {item.question}
                  </button>
                </h2>
                <div id={`collapse-${item.id}`} className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`} aria-labelledby={`heading-${item.id}`} data-bs-parent="#faqAccordion" >
                  <div className="accordion-body">
                    {item.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default FaqSection;