import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/layout/Sidebar";
import api from "../../../services/api";

import "../../../styles/global.css";
import "../styles/admin.css";
import "../../transporteur/style/publierTrajet.css";

const schema = yup.object({
  nom: yup.string().required("Le nom est obligatoire"),
  prenom: yup.string().required("Le prénom est obligatoire"),
  email: yup.string().email("Format d'email invalide").required("L'email est obligatoire"),
  password: yup.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").required("Le mot de passe est obligatoire"),
  telephone: yup.string().nullable(),
  ville: yup.string().required("La ville est obligatoire"),
  role: yup.string().required("Le rôle est obligatoire"),
  statutUser: yup.string().required("Le statut est obligatoire"),
});

function AjouterUser() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
     defaultValues: {
      role: "EXPEDITEUR",
      statutUser: "ACTIF",
    },
  });

  const onSubmit = async (data) => {
    setSubmitError("");
    setSubmitSuccess("");

    try {
      await api.post("/api/users", data);
      setSubmitSuccess("Utilisateur ajouté avec succès ! Redirection en cours...");
      setTimeout(() => {
        navigate("/admin/users");
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'utilisateur :", error);
      setSubmitError(
        error.response?.data?.message || "Erreur lors de l'ajout de l'utilisateur. Veuillez réessayer."
      );
    }
  };

  return (
    <div className="app admin-page">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Ajouter un utilisateur</h1>
            <p>Créez un nouveau compte utilisateur avec ses rôles et statuts.</p>
          </div>
          <Link to="/admin/users" className="btn-cancel">
            ← Retour aux utilisateurs
          </Link>
        </div>

        <div className="form-card">
          <div className="form-card-header">
            <h5>Informations de l'utilisateur</h5>
            <p>Veuillez remplir les informations obligatoires.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-card-body">
              {submitError && ( <div className="alert-banner error"> {submitError}</div>)}
              {submitSuccess && ( <div className="alert-banner success"> {submitSuccess}</div> )}

              <div className="form-grid">
                <div className="form-group">
                  <label>Nom</label>
                  <input type="text" className={`form-control-custom ${errors.nom ? "is-error" : ""}`}  placeholder="Ex : Alami"{...register("nom")} />
                  {errors.nom && ( <span className="field-error">{errors.nom.message}</span> )}
                </div>
                <div className="form-group">
                  <label>Prénom</label>
                  <input type="text" className={`form-control-custom ${errors.prenom ? "is-error" : ""}`}placeholder="Ex : Karim"   {...register("prenom")}/>
                  {errors.prenom && (  <span className="field-error">{errors.prenom.message}</span>)}
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" className={`form-control-custom ${errors.email ? "is-error" : ""}`}placeholder="Ex : karim.alami@example.com" {...register("email")}  />
                  {errors.email && ( <span className="field-error">{errors.email.message}</span>)}
                </div>
                <div className="form-group">
                  <label>Mot de passe</label>
                  <input type="password"  className={`form-control-custom ${errors.password ? "is-error" : ""}`}  placeholder="Minimum 6 caractères" {...register("password")}/>
                  {errors.password && (<span className="field-error">{errors.password.message}</span> )}
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    className={`form-control-custom ${errors.telephone ? "is-error" : ""}`}
                    placeholder="Ex : 0612345678"
                    {...register("telephone")}
                  />
                  {errors.telephone && (<span className="field-error">{errors.telephone.message}</span>)}
                </div>
                <div className="form-group">
                  <label>Ville</label>
                  <input
                    type="text"
                    className={`form-control-custom ${errors.ville ? "is-error" : ""}`}
                    placeholder="Ex : Casablanca"
                    {...register("ville")}
                  />
                  {errors.ville && ( <span className="field-error">{errors.ville.message}</span> )}
                </div>
                <div className="form-group">
                  <label>Rôle</label>
                  <select  className={`form-control-custom ${errors.role ? "is-error" : ""}`} {...register("role")} >
                    <option value="EXPEDITEUR">Expéditeur</option>
                    <option value="TRANSPORTEUR">Transporteur</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                  {errors.role && (<span className="field-error">{errors.role.message}</span>  )}
                </div>
                <div className="form-group">
                  <label>Statut</label>
                  <select  className={`form-control-custom ${errors.statutUser ? "is-error" : ""}`} {...register("statutUser")}>
                    <option value="ACTIF">Actif</option>
                    <option value="INACTIF">Inactif</option>
                  </select>
                  {errors.statutUser && ( <span className="field-error">{errors.statutUser.message}</span>)}
                </div>
              </div>
            </div>

            <div className="form-card-footer">
              <Link to="/admin/users" className="btn-cancel">
                Annuler
              </Link>
              <button type="submit" className="btn-submit" disabled={isSubmitting}> {isSubmitting ? "Enregistrement..." : "Ajouter l'utilisateur"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AjouterUser;