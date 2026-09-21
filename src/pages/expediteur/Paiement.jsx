import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiClipboard, FiCreditCard, FiDownload } from "react-icons/fi";

import Sidebar from "../../components/layout/Sidebar";
import api from "../../services/api";
import "./styles/Paiement.css";

function Paiement() {
  const [searchParams] = useSearchParams();
  const reservationId = searchParams.get("reservationId");

  const [reservation, setReservation] = useState(null);
  const [paiement, setPaiement] = useState(null);
  const [montantTotal, setMontantTotal] = useState("");
  const [loading, setLoading] = useState(true);
  const [paiementLoading, setPaiementLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    chargerDonnees();
  }, [reservationId]);

  const chargerDonnees = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    if (!reservationId) {
      setLoading(false);
      return;
    }

    try {
      const { data: reservationData } = await api.get(`/api/reservations/${reservationId}`);
      setReservation(reservationData);

      if (reservationData.prixConvenu != null) {
        setMontantTotal(reservationData.prixConvenu);
      }

      try {
        const { data: paiementData } = await api.get(`/api/paiements/cargaison/${reservationData.cargaisonId}`);
        setPaiement(paiementData);
      } catch {
        setPaiement(null);
      }
    } catch (err) {
      console.error("Erreur chargement :", err);
      setError(err.response?.data?.message || "Impossible de charger les informations.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaiement = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!montantTotal || Number(montantTotal) <= 0) {
      setError("Veuillez saisir un montant valide.");
      return;
    }

    try {
      setPaiementLoading(true);
      const { data } = await api.post("/api/paiements", {
        reservationId: Number(reservationId),
        montantTotal: Number(montantTotal),
        methodePaiement: "CASH",
      });

      setPaiement(data);
      setSuccess("Paiement enregistré avec succès.");
    } catch (err) {
      console.error("Erreur paiement :", err);
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement du paiement.");
    } finally {
      setPaiementLoading(false);
    }
  };

  const handleDownloadRecu = async () => {
    if (!paiement?.id) return;

    try {
      setDownloadLoading(true);
      setError("");

      const response = await api.get(`/api/paiements/${paiement.id}/recu`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `recu-paiement-${paiement.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Erreur téléchargement reçu PDF :", err);
      setError("Impossible de télécharger le reçu de paiement.");
    } finally {
      setDownloadLoading(false);
    }
  };

  const Layout = ({ children }) => (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <div className="paiements-container">{children}</div>
      </main>
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <p>Chargement...</p>
      </Layout>
    );
  }

  if (!reservationId) {
    return (
      <Layout>
        <div className="paiements-header">
          <div>
            <h1>Paiement</h1>
            <p>Suivez le paiement de votre réservation.</p>
          </div>
        </div>
        <div className="paiement-card p-4">
          <h4>Aucune réservation sélectionnée</h4>
          <p className="text-muted">Sélectionnez une réservation pour consulter son paiement.</p>
          <Link to="/expediteur/reservations" className="btn-primary-action">
            <FiClipboard /> Mes réservations
          </Link>
        </div>
      </Layout>
    );
  }

  if (!reservation) {
    return (
      <Layout>
        <div className="alert alert-danger">{error || "Réservation introuvable."}</div>
        <Link to="/expediteur/reservations" className="btn-primary-action">
          Retour aux réservations
        </Link>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="paiements-header">
        <div>
          <h1>Paiement</h1>
          <p>Suivez le paiement de votre réservation.</p>
        </div>

        <div className="back-link-container">
          <Link to="/expediteur/reservations" className="btn-secondary-action">
            <FiArrowLeft /> Retour aux réservations
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="paiement-grid">
        <div className="paiement-card">
          <div className="card-header-icon">
            <FiCreditCard size={24} />
            <div>
              <h3>Réservation</h3>
              <span className="paiement-id-badge">
                R-{String(reservation.id).padStart(4, "0")}
              </span>
            </div>
          </div>

          <div className="info-group">
            <span className="info-label">Trajet</span>
            <strong>{reservation.villeDepart || "-"} → {reservation.villeArrivee || "-"}</strong>
          </div>

          <div className="info-group">
            <span className="info-label">Cargaison</span>
            <strong>{reservation.description || `Cargaison #${reservation.cargaisonId}`}</strong>
          </div>

          <div className="info-group">
            <span className="info-label">Poids réservé</span>
            <strong>{reservation.poidsReserve != null ? `${reservation.poidsReserve} kg` : "-"}</strong>
          </div>

          <div className="info-group">
            <span className="info-label">Prix convenu</span>
            <strong className="montant-strong">
              {reservation.prixConvenu != null ? `${reservation.prixConvenu} DH` : "-"}
            </strong>
          </div>

          <div className="info-group">
            <span className="info-label">Statut réservation</span>
            <span className={`status-badge ${reservation.statutReservation.toLowerCase()}`}>
              {reservation.statutReservation}
            </span>
          </div>
        </div>

        <div className="paiement-card">
          {paiement ? (
            <div>
              <h3 className="card-title">Paiement enregistré</h3>

              <div className="info-group">
                <span className="info-label">Montant</span>
                <strong className="montant-strong">{paiement.montantTotal} DH</strong>
              </div>

              <div className="info-group">
                <span className="info-label">Méthode</span>
                <span className="methode-badge">{paiement.methodePaiement || "CASH"}</span>
              </div>

              <div className="info-group">
                <span className="info-label">Statut</span>
                <strong>{paiement.statutPaiement || "EN_ATTENTE"}</strong>
              </div>

              {paiement.statutPaiement === "EN_ATTENTE" && (
                <div className="alert alert-warning">Paiement en espèces à la livraison.</div>
              )}

              {paiement.statutPaiement === "PAYE" && (
                <div className="alert alert-success">Paiement confirmé.</div>
              )}

              <button
                type="button"
                className="btn-download-pdf"
                onClick={handleDownloadRecu}
                disabled={downloadLoading}
              >
                <FiDownload size={16} />
                {downloadLoading ? "Téléchargement..." : "Télécharger le reçu PDF"}
              </button>
            </div>
          ) : reservation.statutReservation !== "ACCEPTEE" ? (
            <div>
              <h3 className="card-title">Paiement indisponible</h3>
              <p className="text-muted">
                Le paiement sera disponible après l'acceptation de la réservation par le transporteur.
              </p>
            </div>
          ) : (
            <div>
              <h3 className="card-title">Paiement à la livraison</h3>

              <form onSubmit={handlePaiement}>
                <div className="form-group">
                  <label className="form-label">Montant total (DH)</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={montantTotal}
                    onChange={(e) => setMontantTotal(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Méthode de paiement</label>
                  <input
                    type="text"
                    className="form-control"
                    value="CASH - Paiement à la livraison"
                    readOnly
                  />
                </div>

                <button
                  type="submit"
                  className="btn-submit-payment"
                  disabled={paiementLoading}
                >
                  {paiementLoading ? "Enregistrement..." : "Confirmer le paiement"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Paiement;