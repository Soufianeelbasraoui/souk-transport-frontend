import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function PublicRoute({ children }) {
  const token = localStorage.getItem("token");

  if (token) {
    try {
      const user = jwtDecode(token);
      if (user.role === "ADMIN") {
        return <Navigate to="/admin/dashboard" replace />;
      }

      if (user.role === "TRANSPORTEUR") {
        return <Navigate to="/transporteur/dashboard" replace />;
      }

      if (user.role === "EXPEDITEUR") {
        return <Navigate to="/expediteur/dashboard" replace />;
      }
    } catch (error) {
      localStorage.removeItem("token");
    }
  }

  return <Outlet/>;
}

export default PublicRoute;