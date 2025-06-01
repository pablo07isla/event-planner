// App.js

import EventCalendar from "./components/EventCalendar";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./components/Register";
import SearchEvents from "./components/SearchEvents";
import SessionManager from "./components/SessionManager";
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
        <div className="flex flex-col h-screen">
          <div className="flex flex-1 min-h-0">
            <SidebarInset>
              {/* Si tienes un sidebar lateral, insértalo aquí si es necesario */}
              <main className="flex-1 overflow-auto">
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
              </main>
            </SidebarInset>
          </div>
        </div>
      </SidebarProvider>
    </Router>
  );
};

export default App;
