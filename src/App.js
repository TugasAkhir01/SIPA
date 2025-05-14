import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "./components/login/LoginForm";
import ForgotPassword from "./components/login/ForgotPassword";
import HomePage from "./components/dashboard/HomePage";
import UserManagement from "./components/um/um";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/data" element={<HomePage />} />
        <Route path="/profile" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
