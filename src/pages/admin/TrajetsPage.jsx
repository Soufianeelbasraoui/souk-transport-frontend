import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdOutlineEdit, MdDelete } from "react-icons/md";
import { BiShowAlt } from "react-icons/bi";

import api from "../../services/api";

import "../../styles/global.css";
import "./styles/admin.css";
import Loader from "../../components/common/Loader";
import Sidebar from "../../components/layout/Sidebar";
import ConfirmDialog from "../../components/common/ConfirmDialog";

function TrajetsPage() {
  const [trajets, setTrajets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    api.get("/api/trajets").then((res) => {
        console.log(res.data);
        setTrajets(res.data.content);
      })
      .catch((error) => {
        console.error("Erreur camions :", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handelDelet = async (id) => {
    try {
      await api.delete(`/api/trajets/${id}`);
      setTrajets(trajets.filter((item) => item.id !== id) );
      setDeleteId(null);
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="app admin-page">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Trajets</h1>
            <p>Gérez les Trajets.</p>
          </div>
          <Link to="/admin/trajets/new" className="btn-primary" > Ajouter un Trajet</Link>
        </div>
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-search">
              <input  type="search"  placeholder="Rechercher un camion..." />
            </div>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">
               <thead>
                    <tr>
                      <th>ID Trajet</th>
                      <th>Départ &rarr; Arrivée</th>
                      <th>Date</th>
                      <th>Capacite</th>
                      <th>Prix</th>
                      <th>Statut</th>
                      <th>Rés.</th>
                      <th>Action</th>
                    </tr>
                  </thead>
              <tbody>
                {trajets.length > 0 ? (
                  trajets.map((item) => (
                    <tr key={item.id}>
                      <td className="admin-identity">
                        <strong>  T-{String(item.id).padStart(4, "0")}</strong>
                      </td>
                      <td> {item.villeDepart}&rarr;{item.villeArrivee}</td>
                       <td>
                         <span className="date-cell">
                              {item.dateDepart
                                ? new Date(item.dateDepart).toLocaleDateString(
                                    "fr-FR",
                                    {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    },
                                  )
                                : "N/A"}
                            </span>
                       </td>
                      <td> <strong>{item.poidsDisponible || "CAPACITÉ"} Tonnes</strong></td>
                      <td> <strong>{item.prix}</strong></td>
                      <td>
                        <span  className={`status-badge ${item.statutTrajet === "PUBLIE" ? "status-open" : item.statutTrajet === "EN_COURS" ? "status-progress" : "status-other"}`}>
                           {item.statutTrajet}
                         </span>
                      </td>
                      <td>
                          {item.nombreReservations || 0}
                      </td>
                      <td>
                        <div className="admin-actions">
                          <Link to={`/admin/trajets/${item.id}`} className="admin-action admin-action-view"><BiShowAlt /></Link>
                          <Link to={`/admin/trajets/edit/${item.id}`} className="admin-action admin-action-edit"><MdOutlineEdit /> </Link>
                          <button type="button" className="admin-action admin-action-delete" onClick={() => setDeleteId(item.id)}>
                            <MdDelete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="admin-empty"  >  Aucun camion trouvé. </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ConfirmDialog
          show={deleteId !== null}
          title="Supprimer le trajets"
          message="Êtes-vous sûr de vouloir supprimer ce trajets ?"
          onConfirm={handelDelet}
          onCancel={() => setDeleteId(null)}
        />
      </main>
    </div>
  );
}
export default TrajetsPage;