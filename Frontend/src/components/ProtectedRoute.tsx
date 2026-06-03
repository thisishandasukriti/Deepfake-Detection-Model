import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: JSX.Element;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = localStorage.getItem("isLoggedIn") === "true"; // or token later

  if (!isAuthenticated) {
    return <Navigate to="/signup" replace />;
  }

  return children;
}
