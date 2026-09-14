
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Sidebar from "../../../components/layout/Sidebar";
import api from "../../../services/api";

import "../../../styles/global.css";
import "../styles/admin.css";
import "../../../styles/formPage.css";
import Loader from "../../../components/common/Loader";

const schema = yup.object({
  nom: yup.string().required("Le nom est obligatoire"),
  prenom: yup.string().required("Le prénom est obligatoire"),
  email: yup.string() .email("Format d'email invalide") .required("L'email est obligatoire"),
  telephone: yup.string().nullable(),
  ville: yup.string().required("La ville est obligatoire"),
  role: yup.string().required("Le rôle est obligatoire"),
  statutUser: yup.string().required("Le statut est obligatoire"),
});

function ModifierUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    api.get(`/api/users/${id}`).then((res) => {
        setValue("nom", res.data.nom);
        setValue("prenom", res.data.prenom);
        setValue("email", res.data.email);
        setValue("telephone", res.data.telephone);
        setValue("ville", res.data.ville);
        setValue("role", res.data.role);
        setValue("statutUser", res.data.statutUser);

        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setSubmitError( "Impossible de charger les données de cet utilisateur." );
        setLoading(false);
      });
  }, [id, setValue]);

  const onSubmit = async (data) => {
    setSubmitError("");
    setSubmitSuccess("");

    try {
      await api.put(`/api/users/${id}`, data);
      setSubmitSuccess("Utilisateur modifié avec succès");

      setTimeout(() => {
        navigate("/admin/users");
      }, 1500);
    } catch (error) {
      console.error(error);

      const serverMessage =
        error.response?.data?.message ||
        (typeof error.response?.data === "string" ? error.response.data : null);

      setSubmitError(
        error.response?.status === 401
          ? "Votre session a expiré. Reconnectez-vous puis réessayez."
          : serverMessage ||
          "Erreur lors de la modification de l'utilisateur"
      );
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
            <h1>Modifier l'utilisateur</h1>
            <p>
              Mettez à jour les informations du profil utilisateur #{id}.
            </p>
          </div>

          <Link to="/admin/users" className="btn-cancel">
            ← Retour aux utilisateurs
          </Link>
        </div>

        <div className="form-card">
          <div className="form-card-header">
            <h5>Modifier les informations</h5>
            <p>Modifiez les champs ci-dessous puis validez.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-card-body">
              {submitError && (
                <div className="alert-banner error">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="alert-banner success">
                  {submitSuccess}
                </div>
              )}

              <div className="form-grid">
                <div className="form-group">
                  <label>Nom</label>

                  <input
                    type="text"
                    className={`form-control-custom ${
                      errors.nom ? "is-error" : ""
                    }`}
                    {...register("nom")}
                  />

                  {errors.nom && (
                    <span className="field-error">
                      {errors.nom.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>Prénom</label>

                  <input
                    type="text"
                    className={`form-control-custom ${
                      errors.prenom ? "is-error" : ""
                    }`}
                    {...register("prenom")}
                  />

                  {errors.prenom && (
                    <span className="field-error">
                      {errors.prenom.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>Email</label>

                  <input
                    type="email"
                    className={`form-control-custom ${
                      errors.email ? "is-error" : ""
                    }`}
                    {...register("email")}
                  />

                  {errors.email && (
                    <span className="field-error">
                      {errors.email.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>Téléphone</label>

                  <input
                    type="tel"
                    className={`form-control-custom ${
                      errors.telephone ? "is-error" : ""
                    }`}
                    {...register("telephone")}
                  />

                  {errors.telephone && (
                    <span className="field-error">
                      {errors.telephone.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>Ville</label>

                  <input
                    type="text"
                    className={`form-control-custom ${
                      errors.ville ? "is-error" : ""
                    }`}
                    {...register("ville")}
                  />

                  {errors.ville && (
                    <span className="field-error">
                      {errors.ville.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>Rôle</label>

                  <select
                    className={`form-control-custom ${
                      errors.role ? "is-error" : ""
                    }`}
                    {...register("role")}
                  >
                    <option value="EXPEDITEUR">Expéditeur</option>
                    <option value="TRANSPORTEUR">Transporteur</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>

                  {errors.role && (
                    <span className="field-error">
                      {errors.role.message}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>Statut</label>

                  <select
                    className={`form-control-custom ${
                      errors.statutUser ? "is-error" : ""
                    }`}
                    {...register("statutUser")}
                  >
                    <option value="ACTIF">Actif</option>
                    <option value="INACTIF">Inactif</option>
                  </select>

                  {errors.statutUser && (
                    <span className="field-error">
                      {errors.statutUser.message}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="form-card-footer">
              <Link to="/admin/users" className="btn-cancel">
                Annuler
              </Link>

              <button
                type="submit"
                className="btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Enregistrement..."
                  : "Enregistrer les modifications"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ModifierUser;
