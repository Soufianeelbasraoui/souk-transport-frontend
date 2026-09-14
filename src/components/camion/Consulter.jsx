import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../layout/Sidebar";
import api from "../../services/api";
import "../../styles/global.css";
import "../../styles/formPage.css";
import { jwtDecode } from "jwt-decode";

function ConsulterCamion() {
  const { id } = useParams();

   const token=localStorage.getItem("token");
    const user=jwtDecode(token)
    
  const [camion, setCamion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/api/camions/${id}`)
      .then((res) => {
        setCamion(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération du camion:", err);
        setError("Impossible de charger les informations de ce camion.");
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Consulter le camion</h1>
            <p>Consultez les informations détaillées du camion.</p>
          </div>
          <Link  to={user.role==="ADMIN" ?"/admin/camions":"/transporteur/camions"} className="btn-cancel">
            ← Mes camions
          </Link>
        </div>

        {loading && <p>Chargement du camion...</p>}
        {error && <div className="alert-banner error">{error}</div>}

        {!loading && !error && camion && (
          <div className="form-card">
            <div className="form-card-header">
              <h5>
                {camion.marque} {camion.modele}
              </h5>
              <p>
                Statut :{" "}
                <span className={`badge ${camion.disponible ? "bg-success" : "bg-danger" }`} >
                  {camion.disponible ? "Disponible" : "Non disponible"}
                </span>
              </p>
            </div>

            <div className="form-card-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Marque</label>
                  <p className="form-control-custom">{camion.marque || "N/A"}</p>
                </div>

                <div className="form-group">
                  <label>Modèle</label>
                  <p className="form-control-custom">{camion.modele || "N/A"}</p>
                </div>

                <div className="form-group">
                  <label>Immatriculation</label>
                  <p className="form-control-custom">
                    {camion.immatriculation || "N/A"}
                  </p>
                </div>

                <div className="form-group">
                  <label>Type de camion</label>
                  <p className="form-control-custom">{camion.type || "N/A"}</p>
                </div>

                <div className="form-group">
                  <label>Capacité (Tonnes)</label>
                  <p className="form-control-custom">{camion.capacite} T</p>
                </div>

                <div className="form-group">
                  <label>Disponibilité</label>
                  <p className="form-control-custom">
                    {camion.disponible  ? "Disponible pour les trajets" : "Non disponible"}
                  </p>
                </div>
              </div>
            </div>

            <div className="form-card-footer">
              <Link
                to={`/transporteur/camions/edit/${camion.id}`}
                className="btn-submit"
              >
                Modifier le camion
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ConsulterCamion;