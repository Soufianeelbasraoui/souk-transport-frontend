import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdOutlineEdit, MdDelete } from "react-icons/md";
import { BiShowAlt } from "react-icons/bi";

import Sidebar from "../../components/layout/Sidebar";
import api from "../../services/api";

import "../../styles/global.css";
import "./styles/admin.css";
import Loader from "../../components/common/Loader";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import PaginationComponent from "../../components/common/Pagination";

function CamionsPage() {
  const [camions, setCamions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [search, setSearch] = useState("");

  const pageSize = 10;

  const fetchCamions = async () => {
    try {
      setLoading(true);

      let res;

      if (search.trim() === "") {
        res = await api.get(`/api/camions/lister?page=${page}&size=${pageSize}` );
      } else {
        res = await api.get( `/api/camions/searchByMarque?marque=${search}&page=${page}&size=${pageSize}` );
      }

      setCamions(res.data.content || []);
      setTotalElements(res.data.totalElements || 0);
      setTotalPages(res.data.totalPages || 0);
    } catch (error) {
      console.error("Erreur camions :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCamions();
  }, [page, search]);

  // Recherche
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  // Suppression
  const handelDelet = async () => {
    try {
      await api.delete(`/api/camions/${deleteId}`);

      setDeleteId(null);

      fetchCamions();
    } catch (error) {
      console.error("Erreur suppression camion :", error);
    }
  };

  // Pagination
  const handlePageChange = (newPage) => {
    setPage(newPage - 1);
  };


  return (
    <div className="app admin-page">
      <Sidebar />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Camions</h1>
            <p>Gérez les camions.</p>
          </div>

          <Link to="/admin/camions/new" className="btn-primary">
            Ajouter un camion
          </Link>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-search">
              <input
                type="search"
                placeholder="Rechercher par marque..."
                value={search}
                onChange={handleSearch}
              />
            </div>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
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
  {loading ? (
    <tr>
      <td colSpan="7" className="admin-empty">
        <Loader />
      </td>
    </tr>
  ) : camions.length > 0 ? (
     camions.map((camion) => (
      <tr key={camion.id}>
        <td className="admin-identity">
          <strong>{camion.marque}</strong>
        </td>

        <td>{camion.immatriculation}</td>
        <td>{camion.modele}</td>
        <td>{camion.capacite}</td>
        <td>{camion.type}</td>

        <td>
          <span
            className={`admin-badge ${
              camion.disponible
                ? "admin-badge-success"
                : "admin-badge-danger"
            }`}
          >
            {camion.disponible ? "Disponible" : "Non disponible"}
          </span>
        </td>

        <td>
          <div className="admin-actions">
            <Link
              to={`/admin/camions/${camion.id}`}
              className="admin-action admin-action-view"
            >
              <BiShowAlt />
            </Link>

            <Link
              to={`/admin/camions/edit/${camion.id}`}
              className="admin-action admin-action-edit"
            >
              <MdOutlineEdit />
            </Link>

            <button
              type="button"
              className="admin-action admin-action-delete"
              onClick={() => setDeleteId(camion.id)}
            >
              <MdDelete />
            </button>
          </div>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="7" className="admin-empty">
        Aucun camion trouvé.
      </td>
    </tr>
  )}
</tbody>
            </table>

            {totalElements > 0 && (
              <PaginationComponent
                page={page + 1}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                itemLabel="Camions"
              />
            )}
          </div>
        </div>

        <ConfirmDialog
          show={deleteId !== null}
          title="Supprimer le camion"
          message="Êtes-vous sûr de vouloir supprimer ce camion ?"
          onConfirm={handelDelet}
          onCancel={() => setDeleteId(null)}
        />
      </main>
    </div>
  );
}

export default CamionsPage;