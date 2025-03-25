// Login.js

import { ReactComponent as LogoSVG } from "../assets/tailwindcss.svg";
import { supabase } from "../supabaseClient";
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import { useTranslation } from 'react-i18next'; // Importar useTranslation
import LanguageSwitcher from "./LanguageSwitcher";

const Logo = ({ className, color }) => (
  <LogoSVG className={className} style={{ fill: color }} />
);

const Login = () => {
  const { t } = useTranslation(); // Usar el hook useTranslation
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Solo limpiar el error cuando el usuario modifica los campos de entrada
  useEffect(() => {
    if (error) setError("");
  }, [email, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Limpiar cualquier error previo

    // Validación básica del lado del cliente
    if (!email || !password) {
      setError("Por favor ingrese su correo electrónico y contraseña");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Intentando iniciar sesión con:", { email });
      
      // Sign in with Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Manejar errores de autenticación
      if (authError) {
        console.error("Error de autenticación:", authError);
        
        // Mapear mensajes de error específicos
        if (authError.message.includes("Invalid login credentials")) {
          setError("Correo electrónico o contraseña incorrecta");
        } else if (authError.message.includes("Email not confirmed")) {
          setError("Por favor confirme su correo electrónico antes de iniciar sesión");
        } else if (authError.message.includes("Invalid email")) {
          setError("Formato de correo electrónico inválido");
        } else if (authError.message.includes("rate limit")) {
          setError("Demasiados intentos. Por favor, inténtelo más tarde");
        } else {
          setError(authError.message || "Error de autenticación");
        }
        
        setIsLoading(false);
        return;
      }

      // Verificar que tenemos datos de usuario
      if (!data || !data.user) {
        console.error("No se recibieron datos de usuario después de la autenticación");
        setError("Error al iniciar sesión. Por favor, inténtelo de nuevo.");
        setIsLoading(false);
        return;
      }

      console.log("Autenticación exitosa, obteniendo datos de usuario...");

      // Get additional user information from 'users' table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (userError) {
        console.error("Error al obtener datos de usuario:", userError);
        setError("Error al obtener datos del usuario");
        setIsLoading(false);
        return;
      }

      // Store session data securely
      const expiresAt = new Date(Date.now() + 3600000).toISOString();
      
      // Store essential session data
      localStorage.setItem("token", data.session.access_token);
      localStorage.setItem("sessionExpiresAt", expiresAt);
      
      // Store minimal user data
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.user.id,
          username: userData.username,
          role: userData.role,
        })
      );

      console.log("Inicio de sesión exitoso, redirigiendo...");
      // Navigate to dashboard
      navigate("/");
    } catch (err) {
      // Handle unexpected errors
      console.error("Error inesperado durante el inicio de sesión:", err);
      
      // Intentar proporcionar un mensaje de error útil
      if (err.status === 400) {
        setError("Credenciales inválidas");
      } else if (err.status === 422) {
        setError("Datos de inicio de sesión inválidos");
      } else if (err.status === 429) {
        setError("Demasiados intentos. Por favor, inténtelo más tarde");
      } else if (err.status === 500) {
        setError("Error del servidor. Por favor, inténtelo más tarde");
      } else {
        setError(err.message || "Error desconocido al iniciar sesión");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      {/* Left Side - Illustration/Info Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 flex-col justify-center items-center p-12 text-white">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-6">{t('welcome.title')}</h1>
          <p className="text-indigo-200 mb-8">
            {t('welcome.subtitle')}
          </p>
          <div className="bg-indigo-500/30 p-6 rounded-lg border border-indigo-400/30">
            <h3 className="font-semibold mb-2">{t('welcome.whyChoose')}</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2 text-indigo-300">✓</span>
                {t('welcome.features.management')}
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-indigo-300">✓</span>
                {t('welcome.features.tools')}
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-indigo-300">✓</span>
                {t('welcome.features.tracking')}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
      <div className="absolute top-4 right-4 z-50">
          <LanguageSwitcher />
        </div>
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-10">
            <Logo className="mx-auto h-16 w-auto" color="#4F46E5" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              {t('login.title')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t('login.subtitle')}
            </p>
          </div>

          {/* Mostrar mensaje de error si existe */}
          {error && (
            <div className="mb-6 bg-red-50 text-red-700 p-3 rounded-md flex items-center border border-red-200">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t('common.email')}
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
                  placeholder={t('login.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('common.password')}
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  {t('common.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder={t('login.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700"
              >
                {t('common.rememberMe')}
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t('login.signingIn') : t('common.signIn')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {t('login.orContinueWith')}
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Google
              </button>
              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Microsoft
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            {t('login.noAccount')}{" "}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              {t('login.signUpNow')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;