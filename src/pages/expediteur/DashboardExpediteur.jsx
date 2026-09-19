import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {  FaTruck,  FaSearch,  FaMobileAlt,  FaBoxOpen,  FaCheckDouble,  FaCheckCircle,  FaTimesCircle,  FaBan, FaBoxes,  FaClipboardList,} from "react-icons/fa";

import Sidebar from "../../components/layout/Sidebar";
import api from "../../services/api";
import "./styles/Expediteur.css";
import "../../styles/global.css";

function DashboardExpediteur() {
  const [trajets, setTrajets] = useState([]);
  const [dashboard, setDashboard] = useState({
    acceptee: 0,
    annulee: 0,
    refusee: 0,
    totalCargaisons: 0,
    totalReservations: 0,
  });

  useEffect(() => {
    api .get("/api/dashboard/expediteur")
      .then((res) => setDashboard(res.data))
      .catch((error) => console.error("Erreur dashboard expediteur :", error));
  }, []);

  useEffect(() => {
    api.get("/api/trajets?page=0&size=5")
      .then((res) => setTrajets(res.data.content || []))
      .catch((error) => console.error("Erreur trajets :", error));
  }, []);

  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <div className="expediteur-dashboard-container">
          <div className="page-header">
            <div>
              <h1>Bienvenue</h1>
              <p>
                Voici l'état actuel de vos expéditions et les opportunités sur le marché.
              </p>
            </div>
          </div>

          <div className="expediteur-stats-grid">
            <div className="expediteur-stat-card is-success">
              <div className="stat-header">
                <div className="stat-label">Acceptées</div>
                <div className="stat-icon-wrapper">
                  <FaCheckCircle />
                </div>
              </div>
              <div className="stat-value">{dashboard.acceptee}</div>
            </div>

            <div className="expediteur-stat-card is-warning">
              <div className="stat-header">
                <div className="stat-label">Annulées</div>
                <div className="stat-icon-wrapper">
                  <FaBan />
                </div>
              </div>
              <div className="stat-value">{dashboard.annulee}</div>
            </div>

            <div className="expediteur-stat-card is-danger">
              <div className="stat-header">
                <div className="stat-label">Refusées</div>
                <div className="stat-icon-wrapper">
                  <FaTimesCircle />
                </div>
              </div>
              <div className="stat-value">{dashboard.refusee}</div>
            </div>

            <div className="expediteur-stat-card is-info">
              <div className="stat-header">
                <div className="stat-label">Cargaisons</div>
                <div className="stat-icon-wrapper">
                  <FaBoxes />
                </div>
              </div>
              <div className="stat-value">{dashboard.totalCargaisons}</div>
            </div>

            <div className="expediteur-stat-card is-primary">
              <div className="stat-header">
                <div className="stat-label">Réservations</div>
                <div className="stat-icon-wrapper">
                  <FaClipboardList />
                </div>
              </div>
              <div className="stat-value">{dashboard.totalReservations}</div>
            </div>
          </div>

          <div className="expediteur-card">
            <div className="expediteur-card-header">
              <h2 className="expediteur-card-title">
                Trajets recommandés pour vous
              </h2>
              <Link to="/expediteur/trajets" className="expediteur-link-all">
                Voir tout
              </Link>
            </div>

            <div className="expediteur-trajets-list">
              {trajets.map((item) => (
                <div className="expediteur-trajet-item" key={item.id}>
                  <div className="trajet-col-route">
                    <div className="trajet-route-title">
                      <span>{item.villeDepart}</span>
                      <span className="trajet-route-arrow">→</span>
                      <span>{item.villeArrivee}</span>
                    </div>
                    <div className="trajet-date">{item.displayDate}</div>
                    <div className="trajet-truck-type">{item.camionType}</div>
                  </div>

                  <div className="trajet-col-capacity">
                    <FaTruck className="trajet-truck-icon" />
                    <div className="trajet-capacity-info">
                      <span className="trajet-capacity-value">
                        {item.poidsDisponible} T disponibles
                      </span>
                      <span className="trajet-delivery-duration">
                        {item.delai}
                      </span>
                    </div>
                  </div>

                  <div className="trajet-col-price">
                    <span className="trajet-price-value">
                      {item.prix} DH
                    </span>
                    <span className="trajet-price-unit">par tonne</span>
                  </div>

                  <div>
                    <Link
                      to={`/expediteur/detailtrajet/${item.id}`}
                      className="trajet-btn-details"
                    >
                      Voir détails
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="expediteur-card how-it-works-card">
            <h2 className="expediteur-card-title" style={{ marginBottom: "24px" }}>
              Comment ça marche ?
            </h2>

            <div className="how-it-works-timeline">
              <div className="how-step-item">
                <div className="how-step-icon-wrapper">
                  <FaSearch />
                </div>
                <div className="how-step-title">1. Recherchez</div>
                <p className="how-step-desc">
                  Trouvez le bon camion pour votre cargaison.
                </p>
              </div>

              <div className="how-step-connector" />

              <div className="how-step-item">
                <div className="how-step-icon-wrapper">
                  <FaMobileAlt />
                </div>
                <div className="how-step-title">2. Réservez</div>
                <p className="how-step-desc">
                  Confirmez le prix et l'horaire instantanément.
                </p>
              </div>

              <div className="how-step-connector" />
              <div className="how-step-item">
                <div className="how-step-icon-wrapper">
                  <FaBoxOpen />
                </div>
                <div className="how-step-title">3. Expédiez</div>
                <p className="how-step-desc">
                  Le transporteur charge et sécurise la marchandise.
                </p>
              </div>

              <div className="how-step-connector" />

              <div className="how-step-item">
                <div className="how-step-icon-wrapper">
                  <FaCheckDouble />
                </div>
                <div className="how-step-title">4. Livrée</div>
                <p className="how-step-desc">
                  Réception confirmée et paiement libéré.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardExpediteur;