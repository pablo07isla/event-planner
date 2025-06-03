// App.js

import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./components/Register";
import SearchEvents from "./components/SearchEvents";
import SessionManager from "./components/SessionManager";
import Dashboard from "./pages/Dashboard";
import EventCalendar from "./pages/EventCalendar";
import CreateUserPage from "./pages/create-user";
// Asegúrate de que la ruta de importación sea correcta
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { SidebarProvider, SidebarInset } from "./components/ui/sidebar";

const App = () => {
  return (
    <Router>
      <SessionManager />
      <SidebarProvider
        style={{
          "--sidebar-width": "15rem",
          "--sidebar-width-mobile": "15rem",
        }}
      >
        <SidebarInset>
          {/* Aquí puedes agregar un componente de barra lateral si es necesario */}
          <main>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/"
                element={<Navigate to="/dashboard" replace />} // Redirige la raíz a dashboard
              />
              <Route
                path="/search"
                element={
                  <ProtectedRoute>
                    <SearchEvents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pages/create-user"
                element={
                  <ProtectedRoute>
                    <CreateUserPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pages/calendar"
                element={
                  <ProtectedRoute>
                    <EventCalendar />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </Router>
  );
};

export default App;
