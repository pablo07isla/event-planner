import React, { useState } from "react";
import { Trans } from "@lingui/macro";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Mail, Lock, User, AlertCircle, UserCheck } from "lucide-react";

export function CreateUserForm({ onSubmit, loading, error, success, initialValues }) {
  const [form, setForm] = useState({
    username: initialValues?.username || "",
    email: initialValues?.email || "",
    password: initialValues?.password || "",
    role: initialValues?.role || "user",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(form);
  };

  return (
    <div className="flex min-h-screen h-screen w-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-8 relative">
        <div className="absolute top-4 right-4 z-50">
          {/* Puedes agregar aquí un LanguageSwitcher si lo usas globalmente */}
        </div>
        
        <div className="text-center mb-8">
         
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            <Trans>Crear usuario</Trans>
          </h2>
          <p className="text-sm text-gray-600">
            <Trans>Completa el formulario para crear un nuevo usuario.</Trans>
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Campo Username */}
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
              <Trans>Nombre de usuario</Trans>
            </label>
            <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <User className="h-5 w-5 text-gray-400" />
                           </div>
                           <input
                id="username"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                autoComplete="username"
                placeholder="Ingresa tu nombre de usuario"
                 className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Campo Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
              <Trans>Email</Trans>
            </label>
            <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Mail className="h-5 w-5 text-gray-400" />
                            </div>
              <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Ingresa tu correo electrónico"
                 value={form.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Campo Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
              <Trans>Contraseña</Trans>
            </label>
            <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <Lock className="h-5 w-5 text-gray-400" />
                           </div>
                           <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder="Ingresa una contraseña segura"
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Campo Role */}
          <div className="space-y-2">
            <label htmlFor="role" className="block text-sm font-semibold text-gray-700">
              <Trans>Rol</Trans>
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-lg px-4 py-3 text-sm shadow-sm text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-gray-400"
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {/* Mensajes de Error y Éxito */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start space-x-2">
              <UserCheck className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? <Trans>Creando...</Trans> : <Trans>Crear usuario</Trans>}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg border border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => window.location.assign("/")}
              disabled={loading}
            >
              <Trans>Cancelar</Trans>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

CreateUserForm.defaultProps = {
  onSubmit: () => {},
  loading: false,
  error: "",
  success: "",
  initialValues: {},
};