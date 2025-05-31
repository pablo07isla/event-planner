import { supabase } from "../supabaseClient";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import React, { useState } from "react";

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

export default function CompanySheetForm({ open, onClose, onSuccess }) {
  const [form, setForm] = useState(initialForm);
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
  };

  const handleSelect = (value) => {
    setForm({ ...form, identificationType: value });
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

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="max-w-md w-full">
        <SheetHeader>
          <SheetTitle>Crear Empresa / Grupo</SheetTitle>
        </SheetHeader>
        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="companyName">Nombre de la Empresa*</Label>
            <Input
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
            />
            {errors.companyName && (
              <p className="text-red-500 text-xs">{errors.companyName}</p>
            )}
          </div>
          <div>
            <Label htmlFor="identificationType">Tipo de Identificación*</Label>
            <Select
              value={form.identificationType}
              onValueChange={handleSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NIT">NIT</SelectItem>
                <SelectItem value="CC">Cédula de Ciudadanía (CC)</SelectItem>
                <SelectItem value="CE">Cédula de Extranjería (CE)</SelectItem>
                <SelectItem value="PP">Pasaporte (PP)</SelectItem>
              </SelectContent>
            </Select>
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
            <Input name="phone" value={form.phone} onChange={handleChange} />
            {errors.phone && (
              <p className="text-red-500 text-xs">{errors.phone}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email*</Label>
            <Input name="email" value={form.email} onChange={handleChange} />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email}</p>
            )}
          </div>
          <div>
            <Label htmlFor="address">Dirección*</Label>
            <Input
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
            <Input name="city" value={form.city} onChange={handleChange} />
            {errors.city && (
              <p className="text-red-500 text-xs">{errors.city}</p>
            )}
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
          <div className="flex justify-end gap-2">
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
