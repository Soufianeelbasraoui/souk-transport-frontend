import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import api from "../../services/api";
import { jwtDecode } from "jwt-decode";
import { FiPackage, FiTruck, FiArrowLeft } from "react-icons/fi";
import { FaUser } from "react-icons/fa";
import "./Register.css";
import LeftPanel from "./LeftPanel/LeftPanel";

const expediteurSchema = yup.object({
  nom: yup.string().required("Le nom est obligatoire"),
  prenom: yup.string().required("Le prénom est obligatoire"),
  email: yup.string().email("Email invalide").required("L'email est obligatoire"),
  password: yup.string().min(6, "Au moins 6 caractères").required("Le mot de passe est obligatoire"),
  telephone: yup.string().matches(/^(06|07)[0-9]{8}$/, "Numéro invalide").nullable(),
  ville: yup.string().required("La ville est obligatoire"),
  nomEntreprise: yup.string().required("Nom d'entreprise obligatoire"),
  adresseEntreprise: yup.string().required("Adresse obligatoire"),
});

const transporteurSchema = yup.object({
  nom: yup.string().required("Le nom est obligatoire"),
  prenom: yup.string().required("Le prénom est obligatoire"),
  email: yup.string().email("Email invalide").required("L'email est obligatoire"),
  password: yup.string().min(6, "Au moins 6 caractères").required("Le mot de passe est obligatoire"),
  telephone: yup.string().matches(/^(06|07)[0-9]{8}$/, "Numéro invalide").nullable(),
  ville: yup.string().required("La ville est obligatoire"),
  cin: yup.string().required("Le CIN est obligatoire"),
  numeroPermis: yup.string().required("Numéro de permis obligatoire"),
});

