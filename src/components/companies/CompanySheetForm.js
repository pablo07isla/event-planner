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
    // Optional address and city
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
      <SheetContent className="w-[500px] sm:w-[600px] flex flex-col pt-10 px-8">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold text-center text-primary">
            Crear Empresa / Grupo
          </SheetTitle>
        </SheetHeader>

        <form
          className="space-y-6 flex-1 overflow-y-auto p-2"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="companyName" className="font-semibold">
                  Nombre de la Empresa <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  className="mt-1.5"
                />
                {errors.companyName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.companyName}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="identificationType" className="font-semibold">
                  Tipo de Identificación <span className="text-red-500">*</span>
                </Label>
                <select
                  id="identificationType"
                  name="identificationType"
                  value={form.identificationType}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background mt-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="NIT">NIT</option>
                  <option value="CC">Cédula de Ciudadanía (CC)</option>
                  <option value="CE">Cédula de Extranjería (CE)</option>
                  <option value="PP">Pasaporte (PP)</option>
                </select>
                {errors.identificationType && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.identificationType}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="identificationNumber" className="font-semibold">
                  Número de Identificación{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="identificationNumber"
                  name="identificationNumber"
                  value={form.identificationNumber}
                  onChange={handleChange}
                  className="mt-1.5"
                />
                {errors.identificationNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.identificationNumber}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="contactPerson" className="font-semibold">
                  Persona de Contacto <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  value={form.contactPerson}
                  onChange={handleChange}
                  className="mt-1.5"
                />
                {errors.contactPerson && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.contactPerson}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="font-semibold">
                  Teléfono <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="mt-1.5"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="font-semibold">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="mt-1.5"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address" className="font-semibold">
                  Dirección
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Opcional"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="city" className="font-semibold">
                  Ciudad
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Opcional"
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {message && (
            <div
              className={`text-center text-sm font-medium p-2 rounded ${
                message.includes("exitosamente")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="px-6"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-6 bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
