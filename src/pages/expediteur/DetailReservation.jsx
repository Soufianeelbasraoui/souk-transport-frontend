import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {  FiArrowLeft, FiMapPin,  FiBox, FiDollarSign,  FiCalendar,  FiCheckCircle, FiAlertCircle, FiTrash2, FiSlash} from "react-icons/fi";

import Sidebar from "../../components/layout/Sidebar";
import Loader from "../../components/common/Loader";
import api from "../../services/api";

import "../../styles/global.css";
import "./styles/DetailReservation.css";

function DetailReservation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState(null);
  const [paiement, setPaiement] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    chargerReservation();
  }, [id]);

  const chargerReservation = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get(`/api/reservations/${id}`);
      const reservationData = res.data;
      setReservation(reservationData);

      try {
        const paiementRes = await api.get(
          `/api/paiements/cargaison/${reservationData.cargaisonId}`
        );
        setPaiement(paiementRes.data);
      } catch (err) {
        setPaiement(null);
      }
    } catch (err) {
      console.error("Erreur chargement :", err);
      setError(
        err.response?.data?.message || "Impossible de charger la réservation."
      );
    } finally {
      setLoading(false);
    }
  };

  const annulerReservation = async () => {
    if (!window.confirm("Voulez-vous vraiment annuler cette réservation ?")) return;

    try {
      const res = await api.patch(`/api/reservations/${id}/annuler`);
      setReservation(res.data);
      setSuccess("Réservation annulée avec succès.");
    } catch (err) {
      console.error("Erreur annulation :", err);
      setError(err.response?.data?.message || "Erreur lors de l'annulation.");
    }
  };

  const supprimerReservation = async () => {
    if (!window.confirm("Voulez-vous supprimer définitivement cette réservation ?")) return;

    try {
      await api.delete(`/api/reservations/${id}`);
      navigate("/expediteur/reservations");
    } catch (err) {
      console.error("Erreur suppression :", err);
      setError(err.response?.data?.message || "Erreur lors de la suppression.");
    }
  };

  const getStatusBadge = (statut) => {
    switch (statut) {
      case "ACCEPTEE":
        return <span className="status-badge badge-success">Acceptée</span>;
      case "REFUSEE":
      case "ANNULEE":
        return <span className="status-badge badge-danger">{statut === "REFUSEE" ? "Refusée" : "Annulée"}</span>;
      default:
        return <span className="status-badge badge-warning">En attente</span>;
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <div className="detail-res-container">
          
          <button 
            className="detail-res-back-btn" 
            onClick={() => navigate("/expediteur/reservations")}
          >
            <FiArrowLeft /> Retour aux réservations
          </button>

          {error && <div className="alert alert-danger mb-4">{error}</div>}
          {success && <div className="alert alert-success mb-4">{success}</div>}

          {!reservation ? (
            <div className="reservations-empty card p-5 text-center">
              <h3>Réservation introuvable</h3>
              <p>La réservation demandée n'existe pas ou a été supprimée.</p>
            </div>
          ) : (
            <div className="detail-res-card">
      
              <div className="detail-res-header">
                <div>
                  <h2>Réservation #R-{String(reservation.id).padStart(4, "0")}</h2>
                  <span className="res-subtitle">
                    <FiCalendar /> Créée le : {reservation.dateReservation ? new Date(reservation.dateReservation).toLocaleDateString("fr-FR") : "-"}
                  </span>
                </div>
                {getStatusBadge(reservation.statutReservation)}
              </div>
              <div className="detail-res-body">
                <div className="detail-res-grid">
        
                  <div className="detail-res-block">
                    <div className="detail-res-block-header">
                      <div className="detail-res-icon">
                        <FiMapPin />
                      </div>
                      <h4 className="detail-res-block-title">Détails du Trajet</h4>
                    </div>
                    <div className="detail-res-block-content">
                      <div className="detail-res-line">
                        <span className="label">Départ :</span>
                        <span className="value">{reservation.villeDepart || "-"}</span>
                      </div>
                      <div className="detail-res-line">
                        <span className="label">Arrivée :</span>
                        <span className="value">{reservation.villeArrivee || "-"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="detail-res-block">
                    <div className="detail-res-block-header">
                      <div className="detail-res-icon">
                        <FiBox />
                      </div>
                      <h4 className="detail-res-block-title">Cargaison</h4>
                    </div>
                    <div className="detail-res-block-content">
                      <div className="detail-res-line">
                        <span className="label">Description :</span>
                        <span className="value">
                          {reservation.description || `Cargaison #${reservation.cargaisonId}`}
                        </span>
                      </div>
                      <div className="detail-res-line">
                        <span className="label">Poids réservé :</span>
                        <span className="value">
                          {reservation.poidsReserve != null ? `${reservation.poidsReserve} kg` : "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-res-block">
                    <div className="detail-res-block-header">
                      <div className="detail-res-icon">
                        <FiDollarSign />
                      </div>
                      <h4 className="detail-res-block-title">Finances</h4>
                    </div>
                    <div className="detail-res-block-content">
                      <div className="detail-res-line">
                        <span className="label">Prix convenu :</span>
                        <span className="value highlight">
                          {reservation.prixConvenu != null ? `${reservation.prixConvenu} DH` : "-"}
                        </span>
                      </div>
                      <div className="detail-res-line">
                        <span className="label">Statut Paiement :</span>
                        <span className="value fw-bold">
                          {paiement ? paiement.statutPaiement : "Non enregistré"}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                {reservation.statutReservation === "ACCEPTEE" && paiement?.statutPaiement === "EN_ATTENTE" && (
                  <div className="detail-res-alert info mt-4">
                    <FiAlertCircle /> Paiement prévu à la livraison.
                  </div>
                )}

                {paiement?.statutPaiement === "PAYE" && (
                  <div className="detail-res-alert success mt-4">
                    <FiCheckCircle /> Paiement confirmé.
                  </div>
                )}
              </div>

      
              <div className="detail-res-actions">
                {reservation.statutReservation === "EN_ATTENTE" && (
                  <button className="btn-action-danger" onClick={annulerReservation}>
                    <FiSlash /> Annuler la réservation
                  </button>
                )}

                {(reservation.statutReservation === "ANNULEE" || reservation.statutReservation === "REFUSEE") && (
                  <button className="btn-action-delete" onClick={supprimerReservation}>
                    <FiTrash2 /> Supprimer
                  </button>
                )}

                {reservation.statutReservation === "ACCEPTEE" && !paiement && (
                  <button 
                    className="btn-action-primary" 
                    onClick={() => navigate(`/expediteur/paiements?reservationId=${reservation.id}`)}
                  >
                    <FiDollarSign /> Paiement à la livraison
                  </button>
                )}
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default DetailReservation;