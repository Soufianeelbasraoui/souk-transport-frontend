import React from 'react';

const stats = [
  { number: '847', label: 'Transporteurs actifs' },
  { number: '3 421', label: 'Expéditeurs' },
  { number: '145 T', label: 'Tonnes transportées' },
  { number: '98%', label: 'Livraisons à temps' },
];

const StatsSection = () => {
  return (
    <section className="bg-light py-5 border-bottom border-top">
      <div className="container">
        <div className="row text-center g-4">
          {stats.map((item, index) => (
            <div key={index} className="col-6 col-md-3">
              <h2 className="fw-bold text-dark display-6 mb-1">{item.number}</h2>
              <p className="text-muted small mb-0">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;