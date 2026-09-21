import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { FaTachometerAlt, FaTruck,  FaRoute, FaInbox, FaBoxOpen, FaHistory,FaUser,  FaSearch,  FaClipboardList,  FaUsers,  FaBuilding,  FaCreditCard, FaCog, FaSignOutAlt,FaShippingFast,  FaTruckMoving, FaBars,  FaTimes,} from "react-icons/fa";
import "../../styles/sidebar.css";
import { logout } from "../../services/authService";

function Sidebar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [isOpen, setIsOpen] = useState(false);

  let user = null;
  try {
    if (token) {
      user = jwtDecode(token);
    }
  } catch (error) {
    console.error("Token invalide");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  if (!token || !user) {
    return null;
  }

  const role = user.role;
  const nom = user.nom || "Utilisateur";
  const prenom = user.prenom || "";
  const fullName = `${prenom} ${nom}`.trim();

  const roleLabel = {
    TRANSPORTEUR: "Transporteur",
    EXPEDITEUR: "Expéditeur",
    ADMIN: "Administrateur",
  };

  const navConfig = {
    TRANSPORTEUR: [
      { to: "/transporteur/dashboard", label: "Tableau de bord", icon: FaTachometerAlt },
      { to: "/transporteur/camions", label: "Mes Camions", icon: FaTruck },
      { to: "/transporteur/trajets", label: "Mes Trajets", icon: FaRoute },
      { to: "/transporteur/reservations", label: "Réservations", icon: FaInbox },
      { to: "/transporteur/profile", label: "Mon Profil", icon: FaUser },
    ],
    EXPEDITEUR: [
      { to: "/expediteur/dashboard", label: "Tableau de bord", icon: FaTachometerAlt },
      { to: "/expediteur/trajets", label: "Trajets dispo", icon: FaSearch },
      { to: "/expediteur/reservations", label: "Mes Réservations", icon: FaClipboardList },
      { to: "/expediteur/cargaisons", label: "Mes Cargaisons", icon: FaBoxOpen },
      { to: "/expediteur/paiements", label: "Paiements", icon: FaCreditCard },
      { to: "/expediteur/historique", label: "Historique", icon: FaHistory },
      { to: "/expediteur/profile", label: "Mon Profil", icon: FaUser },
    ],
    ADMIN: [
      { to: "/admin/dashboard", label: "Dashboard", icon: FaTachometerAlt },
      { to: "/admin/users", label: "Utilisateurs", icon: FaUsers },
      { to: "/admin/camions", label: "Camions", icon: FaTruckMoving },
      { to: "/admin/trajets", label: "Trajets", icon: FaRoute },
      { to: "/admin/cargaisons", label: "Cargaisons", icon: FaBoxOpen },
      { to: "/admin/reservations", label: "Réservations", icon: FaBuilding },
      { to: "/admin/paiements", label: "Paiements", icon: FaCreditCard },
      { to: "/admin/profile", label: "Mon Profil", icon: FaUser },
    ],
  };

  const menu = navConfig[role] || [];

  const handleLogout = () => {
    logout();
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
     
      <div
        className={`sidebar-overlay ${isOpen ? "active" : ""}`}
        onClick={closeSidebar}
      />

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">
            <FaShippingFast />
          </div>
          <div className="logo-text">
            <div className="logo-title">
              Souk<span>Transport</span>
            </div>
            <small>Transport collaboratif au Maroc</small>
          </div>

  
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={closeSidebar}
            aria-label="Fermer le menu"
          >
            <FaTimes />
          </button>
        </div>

        <div className="sidebar-content">
          <div className="sidebar-section-title">
            {role === "TRANSPORTEUR" && "TRANSPORTEUR"}
            {role === "EXPEDITEUR" && "EXPÉDITEUR"}
            {role === "ADMIN" && "ADMINISTRATION"}
          </div>

          <nav className="sidebar-menu">
            {menu.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <Icon className="sidebar-link-icon" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="sidebar-section-title account-title">COMPTE</div>
          <nav className="sidebar-menu">
            <NavLink
              to="/settings"
              onClick={closeSidebar}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <FaCog className="sidebar-link-icon" />
              <span>Paramètres</span>
            </NavLink>

            <button
              type="button"
              className="sidebar-link logout-btn"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="sidebar-link-icon" />
              <span>Déconnexion</span>
            </button>
          </nav>
        </div>
      </aside>

      <header className="dashboard-header">
        <button
          type="button"
          className="dashboard-menu-button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Ouvrir le menu"
        >
          <FaBars />
        </button>

        <div
          className="sidebar-user"
          aria-label={`Utilisateur connecté : ${fullName}`}
        >
          <div className="user-avatar">{fullName.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{fullName}</div>
            <div className="user-role">{roleLabel[role] || role}</div>
          </div>
        </div>
      </header>
    </>
  );
}

export default Sidebar;