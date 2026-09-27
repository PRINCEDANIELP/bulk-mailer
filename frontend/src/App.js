import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import SendMail from "./pages/SendMail";
import History from "./pages/History";

function AuthedLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      {children}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/send"
            element={
              <ProtectedRoute>
                <AuthedLayout>
                  <SendMail />
                </AuthedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <AuthedLayout>
                  <History />
                </AuthedLayout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/send" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
