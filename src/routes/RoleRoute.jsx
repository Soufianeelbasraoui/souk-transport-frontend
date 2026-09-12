import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router-dom";

function RoleRoute({ roles, children }) {

  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = jwtDecode(token);
    if (!roles.includes(user.role)) {
      return <Navigate to="/unauthorized"/>;
    }
    return children;

  } catch (error) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
}

export default RoleRoute;