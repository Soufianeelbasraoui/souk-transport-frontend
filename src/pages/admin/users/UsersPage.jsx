import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdOutlineEdit, MdDelete } from "react-icons/md";
import { BiShowAlt } from "react-icons/bi";

import Sidebar from "../../../components/layout/Sidebar";
import api from "../../../services/api";

import "../../../styles/global.css";
import "../users/../styles/admin.css";

function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api
      .get("/api/users")
      .then((res) => {
        setUsers(res.data.content || []);
      })
      .catch((error) => {
        console.error("Erreur utilisateurs :", error);
      });
  }, []);

  return (
    <div className="app admin-page">
      <Sidebar />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Utilisateurs</h1>
            <p>
              Gérez les comptes utilisateurs, leurs rôles et leurs statuts.
            </p>
          </div>

          <Link to="/admin/users/new" className="btn-primary">
            Ajouter un utilisateur
          </Link>
        </div>
        <div className="admin-card">
          <div className="admin-card-header">

            <div className="admin-search">
              <input  type="search"  placeholder="Rechercher un utilisateur..."/>
            </div>

            <div className="admin-filters">

              <div className="admin-filter">
                <select defaultValue="">
                  <option value="">Tous les rôles</option>
                  <option value="ADMIN">Administrateur</option>
                  <option value="TRANSPORTEUR">Transporteur</option>
                  <option value="EXPEDITEUR">Expéditeur</option>
                </select>
              </div>

              <div className="admin-filter">
                <select defaultValue="">
                  <option value="">Tous les statuts</option>
                  <option value="ACTIF">Actif</option>
                  <option value="INACTIF">Inactif</option>
                </select>
              </div>

            </div>
          </div>
          <div className="admin-table-wrapper">
            <table className="admin-table">

              <thead>
                <tr>
                  <th>UTILISATEUR</th>
                  <th>ROLE</th>
                  <th>TÉLÉPHONE</th>
                  <th>VILLE</th>
                  <th>STATUT</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id}>

                      <td className="admin-identity">
                        <strong>
                          {user.nom} {user.prenom}
                        </strong>
                        <span>{user.email}</span>
                      </td>

                      <td>
                        <span className="admin-badge admin-badge-role">
                          {user.role}
                        </span>
                      </td>

                      <td>{user.telephone || "-"}</td>

                      <td>{user.ville || "-"}</td>

                      <td>
                        <span
                          className={`admin-badge ${
                            user.statutUser === "ACTIF"
                              ? "admin-badge-success"
                              : "admin-badge-danger"
                          }`}
                        >
                          {user.statutUser}
                        </span>
                      </td>

                      <td>
                        <div className="admin-actions">

                          <Link
                            to={`/admin/users/${user.id}`}
                            className="admin-action admin-action-view"
                            title="Voir"
                          >
                            <BiShowAlt />
                          </Link>

                          <Link
                            to={`/admin/users/edit/${user.id}`}
                            className="admin-action admin-action-edit"
                            title="Modifier"
                          >
                            <MdOutlineEdit />
                          </Link>

                          <button
                            type="button"
                            className="admin-action admin-action-delete"
                            title="Supprimer"
                          >
                            <MdDelete />
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="admin-empty">
                      Aucun utilisateur trouvé.
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

export default UsersPage;