function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("EXPEDITEUR");
  const [registerError, setRegisterError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(role === "EXPEDITEUR" ? expediteurSchema : transporteurSchema),
  });

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setRegisterError("");
    setSuccessMessage("");
    reset();
  };

  const onSubmit = async (data) => {
    setRegisterError("");
    setSuccessMessage("");
    try {
      let response;
      if (role === "EXPEDITEUR") {
        response = await api.post("/auth/register/expediteur", data);
      } else {
        response = await api.post("/auth/register/transporteur", data);
      }

      const token = response.data.token;
      localStorage.setItem("token", token);
      const user = jwtDecode(token);
      setSuccessMessage("Inscription réussie ! Redirection...");

      setTimeout(() => {
        if (user.role === "TRANSPORTEUR") {
          navigate("/transporteur/dashboard");
        } else if (user.role === "EXPEDITEUR") {
          navigate("/expediteur/dashboard");
        } else {
          navigate("/");
        }
      }, 1000);
    } catch (error) {
      if (error.response?.status === 409) {
        setRegisterError("Adresse email déjà utilisée.");
      } else if (error.response?.status === 400) {
        setRegisterError("Informations saisies invalides.");
      } else {
        setRegisterError("Erreur lors de l'inscription.");
      }
    }
  };

  return (
    <div className="register-page-wrapper">
      <LeftPanel />
      <div className="right-panel-container">
        <div className="register-card-wrapper">
          <Link to="/" className="back-to-home-link">
            <FiArrowLeft className="me-1" /> Accueil
          </Link>

          <div className="register-card">
            <div className="text-center mb-2">
              <div className="register-icon-box mb-1">
                <FaUser className="login-icon-text" />
              </div>
              <h3 className="register-title">Créer un compte</h3>
              <p className="register-subtitle">Rejoignez SoukTransport</p>
            </div>

            <div className="role-selection mb-3">
              <div className="role-buttons">
                <button type="button" className={role === "EXPEDITEUR" ? "role-btn active" : "role-btn"}  onClick={() => handleRoleChange("EXPEDITEUR")}>
                  <FiPackage className="me-1" /> Expéditeur
                </button>

                <button  type="button" className={role === "TRANSPORTEUR" ? "role-btn active" : "role-btn"} onClick={() => handleRoleChange("TRANSPORTEUR")} >
                  <FiTruck className="me-1" /> Transporteur
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="row g-2">
                <div className="col-6 mb-2">
                  <label className="form-label text-muted extra-small fw-semibold mb-1">Nom</label>
                  <input type="text" className="form-control form-control-sm" placeholder="Nom" {...register("nom")} />
                  {errors.nom && <span className="auth-error-text">{errors.nom.message}</span>}
                </div>
                <div className="col-6 mb-2">
                  <label className="form-label text-muted extra-small fw-semibold mb-1">Prénom</label>
                  <input type="text" className="form-control form-control-sm" placeholder="Prénom" {...register("prenom")} />
                  {errors.prenom && <span className="auth-error-text">{errors.prenom.message}</span>}
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label text-muted extra-small fw-semibold mb-1">Email</label>
                <input type="email" className="form-control form-control-sm" placeholder="exemple@email.com" {...register("email")} />
                {errors.email && <span className="auth-error-text">{errors.email.message}</span>}
              </div>

              <div className="row g-2">
                <div className="col-6 mb-2">
                  <label className="form-label text-muted extra-small fw-semibold mb-1">Mot de passe</label>
                  <input type="password" className="form-control form-control-sm" placeholder="Min 6 caractères" {...register("password")} />
                  {errors.password && <span className="auth-error-text">{errors.password.message}</span>}
                </div>
                <div className="col-6 mb-2">
                  <label className="form-label text-muted extra-small fw-semibold mb-1">Téléphone</label>
                  <input type="text" className="form-control form-control-sm" placeholder="0612345678" {...register("telephone")} />
                  {errors.telephone && <span className="auth-error-text">{errors.telephone.message}</span>}
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label text-muted extra-small fw-semibold mb-1">Ville</label>
                <input type="text" className="form-control form-control-sm" placeholder="Ex: Casablanca" {...register("ville")} />
                {errors.ville && <span className="auth-error-text">{errors.ville.message}</span>}
              </div>

              {role === "EXPEDITEUR" && (
                <div className="row g-2">
                  <div className="col-6 mb-2">
                    <label className="form-label text-muted extra-small fw-semibold mb-1">Entreprise</label>
                    <input type="text" className="form-control form-control-sm" placeholder="Nom" {...register("nomEntreprise")} />
                    {errors.nomEntreprise && <span className="auth-error-text">{errors.nomEntreprise.message}</span>}
                  </div>
                  <div className="col-6 mb-2">
                    <label className="form-label text-muted extra-small fw-semibold mb-1">Adresse</label>
                    <input type="text" className="form-control form-control-sm" placeholder="Adresse" {...register("adresseEntreprise")} />
                    {errors.adresseEntreprise && <span className="auth-error-text">{errors.adresseEntreprise.message}</span>}
                  </div>
                </div>
              )}

              {role === "TRANSPORTEUR" && (
                <div className="row g-2">
                  <div className="col-6 mb-2">
                    <label className="form-label text-muted extra-small fw-semibold mb-1">CIN</label>
                    <input type="text" className="form-control form-control-sm" placeholder="AB123456" {...register("cin")} />
                    {errors.cin && <span className="auth-error-text">{errors.cin.message}</span>}
                  </div>
                  <div className="col-6 mb-2">
                    <label className="form-label text-muted extra-small fw-semibold mb-1">Permis</label>
                    <input type="text" className="form-control form-control-sm" placeholder="N° Permis" {...register("numeroPermis")} />
                    {errors.numeroPermis && <span className="auth-error-text">{errors.numeroPermis.message}</span>}
                  </div>
                </div>
              )}

              {registerError && <div className="auth-error-box py-1 px-2 mb-2">{registerError}</div>}
              {successMessage && <div className="auth-success-box py-1 px-2 mb-2">{successMessage}</div>}

              <button type="submit" className="btn-submit mt-2">Créer mon compte</button>
            </form>

            <div className="divider-container my-2">
              <hr className="divider-line" />
              <span className="divider-text">ou</span>
            </div>

            <div className="text-center">
              <span className="text-muted extra-small me-1">Déjà inscrit ?</span>
              <Link to="/login" className="auth-link-highlight">Se connecter</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;