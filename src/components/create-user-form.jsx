import React, { useState } from "react";
import { Trans } from "@lingui/macro";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";

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
    <Card className="w-full max-w-lg min-w-[400px] min-h-[520px] mx-auto mt-8 shadow-lg">
      <CardHeader>
        <CardTitle>
          <Trans>Crear usuario</Trans>
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              <Trans>Nombre de usuario</Trans>
            </label>
            <Input
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
              placeholder="Usuario"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              <Trans>Email</Trans>
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="usuario@email.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              <Trans>Contraseña</Trans>
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              placeholder="********"
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              <Trans>Rol</Trans>
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? <Trans>Creando...</Trans> : <Trans>Crear usuario</Trans>}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full mt-1"
            onClick={() => window.location.assign("/")}
            disabled={loading}
          >
            <Trans>Cancelar</Trans>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

CreateUserForm.defaultProps = {
  onSubmit: () => {},
  loading: false,
  error: "",
  success: "",
  initialValues: {},
};
