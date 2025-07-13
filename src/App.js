import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "./components/login/LoginForm";
import ForgotPassword from "./components/login/ForgotPassword";
import HomePage from "./components/dashboard/HomePage";
import UserManagement from "./components/um/um";
import DataManagement from "./components/dm/dm";
import Profile from "./components/profile/profile";
import Approval from "./components/approval/approval";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/data-management" element={<DataManagement />} />
        <Route path="/approval" element={<Approval/>} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
