import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBuilding,
  FaMapMarkedAlt,
  FaCheckCircle
} from "react-icons/fa";

import Sidebar from "../../components/layout/Sidebar";
import api from "../../services/api";

import "../../styles/global.css";
import "../../styles/profile.css";

function ProfileExpediteur() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/expediteurs/profile").then((res) => {
        setProfile(res.data);
      })
      .catch((err) => {
        console.error("Erreur :", err);
        setError("Impossible de charger votre profil expéditeur.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <div className="profile-container">
          <div className="page-header d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h4 font-weight-bold text-dark m-0">Mon profil</h1>
              <p className="text-muted small m-0">Consultez vos informations personnelles et d'entreprise.</p>
            </div>
            <Link to="/expediteur/cargaisons" className="btn-cancel">
              Mes cargaisons
            </Link>
          </div>

          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="text-muted small mt-2">Chargement du profil...</p>
            </div>
          )}

          {error && <div className="alert alert-danger small mb-4">{error}</div>}

          {!loading && !error && profile && (
            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-avatar">
                  {profile.prenom?.charAt(0).toUpperCase()}
                  {profile.nom?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="profile-name">
                    {profile.prenom} {profile.nom}
                  </h3>
                  <span className="profile-role-badge expediteur">Expéditeur</span>
                </div>
              </div>

              <div className="profile-body">
                <h5 className="profile-section-title">Informations personnelles</h5>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="profile-label">
                      <FaUser className="me-1 text-muted" /> Prénom
                    </label>
                    <div className="profile-value">{profile.prenom || "N/A"}</div>
                  </div>

                  <div className="col-md-6">
                    <label className="profile-label">
                      <FaUser className="me-1 text-muted" /> Nom
                    </label>
                    <div className="profile-value">{profile.nom || "N/A"}</div>
                  </div>

                  <div className="col-md-6">
                    <label className="profile-label">
                      <FaEnvelope className="me-1 text-muted" /> Email
                    </label>
                    <div className="profile-value">{profile.email || "N/A"}</div>
                  </div>

                  <div className="col-md-6">
                    <label className="profile-label">
                      <FaPhone className="me-1 text-muted" /> Téléphone
                    </label>
                    <div className="profile-value">{profile.telephone || "N/A"}</div>
                  </div>

                  <div className="col-md-6">
                    <label className="profile-label">
                      <FaMapMarkerAlt className="me-1 text-muted" /> Ville
                    </label>
                    <div className="profile-value">{profile.ville || "N/A"}</div>
                  </div>

                  <div className="col-md-6">
                    <label className="profile-label">
                      <FaBuilding className="me-1 text-muted" /> Nom d'entreprise
                    </label>
                    <div className="profile-value">{profile.nomEntreprise || profile.entreprise || "N/A"}</div>
                  </div>

                  <div className="col-md-6">
                    <label className="profile-label">
                      <FaMapMarkedAlt className="me-1 text-muted" /> Adresse d'entreprise
                    </label>
                    <div className="profile-value">{profile.adresseEntreprise || "N/A"}</div>
                  </div>

                  <div className="col-md-6">
                    <label className="profile-label">
                      <FaCheckCircle className="me-1 text-muted" /> Statut
                    </label>
                    <div className="profile-value">
                      <span className={`status-badge-inline ${profile.statutUser === "ACTIF" ? "status-open" : "status-other"}`}>
                        {profile.statutUser || "ACTIF"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ProfileExpediteur;
