// App.js
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import EventCalendar from "./components/EventCalendar";
import SearchEvents from "./components/SearchEvents";
import ProtectedRoute from "./components/ProtectedRoute";
import SessionManager from "./components/SessionManager";

import "bootstrap/dist/css/bootstrap.min.css";
import "./i18n"; // Importamos i18n para inicializarlo

const App = () => {
  return (
    <Router>
      <SessionManager />
      <div className="relative">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <EventCalendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <SearchEvents />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
