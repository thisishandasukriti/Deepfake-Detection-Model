import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import FrontPage from "./pages/home"; // Hero / landing page
import AppPage from "./AppPage";       // Detector page
import Signup from "./pages/signup";
import Login from "./pages/login";
import ProtectedRoute from "./components/ProtectedRoute";


const App = () => {
  return (
    <Router>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<FrontPage />} />

        {/* Detector page */}
        <Route path="/detect" element={<ProtectedRoute><AppPage /></ProtectedRoute>} />

        {/* Auth routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Any unknown path redirects to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
