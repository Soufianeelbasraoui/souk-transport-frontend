import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../../../components/layout/Sidebar";
import api from "../../../services/api";

import "../../../styles/global.css";
import "../style/profile.css"


function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {

    api.get("/api/transporteurs/profile").then((res) => {
        setProfile(res.data);
      }).catch((err) => {
        console.error("Erreur :", err);
        setError("Impossible de charger votre profil.");
      })
      .finally(() => {
        setLoading(false);
      });

  }, []);


  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Mon profil</h1>
            <p> Consultez vos informations personnelles.</p>
          </div>
          <Link to="/transporteur/trajets" className="btn-cancel"> ← Mes trajets </Link>
        </div>

        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border" role="status"/>
            <p className="text-muted mt-2"> Chargement du profil...</p>
          </div>
        )}
        {error && (<div className="alert alert-danger"> {error} </div>)}
        {!loading && !error && profile && (
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                {profile.prenom?.charAt(0)}
                {profile.nom?.charAt(0)}
              </div>
              <div>
                <h3> {profile.prenom} {profile.nom}</h3>
                <p>Transporteur</p>
              </div>
            </div>
            <div className="profile-body">
              <h5 className="profile-title"> Informations personnelles</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label>Prénom</label>
                  <div className="profile-field"> {profile.prenom || "N/A"}</div>
                </div>
                <div className="col-md-6">
                  <label>Nom</label>
                  <div className="profile-field"> {profile.nom || "N/A"} </div>
                </div>
                <div className="col-md-6">
                  <label>Email</label>
                  <div className="profile-field">  {profile.email || "N/A"} </div>
                </div>

                <div className="col-md-6">
                  <label>Téléphone</label>
                  <div className="profile-field">{profile.telephone || "N/A"} </div>
                </div>
                <div className="col-md-6">
                  <label>Ville</label>
                  <div className="profile-field">{profile.ville || "N/A"}</div>
                </div>

                <div className="col-md-6">
                  <label>CIN</label>
                  <div className="profile-field">{profile.cin || "N/A"} </div>
                </div>
                <div className="col-md-6">
                  <label>Numéro de permis</label>
                  <div className="profile-field"> {profile.numeroPermis || "N/A"}</div>
                </div>
                <div className="col-md-6">
                  <label>Statut</label>
                  <div className="profile-field">
                    <span className={`badge ${profile.statutUser === "ACTIF"       ? "bg-success": "bg-secondary"  }`}  >
                      {profile.statutUser || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="profile-footer">
              <Link  to="/transporteur/profile/modifier"className="btn-submit"  >
                Modifier mes informations
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


export default Profile;