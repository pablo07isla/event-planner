import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { Trans } from "@lingui/macro";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { z } from "zod";

const companySchema = z.object({
  companyName: z.string().min(1, "El nombre de la compañía es requerido"),
  identificationType: z.enum(["CC", "NIT", "CE", "PP"]),
  identificationNumber: z
    .string()
    .min(1, "El número de identificación es requerido"),
  contactPerson: z.string().min(1, "La persona de contacto es requerida"),
  phone: z
    .string()
    .min(1, "El teléfono es requerido")
    .regex(/^[0-9+ -]+$/, "Por favor ingrese solo números y símbolos válidos"),
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Por favor ingrese un email válido"),
  address: z.string().min(1, "La dirección es requerida"),
  city: z.string().min(1, "La ciudad es requerida"),
});

const ModalCompany = ({ isOpen, onClose, onSave, companyData, useSheet }) => {
  const initialFormState = useMemo(
    () => ({
      id: "",
      companyName: "",
      identificationType: "CC", // Valor por defecto
      identificationNumber: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      city: "",
    }),
    [],
  );

  const [formData, setFormData] = useState(initialFormState);
  const [notification, setNotification] = useState({
    message: null,
    type: null,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [zodErrors, setZodErrors] = useState({});

  // Función para verificar si un campo tiene error
  const hasFieldError = useCallback(
    (fieldName) => {
      return (
        zodErrors[fieldName] || (touched[fieldName] && !formData[fieldName])
      );
    },
    [zodErrors, touched, formData],
  );

  // Función para obtener el mensaje de error de un campo
  const getFieldErrorMessage = useCallback(
    (fieldName) => {
      if (zodErrors[fieldName]) {
        return zodErrors[fieldName];
      }
      if (touched[fieldName] && !formData[fieldName]) {
        const messages = {
          companyName: "El nombre de la compañía es requerido",
          identificationNumber: "El número de identificación es requerido",
          contactPerson: "La persona de contacto es requerida",
          phone: "El teléfono es requerido",
          email: "El email es requerido",
          address: "La dirección es requerida",
          city: "La ciudad es requerida",
        };
        return messages[fieldName] || "Este campo es requerido";
      }
      return null;
    },
    [zodErrors, touched, formData],
  );
  // Declarar resetForm primero
  const resetForm = useCallback(() => {
    setFormData({ ...initialFormState }); // Usar spread para crear nueva referencia
    setIsCreating(false);
    setTouched({});
    setZodErrors({});
  }, [initialFormState]);

  // Declarar handleClose después de resetForm
  const handleClose = useCallback(() => {
    setNotification({ message: null, type: null });
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (companyData) {
        // Asegurar que todos los campos tienen valores
        setFormData({
          ...initialFormState,
          ...companyData,
        });
        setIsCreating(false);
      } else {
        setFormData({ ...initialFormState });
        setIsCreating(true);
      }
      setNotification({ message: null, type: null });
      setTouched({});
      setZodErrors({});
    }
  }, [isOpen, companyData, initialFormState]);
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({ ...prevData, [name]: value }));
      setTouched((prev) => ({ ...prev, [name]: true }));

      // Limpiar error de Zod para este campo si existe
      if (zodErrors[name]) {
        setZodErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [zodErrors],
  );

  const handleSelectChange = useCallback(
    (value, name) => {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
      setTouched((prev) => ({ ...prev, [name]: true }));

      // Limpiar error de Zod para este campo si existe
      if (zodErrors[name]) {
        setZodErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [zodErrors],
  );

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setNotification({ message: null, type: null });
      setZodErrors({});

      console.log("🔍 Iniciando proceso de guardado con datos:", formData);

      // Crear un objeto limpio para la validación
      const dataToValidate = {
        companyName: formData.companyName || "",
        identificationType: formData.identificationType || "CC",
        identificationNumber: formData.identificationNumber || "",
        contactPerson: formData.contactPerson || "",
        phone: formData.phone || "",
        email: formData.email || "",
        address: formData.address || "",
        city: formData.city || "",
      };

      console.log("🔍 Datos a validar:", dataToValidate);

      try {
        const validatedData = companySchema.parse(dataToValidate);
        console.log("✅ Datos validados correctamente:", validatedData);
      } catch (err) {
        console.log("❌ Error de validación Zod:", err);
        if (err.errors) {
          const errors = {};
          err.errors.forEach((zodErr) => {
            errors[zodErr.path[0]] = zodErr.message;
          });
          setZodErrors(errors);
          setTouched((prev) => {
            const newTouched = { ...prev };
            Object.keys(errors).forEach((key) => {
              newTouched[key] = true;
            });
            return newTouched;
          });
        }
        return;
      }

      setIsLoading(true);
      try {
        const action = !formData.id ? "create" : "edit";
        console.log(`🚀 Llamando onSave con acción: ${action}`);
        console.log("📤 Datos enviados:", { ...formData, ...dataToValidate });

        // Usar los datos validados para el guardado
        const companyToSave = { ...formData, ...dataToValidate };
        if (!companyToSave.id) {
          delete companyToSave.id;
        }
        const result = await onSave(companyToSave, action);
        console.log("📥 Resultado de onSave:", result);

        if (typeof result === "string") {
          console.log("❌ Error devuelto por onSave:", result);
          setNotification({ message: result, type: "error" });
        } else if (
          result === false ||
          result === null ||
          result === undefined
        ) {
          console.log("❌ onSave devolvió un valor falsy:", result);
          setNotification({
            message:
              "Error: La función de guardado no devolvió un resultado válido",
            type: "error",
          });
        } else {
          console.log("✅ Guardado exitoso");
          setNotification({
            message: `Empresa ${
              !formData.id ? "creada" : "actualizada"
            } exitosamente`,
            type: "success",
          });
          setTimeout(() => {
            handleClose();
          }, 1500);
        }
      } catch (error) {
        console.error("💥 Error en handleSubmit:", error);
        setNotification({
          message: `Ocurrió un error al guardar la empresa: ${
            error.message || error
          }`,
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [formData, onSave, handleClose],
  );

  if (!isOpen) return null;

  // Debug: Mostrar el estado actual del formulario
  console.log("🔧 Estado actual del formulario:", formData);

  // Renderizar el formulario (común para ambos casos)
  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {notification.message && (
        <Alert
          variant={
            notification.type === "error"
              ? "destructive"
              : notification.type === "info"
                ? "default"
                : "success"
          }
        >
          <AlertTitle>
            {notification.type === "error" && <Trans>Error</Trans>}
            {notification.type === "info" && <Trans>Información</Trans>}
            {notification.type === "success" && <Trans>Éxito</Trans>}
          </AlertTitle>
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="companyName">
              <Trans>Nombre de la Compañía*</Trans>
            </Label>
            <Input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName || ""} // Asegurar que nunca sea undefined
              onChange={handleChange}
              onBlur={handleBlur}
              className={hasFieldError("companyName") ? "border-red-500" : ""}
            />
            {getFieldErrorMessage("companyName") && (
              <p className="text-sm text-red-600">
                {getFieldErrorMessage("companyName")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="identificationType">
              <Trans>Tipo de Identificación*</Trans>
            </Label>
            <Select
              value={formData.identificationType || "CC"} // Asegurar valor por defecto
              onValueChange={(value) => {
                handleSelectChange(value, "identificationType");
              }}
              name="identificationType"
            >
              <SelectTrigger
                id="identificationType"
                className={
                  hasFieldError("identificationType")
                    ? "border-red-500 w-full"
                    : "w-full"
                }
              >
                <SelectValue placeholder="Seleccione un tipo" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[12000]">
                <SelectItem value="CC">Cédula de Ciudadanía (CC)</SelectItem>
                <SelectItem value="NIT">NIT</SelectItem>
                <SelectItem value="CE">Cédula de Extranjería (CE)</SelectItem>
                <SelectItem value="PP">Pasaporte (PP)</SelectItem>
              </SelectContent>
            </Select>
            {getFieldErrorMessage("identificationType") && (
              <p className="text-sm text-red-600">
                {getFieldErrorMessage("identificationType")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="identificationNumber">
              <Trans>Número de Identificación*</Trans>
            </Label>
            <Input
              type="text"
              id="identificationNumber"
              name="identificationNumber"
              value={formData.identificationNumber || ""} // Asegurar que nunca sea undefined
              onChange={handleChange}
              onBlur={handleBlur}
              className={
                hasFieldError("identificationNumber") ? "border-red-500" : ""
              }
            />
            {getFieldErrorMessage("identificationNumber") && (
              <p className="text-sm text-red-600">
                {getFieldErrorMessage("identificationNumber")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPerson">
              <Trans>Persona de Contacto*</Trans>
            </Label>
            <Input
              type="text"
              id="contactPerson"
              name="contactPerson"
              value={formData.contactPerson || ""} // Asegurar que nunca sea undefined
              onChange={handleChange}
              onBlur={handleBlur}
              className={hasFieldError("contactPerson") ? "border-red-500" : ""}
            />
            {getFieldErrorMessage("contactPerson") && (
              <p className="text-sm text-red-600">
                {getFieldErrorMessage("contactPerson")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              <Trans>Teléfono*</Trans>
            </Label>
            <Input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone || ""} // Asegurar que nunca sea undefined
              onChange={handleChange}
              onBlur={handleBlur}
              className={hasFieldError("phone") ? "border-red-500" : ""}
            />
            {getFieldErrorMessage("phone") && (
              <p className="text-sm text-red-600">
                {getFieldErrorMessage("phone")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              <Trans>Email*</Trans>
            </Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email || ""} // Asegurar que nunca sea undefined
              onChange={handleChange}
              onBlur={handleBlur}
              className={hasFieldError("email") ? "border-red-500" : ""}
            />
            {getFieldErrorMessage("email") && (
              <p className="text-sm text-red-600">
                {getFieldErrorMessage("email")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              <Trans>Dirección*</Trans>
            </Label>
            <Input
              type="text"
              id="address"
              name="address"
              value={formData.address || ""} // Asegurar que nunca sea undefined
              onChange={handleChange}
              onBlur={handleBlur}
              className={hasFieldError("address") ? "border-red-500" : ""}
            />
            {getFieldErrorMessage("address") && (
              <p className="text-sm text-red-600">
                {getFieldErrorMessage("address")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">
              <Trans>Ciudad*</Trans>
            </Label>
            <Input
              type="text"
              id="city"
              name="city"
              value={formData.city || ""} // Asegurar que nunca sea undefined
              onChange={handleChange}
              onBlur={handleBlur}
              className={hasFieldError("city") ? "border-red-500" : ""}
            />
            {getFieldErrorMessage("city") && (
              <p className="text-sm text-red-600">
                {getFieldErrorMessage("city")}
              </p>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
          <Button
            type="button"
            onClick={handleClose}
            variant="outline"
            className="w-full sm:w-auto min-h-[44px]"
          >
            <Trans>Cancelar</Trans>
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            variant="default"
            className="w-full sm:w-auto min-h-[44px]"
          >
            {isLoading && (
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
            )}
            {isCreating ? <Trans>Crear</Trans> : <Trans>Guardar</Trans>}
          </Button>
        </div>
      </div>
    </form>
  );

  // Si se usa en Sheet, no mostrar Dialog, solo el contenido del formulario
  if (useSheet) {
    return (
      <div className="p-4 sm:p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          Crear Empresa / Grupo / Persona
        </h2>
        {renderForm()}
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto z-[9999]">
        <DialogHeader>
          <DialogTitle>
            {formData.id ? (
              <Trans>Editar Compañía</Trans>
            ) : (
              <Trans>Nueva Compañía</Trans>
            )}
          </DialogTitle>
        </DialogHeader>
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
};

ModalCompany.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  companyData: PropTypes.object,
  useSheet: PropTypes.bool,
};

export default ModalCompany;
