import { Navigate } from "react-router-dom";
import { hasAccess } from "../helpers/roleAccess";

const ProtectedRoute = ({ children, minRole }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!user || typeof user.role !== "number") {
    return <Navigate to="/login" replace />;
  }

  if (!hasAccess(user.role, minRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
