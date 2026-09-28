import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import Sidebar from "../../components/layout/Sidebar";
import Loader from "../../components/common/Loader";
import api from "../../services/api";

import "../../styles/global.css";
import "../../styles/formPage.css";

import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

function ConsulterReservation() {
  const { id } = useParams();

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/api/reservations/${id}`).then((res) => {
        setReservation(res.data);
      })
      .catch((err) => {
        console.error("Erreur :", err);
        setError("Impossible de charger les informations de cette réservation.");
      })
      .finally(() => { setLoading(false);});
  }, [id]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Détails de la Réservation</h1>
            <p>Consultez les informations détaillées de la réservation. </p>
          </div>

          <Link to="/admin/reservations" className="btn-cancel"  >
            <FiArrowLeft /> Les réservations
          </Link>
        </div>
        {error && (
          <div className="alert-banner error"> {error}</div> )}

        {!loading && !error && reservation && (
          <div className="form-card">
            <div className="form-card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h5> Réservation #{reservation.id} </h5>

                <p>
                  <span
                    className={`status-badge ${
                      reservation.statutReservation === "ACCEPTEE"
                        ? "status-open"
                        : reservation.statutReservation === "EN_ATTENTE"
                        ? "status-progress"
                        : reservation.statutReservation === "REFUSEE" ||
                          reservation.statutReservation === "ANNULEE"
                        ? "status-other"
                        : "status-other" }`}
                  >
                    {reservation.statutReservation || "EN_ATTENTE"}
                  </span>
                </p>

              </div>
            </div>
            <div className="form-card-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Référence</label>
                  <p className="form-control-custom">
                    R-{String(reservation.id).padStart(4, "0")}
                  </p>
                </div>
                <div className="form-group">
                  <label>Date de réservation</label>
                  <p className="form-control-custom">
                    {reservation.dateReservation ? new Date(
                          reservation.dateReservation
                        ).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>
                <div className="form-group form-group-full">
                  <label>Trajet</label>
                  <p className="form-control-custom">
                    {reservation.villeDepart}
                    <FiArrowRight style={{ margin: "0 8px",}} />
                    {reservation.villeArrivee }
                  </p>
                </div>
                <div className="form-group form-group-full">
                  <label>Description de la cargaison</label>
                  <p className="form-control-custom"> {reservation.description } </p>
                </div>
                <div className="form-group">
                  <label>Poids réservé</label>
                  <p className="form-control-custom"> {reservation.poidsReserve ?? 0} kg </p>
                </div>

        
                <div className="form-group">
                  <label>Prix convenu</label>
                  <p className="form-control-custom"> {reservation.prixConvenu ?? 0} DH </p>
                </div>

               
                <div className="form-group">
                  <label>Statut de la réservation</label>
                  <p className="form-control-custom"> {reservation.statutReservation } </p>
                </div>

              </div>
            </div>
            <div className="form-card-footer">
              {reservation.statutReservation === "EN_ATTENTE" ? (
                <span className="text-muted fst-italic" style={{ fontSize: "13px" }}>
                  Cette réservation est en attente de traitement.
                </span>
              ) : reservation.statutReservation === "ACCEPTEE" ? (
                <span className="text-muted fst-italic" style={{ fontSize: "13px" }} >
                  Cette réservation a été acceptée.
                </span>
              ) : reservation.statutReservation === "REFUSEE" ? (
                <span className="text-muted fst-italic" style={{ fontSize: "13px" }} > Cette réservation a été refusée.</span>
              ) : reservation.statutReservation === "ANNULEE" ? (
                <span className="text-muted fst-italic" style={{ fontSize: "13px" }}>
                  Cette réservation a été annulée.
                </span>
              ) : null}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default ConsulterReservation;
