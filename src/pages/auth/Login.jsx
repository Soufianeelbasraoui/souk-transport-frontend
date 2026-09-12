import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import api from "../../services/api";
import "./Login.css";
import { jwtDecode } from "jwt-decode";
import LeftPanel from "./LeftPanel/LeftPanel";
import { FiArrowLeft } from "react-icons/fi";

const schema = yup.object({
  email: yup.string().email("Email invalide").required("L'email est obligatoire"),
  password: yup.string().required("Le mot de passe est obligatoire")
});

function Login() {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onsubmit = async (data) => {
    setLoginError("");

    try {
      const response = await api.post("/auth/login", data);
      const token = response.data.token;
      
      localStorage.setItem("token", token);

      const user = jwtDecode(token);
      if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (user.role === "TRANSPORTEUR") {
        navigate("/transporteur/dashboard");
      } else if (user.role === "EXPEDITEUR") {
        navigate("/expediteur/dashboard");
      }

    } catch (error) {
      localStorage.removeItem("token");
      setLoginError(
        error.response?.status === 401 
          ? "Email ou mot de passe incorrect." 
          : "Impossible de se connecter. Vérifiez que le serveur est disponible."
      );
    }
  };

  return (
    <div className="login-container">
      <LeftPanel />
      
      <div className="right-panel-container">
        <div className="login-content-wrapper">
          {/* Link placé en dehors de la login-card */}
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

            <form onSubmit={handleSubmit(onsubmit)}>
              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Email</label>
                <input 
                  type="email"
                  className="form-control"
                  placeholder="Entrez votre email"
                  {...register("email")}
                />
                {errors.email && (<span className="auth-error-text">{errors.email.message}</span>)}
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Mot de passe</label>
                <input 
                  type="password"
                  className="form-control"
                  placeholder="Entrez votre mot de passe"
                  {...register("password")}
                />
                {errors.password && (<span className="auth-error-text">{errors.password.message}</span>)}
              </div>

              {loginError && <p className="auth-error-text mb-2">{loginError}</p>}

              <button type="submit" className="btn-submit mt-2">
                Se connecter
              </button>
            </form>

            <div className="divider-container">
              <hr className="divider-line" />
              <span className="divider-text">ou</span>
            </div>

            <Link to="/register" className="btn-register-link">
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;