import React from "react";
import {
  Calendar,
  Search,
  Megaphone,
  PlusCircle,
  User,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const Sidebar = ({ currentUser, onAddEvent }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };
  return (
    <div className="w-64 h-screen bg-gradient-to-b from-indigo-600 to-indigo-800 text-white flex flex-col shadow-xl">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">EventPlanner</h2>
        <nav>
          <ul className="space-y-4">
            <li>
              <a
                href="/"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-indigo-700 transition duration-150 ease-in-out text-white"
              >
                <Calendar className="h-5 w-5" />
                <span className="font-medium ">Calendario</span>
              </a>
            </li>
            <li>
              <a
                href="/search"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-indigo-700 transition duration-150 ease-in-out text-white"
              >
                <Search className="h-5 w-5" />
                <span className="font-medium ">Buscar</span>
              </a>
            </li>
            <li>
              <a
                href="/marketing"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-indigo-700 transition duration-150 ease-in-out text-white"
              >
                <Megaphone className="h-5 w-5" />
                <span className="font-medium ">Marketing</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="mt-auto p-6">
        <button
          onClick={onAddEvent}
          className="w-full bg-white text-indigo-600 font-bold py-3 px-4 rounded-lg hover:bg-indigo-100 transition duration-150 ease-in-out flex items-center justify-center shadow-md"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Agregar Evento
        </button>
        <div className="mt-6 pt-6 border-t border-indigo-500">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-500 rounded-full p-2">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-medium">{currentUser}</p>
              <p className="text-xs text-indigo-200">Administrador</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 w-full flex items-center justify-center space-x-2 text-sm text-indigo-200 hover:text-white transition duration-150 ease-in-out"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};
Sidebar.propTypes = {
  currentUser: PropTypes.string.isRequired,
  onAddEvent: PropTypes.func.isRequired,
};

export default Sidebar;
