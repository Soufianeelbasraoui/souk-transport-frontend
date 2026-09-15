import { useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import "../../styles/global.css";
import api from "../../services/api";
import "./style/transporteur.css";

function ReservationsRecues() {
    const [reservations, setReservations] = useState([]);
    useEffect(() => {
        api.get("/api/reservations/transporteur/mes-reservations") .then((res) => 
            setReservations(res.data))
            .catch((err) => console.error(err));
    }, []);

    const handleAccepter = (id) => {
        api.patch(`/api/reservations/${id}/accepter`).then(() => {
                setReservations((prev) =>  prev.map((item) =>item.id === id ? { ...item, statutReservation: "ACCEPTEE" } : item ));
            }).catch((err) => console.error(err));
    };

    const handleRefuser = (id) => {
        api.patch(`/api/reservations/${id}/refuser`).then(() => {
                setReservations((prev) => prev.map((item) => item.id === id ? { ...item, statutReservation: "REFUSEE" } : item  ));
            })
            .catch((err) => console.error(err));
    };

    return (
        <div className="app">
            <Sidebar />
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>Réservations reçues</h1>
                        <p> Consultez et gérez les réservations faites par les expéditeurs.</p>
                    </div>
                </div>

                <div className="dashboard-card recent-trajets">
                    <div className="card-header-custom ">
                        <div className="trasporteur-search">
                          <input type="text" placeholder="Rechercher..." />
                        </div>
                        <select defaultValue="">
                            <option value="">Filtrer par statut</option>
                            <option value="EN_ATTENTE">En attente</option>
                            <option value="ACCEPTEE">Acceptée</option>
                            <option value="REFUSEE">Refusée</option>
                        </select>
                    </div>

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
                                    reservations.map((item) => (
                                        <tr key={item.id}>
                                            <td>#{item.id}</td>
                                            <td>{item.trajetId}</td>
                                            <td>{item.cargaisonId}</td>
                                            <td>{item.poidsReserve} kg</td>
                                            <td>{item.prixConvenu} DH</td>
                                            <td>
                                                {new Date(item.dateReservation).toLocaleString()}
                                            </td>
                                            <td>{item.statutReservation}</td>
                                            <td>
                                                {item.statutReservation === "EN_ATTENTE" ? (
                                                    <div className="d-flex gap-2">
                                                        <button className="btn btn-sm btn-success" onClick={() => handleAccepter(item.id)}>
                                                            Accepter
                                                        </button>
                                        
                                                        <button className="btn btn-sm btn-danger"  onClick={() => handleRefuser(item.id)}>
                                                            Refuser
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted">Aucune action</span>
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