import { useEffect, useState } from "react";
import { FiCheck, FiShield } from "react-icons/fi";
import { toast } from "react-toastify";

import Sidebar from "../../components/layout/Sidebar";
import Loader from "../../components/common/Loader";
import api from "../../services/api";

import "../../styles/global.css";
import "./style/transporteur.css";
import "./style/reservationsRecues.css";

function ReservationsRecues() {
  const [reservations, setReservations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [paiement, setPaiement] = useState(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const pageSize = 5;

  useEffect(() => {
    chargerReservations();
  }, [page]);

  const chargerReservations = async () => {
    setLoading(true);
    try {
      const res = await api.get( `/api/reservations/transporteur/mes-reservations?page=${page}&size=${pageSize}`);
      const items = res.data.content || [];
      setReservations(items);
      setTotalPages(res.data.totalPages || 0);
      setSelectedId(items.length > 0 ? items[0].id : null);
    } catch (error) {
      console.error("Erreur chargement réservations :", error);
      setReservations([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const chargerPaiement = async (cargaisonId) => {
    setPaiement(null);
    if (!cargaisonId) return;
    try {
      const res = await api.get(`/api/paiements/cargaison/${cargaisonId}`);
      setPaiement(res.data);
    } catch {
      setPaiement(null);
    }
  };

  const handleSelect = (item) => {
    setSelectedId(item.id);
    chargerPaiement(item.cargaisonId);
  };

  const updateReservationStatus = (id, newReservation) => {
    setReservations((prev) =>
      prev.map((item) => (item.id === id ? newReservation : item))
    );
    setSelectedId(id);
    setPaiement(null);
  };

  const handleAccepter = async (id) => {
    try {
      const res = await api.patch(`/api/reservations/${id}/accepter`);
      updateReservationStatus(id, res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'acceptation.");
    }
  };

  const handleRefuser = async (id) => {
    try {
      const res = await api.patch(`/api/reservations/${id}/refuser`);
      updateReservationStatus(id, res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors du refus.");
    }
  };

  const handleConfirmerPaiement = async (cargaisonId) => {
    try {
      const paiementRes = await api.get(`/api/paiements/cargaison/${cargaisonId}`);
      if (!paiementRes.data) {
        toast.error("Aucun paiement trouvé.");
        return;
      }
      const res = await api.patch(`/api/paiements/${paiementRes.data.id}/payer`);
      if (res.data.statutPaiement === "PAYE") {
        setPaiement(res.data);
        toast.success("Paiement confirmé.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur paiement.");
    }
  };

  const selectedReservation = reservations.find((r) => r.id === selectedId);

  const getNom = (res) =>
    res?.nomEntreprise ||
    `${res?.expediteurPrenom || ""} ${res?.expediteurNom || ""}`.trim() ||
    "Expéditeur";

  const getInitiales = (res) => {
    const p = res?.expediteurPrenom || "";
    const n = res?.expediteurNom || "";
    return `${p.charAt(0)}${n.charAt(0)}`.toUpperCase() || "EX";
  };

  useEffect(() => {
    if (selectedReservation) {
      chargerPaiement(selectedReservation.cargaisonId);
    }
  }, [selectedId]);

  if (loading) return <Loader />;

  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Réservations reçues</h1>
            <p>Consultez et gérez les réservations faites par les expéditeurs.</p>
          </div>
        </div>

        {reservations.length === 0 ? (
          <div className="dashboard-card">
            <div className="res-empty-state">Aucune réservation trouvée.</div>
          </div>
        ) : (
          <div className="res-recues-container">
            <div className="res-list-panel">
              <div className="res-list-header">
                <h3>Offres reçues</h3>
              </div>

              <div className="res-items-list">
                {reservations.map((item) => (
                  <div
                    key={item.id}
                    className={`res-item-card ${selectedId === item.id ? "active" : ""}`}
                    onClick={() => handleSelect(item)}
                  >
                    <div className="res-item-avatar">{getInitiales(item)}</div>

                    <div className="res-item-info">
                      <div className="res-item-top">
                        <span className="res-item-name">{getNom(item)}</span>
                        <span className="res-item-date">
                          {item.dateReservation
                            ? new Date(item.dateReservation).toLocaleDateString("fr-FR")
                            : ""}
                        </span>
                      </div>

                      <div className="res-item-meta">
                        {item.poidsReserve ? `${item.poidsReserve} kg` : "-"} •{" "}
                        {item.villeDepart} → {item.villeArrivee}
                      </div>

                      <div className="res-item-price">
                        {item.prixConvenu ? `${item.prixConvenu} DH` : "-"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="res-pagination-simple">
                  <button
                    className="res-page-btn"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Précédent
                  </button>
                  <span>
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    className="res-page-btn"
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Suivant
                  </button>
                </div>
              )}
            </div>

            {selectedReservation && (
              <div className="res-detail-panel">
                <div className="res-detail-header">
                  <div className="res-detail-user">
                    <div className="res-detail-avatar">
                      {getInitiales(selectedReservation)}
                    </div>
                    <div>
                      <h2 className="res-detail-name">{getNom(selectedReservation)}</h2>
                      <div className="res-detail-sub">
                        Réservation #{selectedReservation.id}
                      </div>
                    </div>
                  </div>

                  <div className="res-badge-status">
                    <FiShield />
                    <span>{selectedReservation.statutReservation}</span>
                  </div>
                </div>

                <div className="res-section-title">Cargaison</div>
                <div className="res-info-box">
                  <div className="res-cargaison-grid">
                    <div>
                      Marchandise : <strong>{selectedReservation.description || "N/A"}</strong>
                    </div>
                    <div>
                      Poids : <strong>{selectedReservation.poidsReserve ? `${selectedReservation.poidsReserve} kg` : "-"}</strong>
                    </div>
                    <div>
                      Trajet : <strong>{selectedReservation.villeDepart} → {selectedReservation.villeArrivee}</strong>
                    </div>
                    <div>
                      Statut Cargaison : <strong>{selectedReservation.statutCargaison || "-"}</strong>
                    </div>
                  </div>
                </div>

                <div className="res-section-title">Finances</div>
                <div className="res-info-box">
                  <div className="res-finances-list">
                    <div className="res-finance-row">
                      <span>Prix convenu</span>
                      <strong>{selectedReservation.prixConvenu ? `${selectedReservation.prixConvenu} DH` : "-"}</strong>
                    </div>
                    <div className="res-finance-row">
                      <span>Date</span>
                      <span>
                        {selectedReservation.dateReservation
                          ? new Date(selectedReservation.dateReservation).toLocaleString("fr-FR")
                          : "-"}
                      </span>
                    </div>
                    {paiement && (
                      <div className="res-finance-row">
                        <span>Paiement</span>
                        <span>
                          {paiement.statutPaiement === "PAYE" ? "Confirmé" : "En attente"}
                        </span>
                      </div>
                    )}
                    <div className="res-finance-row total-row">
                      <span>Total</span>
                      <span>{selectedReservation.prixConvenu ? `${selectedReservation.prixConvenu} DH` : "-"}</span>
                    </div>
                  </div>
                </div>

                <div className="res-detail-actions">
                  {selectedReservation.statutReservation === "EN_ATTENTE" && (
                    <>
                      <button
                        type="button"
                        className="btn-res-accept"
                        onClick={() => handleAccepter(selectedReservation.id)}
                      >
                        <FiCheck />
                        Accepter ({selectedReservation.prixConvenu || 0} DH)
                      </button>
                      <button
                        type="button"
                        className="btn-res-refuse"
                        onClick={() => handleRefuser(selectedReservation.id)}
                      >
                        Refuser
                      </button>
                    </>
                  )}

                  {selectedReservation.statutReservation === "ACCEPTEE" && (
                    <>
                      {!paiement && (
                        <span style={{ color: "#64748b", fontSize: "13px" }}>
                          En attente du paiement par l'expéditeur
                        </span>
                      )}
                      {paiement?.statutPaiement === "EN_ATTENTE" && (
                        <button
                          type="button"
                          className="btn-res-confirm"
                          onClick={() => handleConfirmerPaiement(selectedReservation.cargaisonId)}
                        >
                          Confirmer le paiement
                        </button>
                      )}
                      {paiement?.statutPaiement === "PAYE" && (
                        <span style={{ color: "#16a34a", fontWeight: "600" }}>
                          Paiement confirmé
                        </span>
                      )}
                    </>
                  )}

                  {selectedReservation.statutReservation === "REFUSEE" && (
                    <span style={{ color: "#dc2626", fontWeight: "600" }}>
                      Réservation refusée
                    </span>
                  )}

                  {selectedReservation.statutReservation === "ANNULEE" && (
                    <span style={{ color: "#64748b", fontSize: "13px" }}>
                      Réservation annulée
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default ReservationsRecues;