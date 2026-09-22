import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCalendar, FiTruck, FiBox } from 'react-icons/fi';
import './style/recentTrajets.css';
import api from '../../services/api';
import Loader from '../common/Loader';

const RecentTrajets = () => { 
  const [trajets, setTrajets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
      try {
        api.get("/api/trajets/recent?page=0&size=3").then((res)=>{
         setTrajets(res.data.content);
        })
        
      } catch (err) {
        console.error("Erreur lors du chargement des trajets:", err);
      } finally {
        setLoading(false);
      }
    
  }, []);

  const handleNavigation = (targetPath) => {
    const token = localStorage.getItem("token"); 
    if (token) {
      navigate(targetPath);
    } else {
      navigate("/login");
    }
  };

  if (loading) {
    return <Loader/>
  }

  return (
    <section className="recent-trajets-section">
      <div className="container">

        <div className="text-center mb-5">
          <h2 className="fw-bold text-dark mb-2">Derniers trajets disponibles</h2>
          <p className="text-muted">Trouvez du fret disponible sur vos trajets habituels</p>
        </div>

        <div className="row g-4 mb-5">
          {trajets && trajets.length > 0 ? (
            trajets.map((t) => (
              <div key={t.id} className="col-lg-4 col-md-6">
                <div className="trajet-card h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="trajet-cities">
                        {t.villeDepart} &rarr; {t.villeArrivee}
                      </span>
                      <span
                        className={`status-badge ${
                          t.statutTrajet === "PUBLIE"
                            ? "status-open"
                            : t.statutTrajet === "EN_COURS"
                            ? "status-progress"
                            : t.statutTrajet === "TERMINE"
                            ? "status-finished"
                            : "status-other" }`}
                      >
                        {t.statutTrajet}
                      </span>
                    </div>
                    <div className="d-flex flex-column gap-2 mb-4">
                      <div className="trajet-info-item">
                        <FiCalendar size={16} />
                        <span>
                          {t.dateDepart ? new Date(t.dateDepart).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'N/A'}
                        </span>
                      </div>

                      <div className="trajet-info-item">
                        <FiTruck size={16} />
                        <span>{t.typeCamion ? `${t.typeCamion} ` : 'Camion Spécifié'}</span>
                      </div>
                      <div className="trajet-info-item">
                        <FiBox size={16} />
                        <span>{t.poidsDisponible} Tonnes</span>
                      </div>
                    </div>
                  </div>
                <button  onClick={() => handleNavigation(`/trajets/${t.id}`)}  className="btn-card-action text-center border-0 w-100">
                    Voir le trajet
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted">Aucun trajet disponible pour le moment.</div>
          )}
        </div>

        <div className="text-center">
         <button  onClick={() => handleNavigation("/trajets")}  className="btn-explorer d-inline-block border-0" >
            Explorer tous les trajets
          </button>
        </div>

      </div>
    </section>
  );
};

export default RecentTrajets;