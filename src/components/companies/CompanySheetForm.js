import { supabase } from "../../supabaseClient";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import React, { useState, useEffect } from "react";

const initialForm = {
  companyName: "",
  identificationType: "NIT",
  identificationNumber: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  city: "",
};

export default function CompanySheetForm({
  open,
  onClose,
  onSuccess,
  initialName,
}) {
  const [form, setForm] = useState({
    ...initialForm,
    companyName: initialName || "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const validate = () => {
    const newErrors = {};
    if (!form.companyName) newErrors.companyName = "Requerido";
    if (!form.identificationType) newErrors.identificationType = "Requerido";
    if (!form.identificationNumber)
      newErrors.identificationNumber = "Requerido";
    if (!form.contactPerson) newErrors.contactPerson = "Requerido";
    if (!form.phone) newErrors.phone = "Requerido";
    if (!form.email) newErrors.email = "Requerido";
    if (!form.address) newErrors.address = "Requerido";
    if (!form.city) newErrors.city = "Requerido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Limpiar error si existe
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (!validate()) return;
    setLoading(true);
    try {
      // No enviar id vacío
      const { data, error } = await supabase
        .from("CompanyGroups")
        .insert([{ ...form }])
        .select();
      if (error) throw error;
      setMessage("Empresa creada exitosamente");
      setForm(initialForm);
      if (onSuccess) onSuccess(data[0]);
      setTimeout(() => {
        setMessage(null);
        onClose && onClose();
      }, 1200);
    } catch (err) {
      setMessage(err.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  // Si initialName cambia y el formulario está vacío, actualizar el nombre
  useEffect(() => {
    if (open && initialName && !form.companyName) {
      setForm((prev) => ({ ...prev, companyName: initialName }));
    }
  }, [initialName, open, form.companyName]);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-1/2 max-w-2xl min-w-[400px] flex flex-col items-center justify-start pt-8 z-[100] !overflow-visible">
        <SheetHeader className="w-full">
          <SheetTitle className="text-3xl font-bold text-gray-900 mb-6">
            Crear Empresa / Grupo
          </SheetTitle>
        </SheetHeader>
        <form className="w-full max-w-2xl space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="companyName">Nombre de la Empresa*</Label>
              <Input
                id="companyName"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
              />
              {errors.companyName && (
                <p className="text-red-500 text-xs">{errors.companyName}</p>
              )}
            </div>
            <div>
              <Label htmlFor="identificationType">
                Tipo de Identificación*
              </Label>
              <select
                id="identificationType"
                name="identificationType"
                value={form.identificationType}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Seleccione tipo de identificación</option>
                <option value="NIT">NIT</option>
                <option value="CC">Cédula de Ciudadanía (CC)</option>
                <option value="CE">Cédula de Extranjería (CE)</option>
                <option value="PP">Pasaporte (PP)</option>
              </select>
              {errors.identificationType && (
                <p className="text-red-500 text-xs">
                  {errors.identificationType}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="identificationNumber">
                Número de Identificación*
              </Label>
              <Input
                id="identificationNumber"
                name="identificationNumber"
                value={form.identificationNumber}
                onChange={handleChange}
              />
              {errors.identificationNumber && (
                <p className="text-red-500 text-xs">
                  {errors.identificationNumber}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="contactPerson">Persona de Contacto*</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={form.contactPerson}
                onChange={handleChange}
              />
              {errors.contactPerson && (
                <p className="text-red-500 text-xs">{errors.contactPerson}</p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Teléfono*</Label>
              <Input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs">{errors.phone}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email*</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email}</p>
              )}
            </div>
            <div>
              <Label htmlFor="address">Dirección*</Label>
              <Input
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
              />
              {errors.address && (
                <p className="text-red-500 text-xs">{errors.address}</p>
              )}
            </div>
            <div>
              <Label htmlFor="city">Ciudad*</Label>
              <Input
                id="city"
                name="city"
                value={form.city}
                onChange={handleChange}
              />
              {errors.city && (
                <p className="text-red-500 text-xs">{errors.city}</p>
              )}
            </div>
          </div>
          <Separator />
          {message && (
            <div
              className={`text-center text-sm ${
                message.includes("exitosamente")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {message}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
