import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdOutlineEdit, MdDelete } from "react-icons/md";
import { BiShowAlt } from "react-icons/bi";

import Sidebar from "../../../components/layout/Sidebar";
import Loader from "../../../components/common/Loader";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import api from "../../../services/api";

import "../../../styles/global.css";
import "../styles/admin.css";
import PaginationComponent from "../../../components/common/Pagination";

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [statut, setStatut] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [deleteId, setDeleteId] = useState(null);
  const pageSize=10;

const loadUsers = async () => {
  try {
    setLoading(true);
    let res;
    if (search.trim() !== "") {
      res = await api.get( `/api/users/search/nom?nom=${search}&page=${page}&size=${pageSize}`);
    } else if (role !== "") {
      res = await api.get(`/api/users/filter/role?role=${role}&page=${page}&size=${pageSize}`);

    } else if (statut !== "") {
      res = await api.get(`/api/users/filter/statut?statut=${statut}&page=${page}&size=${pageSize}` );

    } else {
      res = await api.get( `/api/users?page=${page}&size=${pageSize}`);
    }

    setUsers(res.data.content || []);
    setTotalPages(res.data.totalPages || 0);
    setTotalElements(res.data.totalElements ||0);
  } catch (error) {
    console.error("Erreur utilisateurs :", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadUsers();
  }, [page, search, role, statut]);


  const handleDelete = async () => {
    try {
      await api.delete(`/api/users/${deleteId}`);
      setDeleteId(null);
      loadUsers();
    } catch (error) {
      console.error("Erreur suppression :", error);

    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setRole("");
    setStatut("");
    setPage(0);
  };

  const handleRole = (e) => {
    setRole(e.target.value);
    setSearch("");
    setStatut("");
    setPage(0);
  };

  const handleStatut = (e) => {
    setStatut(e.target.value);
    setSearch("");
    setRole("");
    setPage(0);
  };


  const handlePageChange=(newPage)=>{
     setPage(newPage-1);
  }

  return (

    <div className="app admin-page">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Utilisateurs</h1>
            <p>  Gérez les comptes utilisateurs, leurs rôles et leurs statuts.</p>
          </div>
          <Link  to="/admin/users/new" className="btn-primary">  Ajouter un utilisateur</Link>
        </div>
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-search">
              <input  type="search" placeholder="Rechercher par nom..."  value={search} onChange={handleSearch}/>
            </div>
            <div className="admin-filters">
              <div className="admin-filter">
                <select  value={role} onChange={handleRole}>
                  <option value=""> Tous les rôles </option>
                  <option value="ADMIN"> Administrateur</option>
                  <option value="TRANSPORTEUR">Transporteur</option>
                  <option value="EXPEDITEUR">  Expéditeur</option>
                </select>
              </div>

              <div className="admin-filter">
                <select value={statut}  onChange={handleStatut}>
                  <option value=""> Tous les statuts </option>
                  <option value="ACTIF"> Actif  </option>
                  <option value="INACTIF">Inactif</option>
                </select>
              </div>
            </div>
          </div>
          {loading ? (
            <Loader />
          ) : (
            <>
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
                            <strong> {user.nom} {user.prenom}</strong>
                            <span> {user.email}</span>
                          </td>
                          <td>
                            <span className="admin-badge admin-badge-role">  {user.role}</span>
                          </td>
                          <td>{user.telephone || "-"} </td>
                          <td>{user.ville || "-"}</td>
                          <td>
                            <span className={`admin-badge ${ user.statutUser === "ACTIF" ? "admin-badge-success" : "admin-badge-danger"  }`} >
                              {user.statutUser || "-"}
                            </span>
                          </td>
                          <td>
                            <div className="admin-actions">
                              <Link to={`/admin/users/${user.id}`} className="admin-action admin-action-view" title="Voir" >
                                <BiShowAlt />
                              </Link>

                              <Link to={`/admin/users/edit/${user.id}`} className="admin-action admin-action-edit"title="Modifier" >
                                <MdOutlineEdit />
                              </Link>
                              <button type="button"   className="admin-action admin-action-delete" title="Supprimer"   onClick={() => setDeleteId(user.id)} >
                                <MdDelete />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))) : (
                      <tr>
                        <td colSpan="6"  className="admin-empty" > Aucun utilisateur trouvé.</td>
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
                itemLabel="utilisateurs"
              />
            )}
              </div>
           
            </>
          )}
        </div>
        <ConfirmDialog
          show={deleteId !== null}
          title="Supprimer l'utilisateur"
          message="Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      </main>
    </div>
  );
}

export default UsersPage;