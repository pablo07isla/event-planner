import { supabase } from "../../supabaseClient";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import React, { useState, useEffect } from "react";

const initialForm = {
  companyName: "",
  account_type: "Empresa", // Default
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
      // 1. Insertar en CompanyGroups
      const companyData = {
        companyName: form.companyName,
        identificationType: form.identificationType,
        identificationNumber: form.identificationNumber,
        account_type: form.account_type,
        address: form.address,
        city: form.city,
        // Legacy support (optional, keep populated if columns exist)
        contactPerson: form.contactPerson,
        phone: form.phone,
        email: form.email,
      };

      const { data: newCompany, error: companyError } = await supabase
        .from("CompanyGroups")
        .insert([companyData])
        .select()
        .single(); // Use single() to get the object directly

      if (companyError) {
        if (
          companyError.code === "23505" &&
          companyError.message.includes("identification_number_key")
        ) {
          throw new Error(
            `Ya existe una empresa con el número de identificación ${form.identificationNumber}`,
          );
        }
        if (companyError.code === "23505") {
          throw new Error(
            "Ya existe una empresa con estos datos. Verifica la información.",
          );
        }
        throw companyError;
      }

      // 2. Insertar Contacto Principal en CompanyContacts
      if (newCompany && newCompany.id) {
        const contactData = {
          company_id: newCompany.id,
          full_name: form.contactPerson,
          phone: form.phone,
          email: form.email,
          is_primary: true,
          job_title: "Contacto Principal", // Default
        };

        const { error: contactError } = await supabase
          .from("CompanyContacts")
          .insert([contactData]);

        if (contactError) {
          console.error("Error creando contacto inicial:", contactError);
          // Non-blocking error, but good to know
        }
      }

      setMessage("Entidad creada exitosamente");
      setForm(initialForm);
      if (onSuccess) onSuccess(newCompany);
      setTimeout(() => {
        setMessage(null);
        onClose && onClose();
      }, 1200);
    } catch (err) {
      console.error("Error al guardar:", err);
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
      <SheetContent className="w-full sm:w-[600px] flex flex-col pt-10 px-4 sm:px-8">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="account_type" className="font-semibold">
                  Tipo de Cuenta <span className="text-red-500">*</span>
                </Label>
                <select
                  id="account_type"
                  name="account_type"
                  value={form.account_type}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background mt-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mb-4"
                >
                  <option value="Empresa">Empresa</option>
                  <option value="Persona">Persona</option>
                  <option value="Grupo Social">Grupo Social</option>
                </select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="companyName" className="font-semibold">
                  Nombre (Razón Social / Nombre Completo){" "}
                  <span className="text-red-500">*</span>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-6 min-h-[44px]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 bg-indigo-600 hover:bg-indigo-700 min-h-[44px]"
            >
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
