import { supabase } from "../../supabaseClient";
import { Trans } from "@lingui/macro";
import * as Avatar from "@radix-ui/react-avatar";
import * as Separator from "@radix-ui/react-separator";
import {
  Calendar,
  Search,
  Megaphone,
  PlusCircle,
  LogOut,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const Sidebar = ({ currentUser, onAddEvent }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      console.log("[Sidebar] handleLogout: llamando a supabase.auth.signOut()");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("[Sidebar] Error signing out:", error);
      } else {
        console.log("[Sidebar] Sign out solicitado correctamente");
      }
    } catch (err) {
      console.error("[Sidebar] Unexpected error during sign out:", err);
    }
  };

  const navItems = [
    { path: "/", icon: Calendar, label: <Trans>Calendar</Trans> },
    { path: "/search", icon: Search, label: <Trans>Search</Trans> },
    { path: "/marketing", icon: Megaphone, label: <Trans>Marketing</Trans> },
    { path: "/notifications", icon: Bell, label: <Trans>Notifications</Trans> },
    { path: "/settings", icon: Settings, label: <Trans>Settings</Trans> },
  ];

  return (
    <div
      className={`relative ${
        isCollapsed ? "w-30" : "w-64"
      } h-screen bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-900 text-white flex flex-col shadow-xl transition-all duration-300`}
    >
      <div className="p-6">
        <h2
          className={`text-3xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-indigo-100 ${
            isCollapsed ? "text-xl" : "text-3xl"
          }`}
        >
          {isCollapsed ? <Trans>EP</Trans> : <Trans>Event Planner</Trans>}
        </h2>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-6 right-2 text-indigo-300 hover:text-white focus:outline-none"
        >
          {isCollapsed ? (
            <ChevronRight className="h-6 w-6" />
          ) : (
            <ChevronLeft className="h-6 w-6" />
          )}
        </button>

        <nav>
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center ${
                  isCollapsed ? "justify-center" : "space-x-3"
                } p-3 rounded-lg transition duration-200 ease-in-out no-underline
                    ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "text-indigo-100 hover:text-white hover:bg-indigo-600/50"
                    } group`
              }
            >
              <Icon
                className={`${
                  isCollapsed ? "h-6 w-6" : "h-5 w-5"
                } transition-transform group-hover:scale-110`}
              />
              {!isCollapsed && <span className="font-medium">{label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-6">
        <button
          onClick={onAddEvent}
          className={`w-full bg-indigo-500 text-white font-bold py-3 ${
            isCollapsed ? "px-0" : "px-4"
          } rounded-lg transition duration-200 ease-in-out 
          hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-opacity-50 
          shadow-lg hover:shadow-xl flex items-center justify-center ${
            isCollapsed ? "space-x-0" : "space-x-2"
          }`}
        >
          <PlusCircle className={`${isCollapsed ? "h-6 w-6" : "h-5 w-5"}`} />
          {!isCollapsed && (
            <span>
              <Trans>Add Event</Trans>
            </span>
          )}
        </button>

        <Separator.Root className="bg-indigo-400/30 h-px" />

        <div
          className={`flex items-center ${
            isCollapsed ? "justify-center" : "space-x-4"
          }`}
        >
          <Avatar.Root
            className="bg-indigo-400 inline-flex h-12 w-12 select-none items-center justify-center overflow-hidden rounded-full align-middle 
            transition duration-200 ease-in-out hover:bg-indigo-300 border-2 border-indigo-300"
          >
            <Avatar.Fallback className="text-indigo-100 text-sm font-medium">
              {currentUser ? currentUser.charAt(0).toUpperCase() : "?"}
            </Avatar.Fallback>
          </Avatar.Root>

          {!isCollapsed && (
            <div>
              <p className="font-medium text-indigo-100">{currentUser}</p>
              <p className="text-xs text-indigo-300">
                <Trans>Administrator</Trans>
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center justify-center ${
            isCollapsed ? "space-x-0" : "space-x-2"
          } text-sm text-indigo-300 hover:text-white 
          transition duration-200 ease-in-out p-2 rounded-lg hover:bg-indigo-600/50 focus:outline-none 
          focus:ring-2 focus:ring-indigo-300 focus:ring-opacity-50`}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && (
            <span>
              <Trans>Sign Out</Trans>
            </span>
          )}
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
