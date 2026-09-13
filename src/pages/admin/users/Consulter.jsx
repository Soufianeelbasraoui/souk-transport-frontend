import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MdOutlineEdit } from "react-icons/md";
import Sidebar from "../../../components/layout/Sidebar";
import api from "../../../services/api";

import "../../../styles/global.css";
import "../styles/admin.css";
import "../../transporteur/style/publierTrajet.css";

function ConsulterUser() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/api/users/${id}`);
        setUser(response.data);
      } catch (err) {
        console.error("Erreur lors de la récupération de l'utilisateur :", err);
        setError("Impossible de charger les informations de cet utilisateur.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  return (
    <div className="app admin-page">
      <Sidebar />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Détails de l'utilisateur</h1>
            <p>Consultez les informations complètes du profil utilisateur #{id}.</p>
          </div>

          <Link to="/admin/users" className="btn-cancel">
            ← Retour aux utilisateurs
          </Link>
        </div>

        {loading && (
          <div className="form-card">
            <div className="form-card-body" style={{ color: "#8a94a6" }}>
              Chargement des détails de l'utilisateur...
            </div>
          </div>
        )}

        {error && <div className="alert-banner error">{error}</div>}

        {!loading && !error && user && (
          <div className="form-card">
            <div className="form-card-header">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h5>
                    {user.nom} {user.prenom}
                  </h5>
                  <p>{user.email}</p>
                </div>
                <div>
                  <span
                    className={`admin-badge ${
                      user.statutUser === "ACTIF"
                        ? "admin-badge-success"
                        : "admin-badge-danger"
                    }`}
                  >
                    {user.statutUser || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="form-card-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Nom</label>
                  <p className="form-control-custom">{user.nom || "-"}</p>
                </div>

                <div className="form-group">
                  <label>Prénom</label>
                  <p className="form-control-custom">{user.prenom || "-"}</p>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <p className="form-control-custom">{user.email || "-"}</p>
                </div>

                <div className="form-group">
                  <label>Téléphone</label>
                  <p className="form-control-custom">{user.telephone || "-"}</p>
                </div>

                <div className="form-group">
                  <label>Ville</label>
                  <p className="form-control-custom">{user.ville || "-"}</p>
                </div>

                <div className="form-group">
                  <label>Rôle</label>
                  <p className="form-control-custom">
                    <span className="admin-badge admin-badge-role">
                      {user.role || "-"}
                    </span>
                  </p>
                </div>

                {user.nomEntreprise && (
                  <div className="form-group">
                    <label>Entreprise</label>
                    <p className="form-control-custom">{user.nomEntreprise}</p>
                  </div>
                )}

                {user.adresseEntreprise && (
                  <div className="form-group">
                    <label>Adresse Entreprise</label>
                    <p className="form-control-custom">{user.adresseEntreprise}</p>
                  </div>
                )}

                {user.cin && (
                  <div className="form-group">
                    <label>CIN</label>
                    <p className="form-control-custom">{user.cin}</p>
                  </div>
                )}

                {user.numeroPermis && (
                  <div className="form-group">
                    <label>N° de Permis</label>
                    <p className="form-control-custom">{user.numeroPermis}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="form-card-footer">
              <Link to="/admin/users" className="btn-cancel">
                Retour
              </Link>
              <Link
                to={`/admin/users/edit/${user.id}`}
                className="btn-submit"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <MdOutlineEdit /> Modifier cet utilisateur
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ConsulterUser;