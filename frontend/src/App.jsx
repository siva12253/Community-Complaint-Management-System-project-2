import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Admin from "./pages/Admin";
import AuthPage from "./pages/AuthPage";
import ComplaintDetail from "./pages/ComplaintDetail";
import ComplaintForm from "./pages/ComplaintForm";
import Complaints from "./pages/Complaints";
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";

export default function App() {
  return <Routes>
    <Route path="/login" element={<AuthPage />} />
    <Route path="/register" element={<AuthPage register />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/complaints/:id" element={<ComplaintDetail />} />
        <Route path="/new-complaint" element={<ComplaintForm />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route element={<ProtectedRoute admin />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Route>
    </Route>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
