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

function CamionsPage() {
  const [camions, setCamions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    api.get("/api/camions/lister")
      .then((res) => {
        console.log(res.data);
        setCamions(res.data.content);
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
      await api.delete(`/api/camions/${id}`);
      setCamions(camions.filter((item) => item.id !== id) );
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
            <h1>Camions</h1>
            <p>Gérez les camions.</p>
          </div>
          <Link to="/admin/camions/new" className="btn-primary" > Ajouter un camion</Link>
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
                {camions.length > 0 ? (
                  camions.map((camion) => (
                    <tr key={camion.id}>
                      <td className="admin-identity">
                        <strong>  {camion.marque} </strong>
                      </td>
                      <td>  {camion.immatriculation}</td>
                      <td>{camion.modele}
                      </td>
                      <td>{camion.capacite} </td>
                      <td>{camion.type} </td>
                      <td>

                        <span className={`admin-badge ${  camion.disponible ? "admin-badge-success" : "admin-badge-danger" }`}>
                            {camion.disponible   ? "Disponible": "Non disponible"}
                        </span>
                      </td>
                      <td>
                        <div className="admin-actions">
                          <Link to={`/admin/camions/${camion.id}`} className="admin-action admin-action-view"><BiShowAlt /></Link>
                          <Link to={`/admin/camions/edit/${camion.id}`} className="admin-action admin-action-edit"><MdOutlineEdit /> </Link>
                          <button type="button" className="admin-action admin-action-delete" onClick={() => setDeleteId(camion.id)}>
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