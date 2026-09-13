import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import Sidebar from "../../../components/layout/Sidebar";
import api from "../../../services/api";

import "../../../styles/global.css";
import "../style/publierTrajet.css";


function ConsulterTrajet() {

  const { id } = useParams();

  const [trajet, setTrajet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    api.get(`/api/trajets/${id}`).then((res) => {
        setTrajet(res.data);
      }) .catch((err) => {
        console.error("Erreur :", err);
        setError("Impossible de charger les informations de ce trajet.");
      })
      .finally(() => {
        setLoading(false);
      });

  }, [id]);


  return (
    <div className="app">

      <Sidebar />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Détails du Trajet</h1>
            <p>
              Consultez les informations détaillées de votre trajet.
            </p>
          </div>

          <Link
            to="/transporteur/trajets"
            className="btn-cancel"
          >
            ← Mes trajets
          </Link>

        </div>
        {loading && (
          <p>Chargement du trajet...</p>
        )}
        {error && (
          <div className="alert-banner error">
            {error}
          </div>
        )}

        {!loading && !error && trajet && (

          <div className="form-card">
            <div className="form-card-header">

              <div>
                <h5>
                  Trajet #{String(trajet.id).padStart(4, "0")}
                </h5>

                <p>
                  Statut :{" "}

                  <span
                    className={`status-badge ${
                      trajet.statutTrajet === "PUBLIE"
                        ? "status-open"
                        : trajet.statutTrajet === "EN_COURS"
                        ? "status-progress"
                        : "status-other"
                    }`}
                  >
                    {trajet.statutTrajet}
                  </span>
                </p>
              </div>

            </div>


            {/* Body */}
            <div className="form-card-body">

              {/* Route */}
              <div
                className="route-preview"
                style={{ marginBottom: "20px" }}
              >

                <span className="route-preview-city">
                  {trajet.villeDepart}
                </span>

                <span className="route-preview-arrow">
                  →
                </span>

                <span className="route-preview-city">
                  {trajet.villeArrivee}
                </span>

              </div>


              {/* Informations */}
              <div className="form-grid">

                <div className="form-group">
                  <label>Date de départ</label>

                  <p className="form-control-custom">
                    {trajet.dateDepart
                      ? new Date(
                          trajet.dateDepart
                        ).toLocaleString("fr-FR")
                      : "N/A"}
                  </p>
                </div>


                <div className="form-group">
                  <label>Prix</label>

                  <p className="form-control-custom">
                    {trajet.prix ?? 0} DH
                  </p>
                </div>


                <div className="form-group">
                  <label>Poids disponible</label>

                  <p className="form-control-custom">
                    {trajet.poidsDisponible ?? 0} Tonnes
                  </p>
                </div>


                <div className="form-group">
                  <label>Réservations</label>

                  <p className="form-control-custom">
                    {trajet.nombreReservations ?? 0}
                  </p>
                </div>

              </div>

            </div>


            {/* Footer */}
            <div className="form-card-footer">

              <Link
                to={`/transporteur/trajets/edit/${trajet.id}`}
                className="btn-submit"
              >
                Modifier le trajet
              </Link>

            </div>

          </div>

        )}

      </main>

    </div>
  );
}


export default ConsulterTrajet;