import React, { useState } from "react";
import { CreateUserForm } from "../components/user/create-user-form";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function CreateUserPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleCreateUser = async (form) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // Usar la Edge Function 'create-user' para crear el usuario sin cerrar la sesión actual
      const { data, error: functionError } = await supabase.functions.invoke(
        "create-user",
        {
          body: {
            email: form.email,
            password: form.password,
            username: form.username,
            role: form.role,
          },
        }
      );

      if (functionError) throw functionError;

      // La Edge Function puede devolver un error en formato JSON incluso con status 200 en algunos casos proxy,
      // pero normalmente con invoke si falla tira error.
      // Verificamos si la respuesta trae error explícito
      if (data && data.error) {
        throw new Error(data.error);
      }

      setSuccess("Usuario creado exitosamente.");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error("Error creando usuario:", err);
      // Mejorar mensajes de error basados en la respuesta
      let message = err.message || "Error al crear usuario";
      if (message.includes("FunctionsFetchError")) {
        // Error de red o del edge function container
        message = "Error de conexión con el servicio de creación de usuarios.";
      } else if (message.includes("403")) {
        message = "No tienes permisos para realizar esta acción.";
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
      <CreateUserForm
        onSubmit={handleCreateUser}
        loading={loading}
        error={error}
        success={success}
      />
    </div>
  );
}
