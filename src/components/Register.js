// Register.js

import { ReactComponent as LogoSVG } from "../assets/tailwindcss.svg";
import { supabase } from "../supabaseClient";
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from "lucide-react";
import { useTranslation } from 'react-i18next'; // Importar useTranslation
import LanguageSwitcher from "./LanguageSwitcher";

const Logo = ({ className, color }) => (
  <LogoSVG className={className} style={{ fill: color }} />
);

const Register = () => {
  const { t } = useTranslation(); // Usar el hook useTranslation
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Clear any error when user modifies inputs
  useEffect(() => {
    if (error) setError("");
  }, [email, password, username, confirmPassword, error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError(t('register.passwordMismatch'));
      setIsLoading(false);
      return;
    }

    try {
      // Registrar al usuario con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Insertar información adicional en la tabla 'users'
      const { error: userError } = await supabase
        .from("users")
        .insert([
          {
            id: authData.user.id,
            username,
            email,
            role: "user",
          },
        ]);

      if (userError) throw userError;

      // Redirigir al usuario a la página de inicio de sesión
      navigate("/login");
    } catch (err) {
      // Handle different error types
      if (err.status === 400) {
        setError(t('register.invalidData'));
      } else if (err.status === 500) {
        setError(t('register.serverError'));
      } else {
        setError(err.message || t('register.unknownError'));
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
          <h1 className="text-4xl font-bold mb-6">{t('register.joinTitle')}</h1>
          <p className="text-indigo-200 mb-8">
            {t('register.joinSubtitle')}
          </p>
          <div className="bg-indigo-500/30 p-6 rounded-lg border border-indigo-400/30">
            <h3 className="font-semibold mb-2">{t('register.benefitsTitle')}</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2 text-indigo-300">✓</span>
                {t('register.benefits.events')}
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-indigo-300">✓</span>
                {t('register.benefits.tools')}
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-indigo-300">✓</span>
                {t('register.benefits.tracking')}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
      <div className="absolute top-4 right-4 z-50">
          <LanguageSwitcher />
        </div>
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-10">
            <Logo className="mx-auto h-16 w-auto" color="#4F46E5" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              {t('register.title')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t('register.subtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 text-red-700 p-3 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t('register.username')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder={t('register.usernamePlaceholder')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

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
                  placeholder={t('register.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t('common.password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder={t('register.passwordPlaceholder')}
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

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t('register.confirmPassword')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder={t('register.confirmPasswordPlaceholder')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t('register.registering') : t('register.register')}
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
                  {t('register.orContinueWith')}
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                {t('register.google')}
              </button>
              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                {t('register.microsoft')}
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            {t('register.alreadyHaveAccount')}{" "}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              {t('register.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;