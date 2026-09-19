import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdOutlineEdit, MdDelete } from "react-icons/md";
import { BiShowAlt } from "react-icons/bi";

import Sidebar from "../../components/layout/Sidebar";
import PaginationComponent from "../../components/common/Pagination";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import api from "../../services/api";

import "../../styles/global.css";
import "./style/transporteur.css";

function MesCamions() {
  const [mesCamions, setMesCamions] = useState([]);
  const [deleteId, setDeleteId] = useState(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 9;

  useEffect(() => {
    fetchCamions();
  }, [page]);

  const fetchCamions = () => {
    api
      .get(`/api/camions/mesCamions?page=${page}&size=${pageSize}`)
      .then((res) => {
        setMesCamions(res.data?.content || []);
        setTotalPages(res.data?.totalPages || 0);
        setTotalElements(res.data?.totalElements || 0);
      })
      .catch((error) => {
        console.error("Erreur camions :", error);
        setMesCamions([]);
        setTotalPages(0);
        setTotalElements(0);
      });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage - 1);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/camions/${deleteId}`);
      setDeleteId(null);
      fetchCamions();
    } catch (error) {
      console.error("Erreur suppression camion :", error);
    }
  };

  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Mes Camions</h1>
            <p>Gérez vos camions.</p>
          </div>
          <Link to="/transporteur/camions/new" className="btn-primary">
            Ajouter un camion
          </Link>
        </div>

        <div className="dashboard-card recent-trajets">
          <div className="card-header-custom">
            <div className="trasporteur-search">
              <input type="text" placeholder="Rechercher un camion..." />
            </div>
          </div>

          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>CAMION</th>
                  <th>IMMATRICULATION</th>
                  <th>MODÈLE</th>
                  <th>CAPACITÉ</th>
                  <th>TYPE</th>
                  <th>STATUT</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {mesCamions.length > 0 ? (
                  mesCamions.map((item) => (
                    <tr key={item.id}>
                      <td>{item.marque}</td>
                      <td>{item.immatriculation}</td>
                      <td>{item.modele}</td>
                      <td>{item.capacite}</td>
                      <td>{item.type}</td>
                      <td>
                        <span
                          className={`badge ${
                            item.disponible ? "bg-success" : "bg-danger"
                          }`}
                        >
                          {item.disponible ? "Disponible" : "Non disponible"}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <Link
                            to={`/transporteur/camions/${item.id}`}
                            className="action-btn view"
                            title="Voir"
                          >
                            <BiShowAlt />
                          </Link>
                          <Link
                            to={`/transporteur/camions/edit/${item.id}`}
                            className="action-btn edit"
                            title="Modifier"
                          >
                            <MdOutlineEdit />
                          </Link>
                          <button
                            className="action-btn delete"
                            title="Supprimer"
                            onClick={() => setDeleteId(item.id)}
                          >
                            <MdDelete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">
                      <div className="table-empty">Aucun camion trouvé.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalElements > 0 && (
            <PaginationComponent
              page={page + 1}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              itemLabel="camions"
            />
          )}
        </div>

        <ConfirmDialog
          show={deleteId !== null}
          title="Supprimer le camion"
          message="Êtes-vous sûr de vouloir supprimer ce camion ?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      </main>
    </div>
  );
}

export default MesCamions;