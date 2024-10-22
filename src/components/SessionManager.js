import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const SessionManager = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const session = await supabase.auth.getSession();
      const expiresAt = localStorage.getItem('sessionExpiresAt');

      if (!session || !expiresAt || new Date(expiresAt) < new Date()) {
        // La sesión ha expirado o no existe
        await supabase.auth.signOut();
        localStorage.removeItem('token');
        localStorage.removeItem('sessionExpiresAt');
        localStorage.removeItem('user');
        navigate('/login');
      }
    };

    const intervalId = setInterval(checkSession, 60000); // Verificar cada minuto

    return () => clearInterval(intervalId);
  }, [navigate]);

  return null;
};

export default SessionManager;

