import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiBox, FiCalendar, FiMapPin, FiTruck, FiSlash } from "react-icons/fi";

import Sidebar from "../../components/layout/Sidebar";
import Loader from "../../components/common/Loader";
import api from "../../services/api";

import "../../styles/global.css";
import "./styles/DetailTrajet.css";

function DetailTrajet() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trajet, setTrajet] = useState(null);
  const [cargaisons, setCargaisons] = useState([]);
  const [cargaisonId, setCargaisonId] = useState("");
  const [prixConvenu, setPrixConvenu] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [trajetRes, cargaisonsRes] = await Promise.allSettled([
          api.get(`/api/trajets/${id}`),
          api.get("/api/cargaisons/mes-cargaisons-disponibles"),
        ]);

        if (trajetRes.status === "fulfilled") {
          setTrajet(trajetRes.value.data);
        } else {
          throw new Error("Impossible de charger le trajet.");
        }

        if (cargaisonsRes.status === "fulfilled") {
          setCargaisons(cargaisonsRes.value.data || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleReservation = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!cargaisonId) return setError("Veuillez sélectionner une cargaison.");

    const selectedCargaison = cargaisons.find((c) => c.id === Number(cargaisonId));
    if (selectedCargaison && selectedCargaison.poids > trajet.poidsDisponible) {
      return setError(`Poids excessif (${selectedCargaison.poids} kg vs max ${trajet.poidsDisponible} kg).`);
    }

    try {
      await api.post("/api/reservations", {
        cargaisonId: Number(cargaisonId),
        trajetId: Number(id),
        prixConvenu: prixConvenu ? Number(prixConvenu) : trajet.prix,
      });

      setSuccess("Réservation effectuée avec succès.");
      setTimeout(() => navigate("/expediteur/reservations"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la réservation.");
    }
  };

  if (loading) return <Loader />;

  const isTermine = trajet?.statutTrajet === "TERMINE";

  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <div className="trajet-container">
          <button className="trajet-back-btn" onClick={() => navigate("/expediteur/trajets")}>
            <FiArrowLeft /> Retour aux trajets
          </button>

          {!trajet ? (
            <div className="card p-5 text-center">{error || "Trajet introuvable."}</div>
            ) : (
            <div className="trajet-grid">
              
              <div className="trajet-card">
                <div className="trajet-card-header">
                  <div>
                    <span className="trajet-label">Itinéraire</span>
                    <h2>{trajet.villeDepart} → {trajet.villeArrivee}</h2>
                  </div>
                  <span className={`status-badge ${isTermine ? "badge-danger" : "badge-success"}`}>
                    {trajet.statutTrajet}
                  </span>
                </div>

                <div className="trajet-info-grid">
                  <div className="info-item">
                    <FiMapPin className="info-icon" />
                    <div><span>Départ / Arrivée</span><strong>{trajet.villeDepart} → {trajet.villeArrivee}</strong></div>
                  </div>
                  <div className="info-item">
                    <FiCalendar className="info-icon" />
                    <div><span>Date de départ</span><strong>{trajet.dateDepart ? new Date(trajet.dateDepart).toLocaleDateString("fr-FR") : "-"}</strong></div>
                  </div>
                  <div className="info-item">
                    <FiTruck className="info-icon" />
                    <div><span>Type de camion</span><strong>{trajet.typeCamion || "Non spécifié"}</strong></div>
                  </div>
                  <div className="info-item">
                    <FiBox className="info-icon" />
                    <div><span>Poids disponible</span><strong>{trajet.poidsDisponible} kg</strong></div>
                  </div>
                  <div className="info-item highlight">
                    <span className="price-tag">DH</span>
                    <div><span>Prix proposé</span><strong>{trajet.prix} DH</strong></div>
                  </div>
                </div>
              </div>
              <div className="trajet-card">
                <h3>Réserver ce trajet</h3>
                
                {error && <div className="alert alert-danger mb-3">{error}</div>}
                {success && <div className="alert alert-success mb-3">{success}</div>}

                {isTermine ? (
                  <div className="trajet-empty">
                    <FiSlash className="empty-icon text-danger" />
                    <h4>Trajet Terminé</h4>
                    <p>Ce trajet est déjà terminé. Aucune nouvelle réservation n'est possible.</p>
                  </div>
                  ) : cargaisons.length === 0 ? (
                  <div className="trajet-empty">
                    <FiBox className="empty-icon" />
                    <h4>Aucune cargaison disponible</h4>
                    <p>Créez d'abord une cargaison pour pouvoir réserver ce trajet.</p>
                    <button className="btn-primary" onClick={() => navigate("/expediteur/cargaisons/new")}>
                      Créer une cargaison
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleReservation} className="trajet-form">
                    <div className="form-group">
                      <label>Sélectionner la cargaison</label>
                      <select value={cargaisonId} onChange={(e) => setCargaisonId(e.target.value)} required>
                        <option value="">-- Sélectionner une cargaison --</option>
                        {cargaisons.map((c) => {
                          const tropLourd = c.poids > trajet.poidsDisponible;
                          return (
                            <option key={c.id} value={c.id} disabled={tropLourd}>
                              {c.description} ({c.poids} kg) {tropLourd ? "- Trop lourd" : ""}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Prix proposé (DH)</label>
                      <input
                        type="number"
                        min="0"
                        value={prixConvenu}
                        onChange={(e) => setPrixConvenu(e.target.value)}
                        placeholder={`Prix par défaut : ${trajet.prix} DH`}
                      />
                    </div>

                    <button type="submit" className="btn-primary full-width">
                      Confirmer la réservation
                    </button>
                  </form>
                )}
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default DetailTrajet;