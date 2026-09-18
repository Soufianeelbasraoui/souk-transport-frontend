import { useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import "../../styles/global.css";
import api from "../../services/api";
import "./style/transporteur.css";

function ReservationsRecues() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chargerReservations();
  }, []);

  const chargerReservations = async () => {
    try {
      const res = await api.get("/api/reservations/transporteur/mes-reservations");
      const liste = res.data || [];

      const listeAvecPaiement = await Promise.all(
        liste.map(async (reservation) => {
          if (reservation.statutReservation !== "ACCEPTEE") {
            return { ...reservation, statutPaiement: null };
          }

          try {
            const paiementRes = await api.get(
              `/api/paiements/cargaison/${reservation.cargaisonId}`
            );
            return {
              ...reservation,
              statutPaiement: paiementRes.data?.statutPaiement || null,
            };
          } catch (error) {
            return {
              ...reservation,
              statutPaiement: null,
            };
          }
        })
      );

      setReservations(listeAvecPaiement);
    } catch (error) {
      console.error("Erreur chargement réservations :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccepter = async (id) => {
    try {
      const res = await api.patch(`/api/reservations/${id}/accepter`);
      setReservations((prev) =>
        prev.map((item) => (item.id === id ? res.data : item))
      );
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de l'acceptation.");
    }
  };

  const handleRefuser = async (id) => {
    try {
      const res = await api.patch(`/api/reservations/${id}/refuser`);
      setReservations((prev) =>
        prev.map((item) => (item.id === id ? res.data : item))
      );
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors du refus.");
    }
  };

  const handleConfirmerPaiement = async (reservation) => {
    try {
      const paiementRes = await api.get(
        `/api/paiements/cargaison/${reservation.cargaisonId}`
      );
      const paiement = paiementRes.data;

      if (!paiement) {
        alert("Aucun paiement trouvé pour cette cargaison.");
        return;
      }

      const res = await api.patch(`/api/paiements/${paiement.id}/payer`);

      if (res.data.statutPaiement === "PAYE") {
        setReservations((prev) =>
          prev.map((item) =>
            item.id === reservation.id
              ? { ...item, statutPaiement: "PAYE" }
              : item
          )
        );
      }
    } catch (error) {
      alert(
        error.response?.data?.message || "Impossible de confirmer le paiement."
      );
    }
  };

  if (loading) {
    return (
      <div className="app">
        <Sidebar />
        <main className="main-content">
          <p>Chargement...</p>
        </main>
      </div>
    );
  }

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

        <div className="dashboard-card recent-trajets">
          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>TRAJET</th>
                  <th>CARGAISON</th>
                  <th>POIDS</th>
                  <th>PRIX</th>
                  <th>DATE</th>
                  <th>STATUT</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {reservations.length > 0 ? (
                  reservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td>#{reservation.id}</td>
                      <td>{reservation.trajetId}</td>
                      <td>{reservation.cargaisonId}</td>
                      <td>
                        {reservation.poidsReserve != null
                          ? `${reservation.poidsReserve} kg`
                          : "-"}
                      </td>
                      <td>
                        {reservation.prixConvenu != null
                          ? `${reservation.prixConvenu} DH`
                          : "-"}
                      </td>
                      <td>
                        {reservation.dateReservation
                          ? new Date(
                              reservation.dateReservation
                            ).toLocaleString("fr-FR")
                          : "-"}
                      </td>
                      <td>{reservation.statutReservation}</td>

                      <td>
                        {reservation.statutReservation === "EN_ATTENTE" && (
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleAccepter(reservation.id)}
                            >
                              Accepter
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleRefuser(reservation.id)}
                            >
                              Refuser
                            </button>
                          </div>
                        )}

                        {reservation.statutReservation === "ACCEPTEE" && (
                          <>
                            {!reservation.statutPaiement && (
                              <span className="text-muted fs-7">
                                En attente du paiement par l'expéditeur
                              </span>
                            )}

                            {reservation.statutPaiement === "EN_ATTENTE" && (
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleConfirmerPaiement(reservation)}
                              >
                                Confirmer paiement
                              </button>
                            )}

                            {reservation.statutPaiement === "PAYE" && (
                              <span className="text-success fw-bold">
                                Paiement confirmé
                              </span>
                            )}
                          </>
                        )}

                        {reservation.statutReservation === "REFUSEE" && (
                          <span className="text-muted">Refusée</span>
                        )}

                        {reservation.statutReservation === "ANNULEE" && (
                          <span className="text-muted">Annulée</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="table-empty">
                      Aucune réservation trouvée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ReservationsRecues;