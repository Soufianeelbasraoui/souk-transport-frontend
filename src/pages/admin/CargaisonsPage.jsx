
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdOutlineEdit, MdDelete,MdCheck,MdClose, MdUndo,} from "react-icons/md";
import { BiShowAlt } from "react-icons/bi";

import Sidebar from "../../components/layout/Sidebar";
import Loader from "../../components/common/Loader";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import api from "../../services/api";

import "../../styles/global.css";
import "./styles/admin.css";

function CargaisonsPage() {
  const [cargaisons, setCargaisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/api/cargaisons/lister?page=0&size=10")
      .then((res) => {
        setCargaisons(res.data.content || []);
      })
      .catch((error) => {
        console.error("Erreur Cargaisons :", error);
      })
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, action) => {
    try {
      const res = await api.patch(`/api/cargaisons/${id}/${action}`);

      setCargaisons((prev) =>prev.map((item) =>item.id === id ? res.data : item));
    } catch (error) {
      console.error(`Erreur ${action} :`, error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/cargaisons/${id}`);

      setCargaisons((prev) =>
        prev.filter((item) => item.id !== id)
      );

      setDeleteId(null);
    } catch (error) {
      console.error("Erreur suppression :", error);
    }
  };

  const filteredCargaisons = cargaisons.filter((item) => {
    const value = search.toLowerCase();

    return [
      item.id,
      item.description,
      item.poids,
      item.expediteurNom,
      item.statutCargaison,
    ].some((field) =>
      String(field || "")
        .toLowerCase()
        .includes(value)
    );
  });

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="app admin-page">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Cargaisons</h1>
            <p>Gérez les cargaisons.</p>
          </div>

          <Link to="/admin/cargaisons/new" className="btn-primary">
            Ajouter une cargaison
          </Link>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-search">
              <input
                type="search"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Description</th>
                  <th>Poids</th>
                  <th>Expéditeur</th>
                  <th>Statut</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>

                {filteredCargaisons.length > 0 ? (
                  filteredCargaisons.map((item) => (
                    <tr key={item.id}>
                      <td className="admin-identity">
                        <strong>
                          C-{String(item.id).padStart(4, "0")}
                        </strong>
                      </td>

                      <td>{item.description } </td>
                      <td> {item.poids}</td>
                      <td> {item.expediteurNom }</td>

                      <td>
                        <span className={`admin-status ${
                            item.statutCargaison === "LIVREE"
                              ? "is-success"
                              : item.statutCargaison === "ANNULEE"
                              ? "is-danger"
                              : "is-pending"
                          }`}>
                          {item.statutCargaison || "EN_ATTENTE"}
                        </span>
                      </td>

                      <td>
                        <div className="admin-actions">
                          <Link
                            to={`/admin/cargaisons/${item.id}`}
                            className="admin-action admin-action-view"
                            title="Voir"
                          >
                            <BiShowAlt />
                          </Link>
                          <Link
                            to={`/admin/cargaisons/edit/${item.id}`}
                            className="admin-action admin-action-edit"
                            title="Modifier"
                          >
                            <MdOutlineEdit />
                          </Link>
                          {item.statutCargaison === "EN_ATTENTE" && (
                            <button
                              type="button"
                              className="admin-action admin-action-success"
                              title="Accepter"
                              onClick={() =>
                                updateStatus(
                                  item.id,
                                  "accepter"
                                )
                              }
                            >
                              <MdCheck />
                            </button>
                          )}

                          {item.statutCargaison === "EN_ATTENTE" && (
                            <button
                              type="button"
                              className="admin-action admin-action-danger"
                              title="Refuser"
                              onClick={() =>
                                updateStatus(
                                  item.id,
                                  "refuser"
                                )
                              }
                            >
                              <MdClose />
                            </button>
                          )}

                    
                          {item.statutCargaison === "ACCEPTEE" && (
                            <button
                              type="button"
                              className="admin-action admin-action-warning"
                              title="Annuler"
                              onClick={() =>
                                updateStatus(
                                  item.id,
                                  "annuler"
                                )
                              }
                            >
                              <MdUndo />
                            </button>
                          )}

                          <button
                            type="button"
                            className="admin-action admin-action-delete"
                            title="Supprimer"
                            onClick={() =>
                              setDeleteId(item.id)
                            }
                          >
                            <MdDelete />
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))

                ) : (

                  <tr>
                    <td
                      colSpan="6"
                      className="admin-empty"
                    >
                      Aucune cargaison trouvée.
                    </td>
                  </tr>

                )}

              </tbody>
            </table>
          </div>
        </div>

        <ConfirmDialog
          show={deleteId !== null}
          title="Supprimer la cargaison"
          message="Êtes-vous sûr de vouloir supprimer cette cargaison ?"
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />

      </main>
    </div>
  );
}

export default CargaisonsPage;
