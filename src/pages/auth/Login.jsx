import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiX, FiMail } from "react-icons/fi";
import { FaGoogle } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import client from "../../api/client";
import LeftPanel from "./LeftPanel/LeftPanel";
import "./Login.css";

const loginSchema = yup.object({
  email: yup
    .string()
    .email("Email invalide")
    .required("L'email est obligatoire"),
  password: yup
    .string()
    .required("Le mot de passe est obligatoire"),
});

const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .email("Email invalide")
    .required("L'adresse email est obligatoire"),
});

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Modal Mot de passe oublié
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    reset: resetForgot,
    formState: { errors: errorsForgot },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setLoginError("");
    setIsLoading(true);

    try {
      const user = await login(data.email, data.password, rememberMe);
      toast.success(`Bienvenue, ${user?.prenom || user?.nom || "cher membre"} !`);

      if (user?.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (user?.role === "TRANSPORTEUR") {
        navigate("/transporteur/dashboard");
      } else if (user?.role === "EXPEDITEUR") {
        navigate("/expediteur/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setLoginError(error.response.data.message);
      } else if (error.response?.status === 401) {
        setLoginError("Email ou mot de passe incorrect.");
      } else if (error.response?.status === 403) {
        setLoginError("Accès refusé. Votre compte n'est pas actif.");
      } else {
        setLoginError(error.message || "Impossible de se connecter. Vérifiez que le serveur est disponible.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotSubmit = async (data) => {
    setForgotLoading(true);
    try {
      const res = await client.post("/auth/forgot-password", { email: data.email });
      toast.success(res.data?.message || "Un lien de réinitialisation vous a été envoyé par email.");
      setForgotModalOpen(false);
      resetForgot();
    } catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.info("Si cette adresse email est enregistrée, vous recevrez les instructions par email.");
        setForgotModalOpen(false);
        resetForgot();
      }
    } finally {
      setForgotLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Intégration Google Authentification
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
    // Si endpoint OAuth backend configuré, rediriger, sinon notifier
    toast.info("Redirection vers l'authentification Google en cours...");
    window.location.href = `${apiUrl}/oauth2/authorization/google`;
  };

  return (
    <div className="login-container">
      <LeftPanel />

      <div className="right-panel-container">
        <div className="login-content-wrapper">
          <Link to="/" className="back-to-home-link">
            <span className="back-arrow-icon">
              <FiArrowLeft aria-hidden="true" />
            </span>
            <span>Accueil</span>
          </Link>

          <div className="login-card">
            <div className="text-center mb-3">
              <div className="login-icon-box mb-2">
                <span className="login-icon-text">➔</span>
              </div>
              <h2 className="login-title">Bienvenue sur SoukTransport</h2>
              <p className="login-subtitle">Connectez-vous à votre compte</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Entrez votre email"
                  {...register("email")}
                />
                {errors.email && (
                  <span className="auth-error-text">{errors.email.message}</span>
                )}
              </div>

              <div className="mb-2">
                <label className="form-label text-muted small fw-semibold">Mot de passe</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Entrez votre mot de passe"
                  {...register("password")}
                />
                {errors.password && (
                  <span className="auth-error-text">{errors.password.message}</span>
                )}
              </div>

              {/* SE SOUVENIR DE MOI & MOT DE PASSE OUBLIÉ */}
              <div className="auth-options-row">
                <label className="remember-me-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Se souvenir de moi</span>
                </label>

                <button
                  type="button"
                  className="forgot-password-btn"
                  onClick={() => setForgotModalOpen(true)}
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {loginError && (
                <div className="auth-error-box py-2 px-3 mb-2 text-danger small">
                  {loginError}
                </div>
              )}

              <button type="submit" className="btn-submit mt-1" disabled={isLoading}>
                {isLoading ? "Connexion en cours..." : "Se connecter"}
              </button>
            </form>

            <div className="divider-container">
              <hr className="divider-line" />
              <span className="divider-text">ou</span>
            </div>

            {/* BOUTON GOOGLE */}
            <button
              type="button"
              className="btn-google"
              onClick={handleGoogleLogin}
              title="Continuer avec votre compte Google"
            >
              <FaGoogle className="google-icon" />
              <span>Continuer avec Google</span>
            </button>

            {/* BOUTON CRÉER UN COMPTE */}
            <Link to="/register" className="btn-register-link">
              Créer un compte
            </Link>
          </div>
        </div>
      </div>

      {/* MODAL MOT DE PASSE OUBLIÉ */}
      {forgotModalOpen && (
        <div className="modal-auth-overlay" onClick={() => setForgotModalOpen(false)}>
          <div className="modal-auth-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-auth-header">
              <div>
                <h3 className="modal-auth-title">Réinitialisation du mot de passe</h3>
                <p className="modal-auth-subtitle">
                  Saisissez votre adresse email pour recevoir un lien de réinitialisation sécurisé.
                </p>
              </div>
              <button
                type="button"
                className="modal-auth-close"
                onClick={() => setForgotModalOpen(false)}
                aria-label="Fermer"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitForgot(onForgotSubmit)}>
              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Adresse Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="votre.email@exemple.com"
                  {...registerForgot("email")}
                />
                {errorsForgot.email && (
                  <span className="auth-error-text">{errorsForgot.email.message}</span>
                )}
              </div>

              <div className="modal-auth-actions">
                <button
                  type="button"
                  className="btn-secondary-modal"
                  onClick={() => setForgotModalOpen(false)}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  style={{ width: "auto", padding: "0.55rem 1.25rem" }}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Envoi en cours..." : "Envoyer le lien"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;