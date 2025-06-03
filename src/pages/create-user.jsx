import React, { useState } from "react";
import { CreateUserForm } from "../components/create-user-form";
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
      // Insertar usuario en la tabla 'users' y crear auth en supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });
      if (authError) throw authError;
      const { error: userError } = await supabase.from("users").insert([
        {
          id: authData.user.id,
          username: form.username,
          email: form.email,
          role: form.role,
        },
      ]);
      if (userError) throw userError;
      setSuccess("Usuario creado exitosamente.");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.message || "Error al crear usuario");
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
