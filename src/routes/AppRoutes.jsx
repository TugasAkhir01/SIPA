import { Routes, Route } from "react-router-dom";
import HomePage from "../dashboard/HomePage";
import Profile from "../profile/profile";
import DataManagement from "../dm/dm";
import UserManagement from "../um/um";
import Unauthorized from "../pages/Unauthorized";
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => (
  <Routes>
    <Route path="/dashboard" element={
      <ProtectedRoute minRole={3}>
        <HomePage />
      </ProtectedRoute>
    } />

    <Route path="/profile" element={
      <ProtectedRoute minRole={3}>
        <Profile />
      </ProtectedRoute>
    } />

    <Route path="/data-management" element={
      <ProtectedRoute minRole={2}>
        <DataManagement />
      </ProtectedRoute>
    } />

    <Route path="/user-management" element={
      <ProtectedRoute minRole={1}>
        <UserManagement />
      </ProtectedRoute>
    } />

    <Route path="/unauthorized" element={<Unauthorized />} />
  </Routes>
);

export default AppRoutes;
