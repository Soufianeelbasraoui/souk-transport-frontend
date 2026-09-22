import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  FiArrowLeft, 
  FiCheck, 
  FiMapPin, 
  FiPhone, 
  FiTruck,
  FiInfo
} from "react-icons/fi";

import Sidebar from "../../components/layout/Sidebar";
import Loader from "../../components/common/Loader";
import api from "../../services/api";

import "../../styles/global.css";
import "./styles/SuiviCargaison.css";

function SuiviCargaison() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cargaison, setCargaison] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    chargerDonneesSuivi();
  }, [id]);

  const chargerDonneesSuivi = async () => {
    try {
      setLoading(true);
      setError("");

      const resCargaison = await api.get(`/api/cargaisons/${id}`);
      const cargaisonData = resCargaison.data;
      setCargaison(cargaisonData);

      try {
        const resReservations = await api.get("/api/reservations/expediteur/mes-reservations?size=50");
        const reservationsList = resReservations.data?.content || resReservations.data || [];
        
        const matchRes = reservationsList.find(
          (r) => Number(r.cargaisonId) === Number(id) || Number(r.id) === Number(id)
        );
        if (matchRes) {
          setReservation(matchRes);
        }
      } catch (errRes) {
        console.warn("Impossible de charger les réservations associées:", errRes);
      }

    } catch (err) {
      console.error("Erreur chargement suivi :", err);
      setError("Impossible de charger les informations de suivi pour cette cargaison.");
    } finally {
      setLoading(false);
    }
  };

 
  const statut = cargaison?.statutCargaison || reservation?.statutReservation || "SOUMISE";

  let activeStep = 1;
  if (statut === "EN_TRANSIT" || statut === "EN_COURS") {
    activeStep = 2;
  } else if (statut === "LIVREE" || statut === "TERMINE") {
    activeStep = 3;
  } else {
    activeStep = 1;
  }

  const getBadgeInfo = () => {
    switch (statut) {
      case "EN_TRANSIT":
      case "EN_COURS":
        return { label: "En cours", className: "en-cours" };
      case "LIVREE":
      case "TERMINE":
        return { label: "Livrée", className: "livree" };
      case "ANNULEE":
      case "REFUSEE":
        return { label: "Annulée", className: "annulee" };
      default:
        return { label: "En attente", className: "en-attente" };
    }
  };

  if (loading) {
    return (
      <div className="app">
        <Sidebar />
        <main className="main-content">
          <Loader />
        </main>
      </div>
    );
  }

  const badge = getBadgeInfo();
  const villeDepart = reservation?.villeDepart || "Casablanca";
  const villeArrivee = reservation?.villeArrivee || "Marrakech";
  const transporteurNom = reservation?.transporteurNom || "Ahmed K.";
  const telephone = reservation?.transporteurTelephone || "+212 6 00 00 00 00";

  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <div className="suivi-page-container">
          
          <button 
            type="button" 
            className="suivi-back-btn" 
            onClick={() => navigate("/expediteur/cargaisons")}
          >
            <FiArrowLeft /> Retour à mes cargaisons
          </button>

          {error && <div className="alert alert-danger mb-4">{error}</div>}

          {cargaison && (
            <div className="suivi-card">
              
              <div className="suivi-header">
                <span className="suivi-ref">
                  #ST-2024-{String(cargaison.id).padStart(4, "0")}
                </span>
                <span className={`suivi-badge ${badge.className}`}>
                  {badge.label}
                </span>
              </div>

              <div className="suivi-route-info">
                <span className="suivi-pin"><FiMapPin /></span>
                <strong>{villeDepart}</strong>
                <span className="suivi-arrow">→</span>
                <span className="suivi-pin-orange"><FiMapPin /></span>
                <strong>{villeArrivee}</strong>
                <span className="suivi-divider">•</span>
                <span>{transporteurNom}</span>
              </div>

              <div className="suivi-stepper-container">
                <div className="suivi-stepper">
                  
                  <div className="suivi-step-item">
                    <div className={`suivi-step-circle ${activeStep >= 1 ? "done" : "pending"}`}>
                      <FiCheck />
                    </div>
                    <span className={`suivi-step-label ${activeStep >= 1 ? "done" : ""}`}>
                      Réservé
                    </span>
                  </div>

                  <div className={`suivi-step-connector ${activeStep >= 2 ? "done" : ""}`} />

                  <div className="suivi-step-item">
                    <div className={`suivi-step-circle ${activeStep > 2 ? "done" : activeStep === 2 ? "active" : "pending"}`}>
                      {activeStep > 2 ? <FiCheck /> : <FiTruck />}
                    </div>
                    <span className={`suivi-step-label ${activeStep > 2 ? "done" : activeStep === 2 ? "active" : ""}`}>
                      En transit
                    </span>
                  </div>

                  <div className={`suivi-step-connector ${activeStep >= 3 ? "done" : ""}`} />

                  <div className="suivi-step-item">
                    <div className={`suivi-step-circle ${activeStep >= 3 ? "done" : "pending"}`}>
                      {activeStep >= 3 ? <FiCheck /> : "3"}
                    </div>
                    <span className={`suivi-step-label ${activeStep >= 3 ? "done" : ""}`}>
                      Livrée
                    </span>
                  </div>

                </div>
              </div>

              <div className="suivi-eta">
                <span className="suivi-eta-pin"><FiMapPin /></span>
                <span>
                  Arrivée estimée: <strong>Aujourd'hui 14:30</strong>{" "}
                  <span className="suivi-eta-restant">(2h restantes)</span>
                </span>
              </div>

              <div className="suivi-actions-bar">
                <a href={`tel:${telephone}`} className="btn-suivi-call">
                  <FiPhone />
                  <span>Appeler</span>
                </a>

                <Link
                  to={`/expediteur/cargaisons/${cargaison.id}`}
                  className="btn-suivi-details"
                >
                  <FiInfo />
                  <span>Voir détails</span>
                </Link>
              </div>

            </div>
          )}

          {cargaison && (
            <div className="suivi-details-grid">
              <div className="suivi-info-box">
                <small>Marchandise</small>
                <strong>{cargaison.description || "N/A"}</strong>
              </div>

              <div className="suivi-info-box">
                <small>Poids déclaré</small>
                <strong>{cargaison.poids ? `${cargaison.poids} kg` : "N/A"}</strong>
              </div>

              <div className="suivi-info-box">
                <small>Prix du transport</small>
                <strong>{cargaison.prix ? `${cargaison.prix} DH` : "Paiement à la livraison"}</strong>
              </div>

              <div className="suivi-info-box">
                <small>Référence interne</small>
                <strong>C-{String(cargaison.id).padStart(4, "0")}</strong>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default SuiviCargaison;
