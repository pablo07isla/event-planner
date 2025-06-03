import { supabase } from "../../supabaseClient";
import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SessionManager = () => {
  console.log("[SessionManager] Componente montado");
  const navigate = useNavigate();
  const location = useLocation();
  const refreshTimeout = useRef(null);

  useEffect(() => {
    // Evitar lógica de sesión en /login o /register
    if (location.pathname === "/login" || location.pathname === "/register") {
      return;
    }
    console.log("[SessionManager] useEffect ejecutado");
    // Función para limpiar el timeout
    const clearRefreshTimeout = () => {
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
        refreshTimeout.current = null;
      }
    };

    // Programa la renovación automática del token
    const scheduleRefresh = (expiresAt) => {
      clearRefreshTimeout();
      if (!expiresAt) {
        console.log("[SessionManager] scheduleRefresh: expiresAt no definido");
        return;
      }
      const now = Date.now();
      const expires = new Date(expiresAt).getTime();
      const msUntilRefresh = Math.max(expires - now - 60000, 0);
      console.log(
        `[SessionManager] scheduleRefresh: programando refresh en ${
          msUntilRefresh / 1000
        }s`
      );
      refreshTimeout.current = setTimeout(async () => {
        console.log("[SessionManager] Ejecutando refreshSession");
        await supabase.auth.refreshSession();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session && session.expires_at) {
          localStorage.setItem(
            "sessionExpiresAt",
            new Date(session.expires_at * 1000).toISOString()
          );
          scheduleRefresh(new Date(session.expires_at * 1000).toISOString());
        }
      }, msUntilRefresh);
    };

    // Listener para cambios de autenticación
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[SessionManager] onAuthStateChange:", event, session);
        if (!session) {
          console.log(
            "[SessionManager] No session, limpiando storage y forzando recarga"
          );
          // NO llamar a supabase.auth.signOut() aquí para evitar doble logout
          localStorage.removeItem("token");
          localStorage.removeItem("sessionExpiresAt");
          localStorage.removeItem("user");
          clearRefreshTimeout();
          // Forzar recarga total para limpiar cualquier estado residual
          window.location.href = "/login";
        } else {
          if (session.expires_at) {
            const expiresAtISO = new Date(
              session.expires_at * 1000
            ).toISOString();
            localStorage.setItem("sessionExpiresAt", expiresAtISO);
            scheduleRefresh(expiresAtISO);
          }
        }
      }
    );

    // Verificación inicial al montar
    const checkInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const expiresAt = localStorage.getItem("sessionExpiresAt");
      console.log("[SessionManager] checkInitialSession:", {
        session,
        expiresAt,
      });
      if (!session || !expiresAt || new Date(expiresAt) < new Date()) {
        console.log(
          "[SessionManager] Sesión inválida o expirada, cerrando sesión"
        );
        await supabase.auth.signOut();
        localStorage.removeItem("token");
        localStorage.removeItem("sessionExpiresAt");
        localStorage.removeItem("user");
        clearRefreshTimeout();
        navigate("/login");
      } else {
        scheduleRefresh(expiresAt);
      }
    };
    checkInitialSession();

    // Limpieza del listener y timeout al desmontar
    return () => {
      listener.subscription.unsubscribe();
      clearRefreshTimeout();
    };
  }, [navigate, location]);

  return null;
};

export default SessionManager;
