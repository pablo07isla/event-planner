import { supabase } from "../supabaseClient";
import * as Avatar from "@radix-ui/react-avatar";
import * as Separator from "@radix-ui/react-separator";
import {
  Calendar,
  Search,
  Megaphone,
  PlusCircle,
  User,
  LogOut,
} from "lucide-react";
import PropTypes from "prop-types";
import React from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ currentUser, onAddEvent }) => {
  console.log("currentUser:", currentUser); // Agregar este log
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error al cerrar sesión:", error);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("sessionExpiresAt");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <div className="w-64 h-screen bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-900 text-white flex flex-col shadow-xl">
      <div className="p-6">
        <h2 className="text-3xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-indigo-100">
          EventPlanner
        </h2>
        <nav>
          <ul className="space-y-2">
            {[
              { href: "/", icon: Calendar, label: "Calendario" },
              { href: "/search", icon: Search, label: "Buscar" },
              { href: "/marketing", icon: Megaphone, label: "Marketing" },
            ].map(({ href, icon: Icon, label }) => (
              <li key={href}>
                <a
                  href={href}
                  className="flex items-center space-x-3 p-3 rounded-lg transition duration-200 ease-in-out text-indigo-100 hover:text-white hover:bg-indigo-600/50 group"
                >
                  <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                  <span className="font-medium">{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="mt-auto p-6 space-y-6">
        <button
          onClick={onAddEvent}
          className="w-full bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition duration-200 ease-in-out hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-opacity-50 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Agregar Evento</span>
        </button>
        <Separator.Root className="bg-indigo-400/30 h-px" />
        <div className="flex items-center space-x-4">
          <Avatar.Root className="bg-indigo-400 inline-flex h-12 w-12 select-none items-center justify-center overflow-hidden rounded-full align-middle transition duration-200 ease-in-out hover:bg-indigo-300">
            <Avatar.Fallback className="text-indigo-100 text-sm font-medium">
              {currentUser ? currentUser.charAt(0).toUpperCase() : "?"}
            </Avatar.Fallback>
          </Avatar.Root>
          <div>
            <p className="font-medium text-indigo-100">{currentUser}</p>
            <p className="text-xs text-indigo-300">Administrador</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 text-sm text-indigo-300 hover:text-white transition duration-200 ease-in-out p-2 rounded-lg hover:bg-indigo-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-opacity-50"
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  currentUser: PropTypes.string.isRequired,
  onAddEvent: PropTypes.func.isRequired,
};

export default Sidebar;
