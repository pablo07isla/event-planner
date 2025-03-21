import { supabase } from "../supabaseClient";
import CompanyInfo from "./CompanyInfo";
import { PlusCircle, Search } from "lucide-react";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";

// Importando componentes de shadcn/ui
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
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
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";

const ModalCompany = ({ isOpen, onClose, onSave, companyData }) => {
  const initialFormState = {
    id: "",
    companyName: "",
    identificationType: "CC",
    identificationNumber: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    city: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [notification, setNotification] = useState({
    message: null,
    type: null, // "error", "info", "success"
  });
  const [searchResult, setSearchResult] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({});

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (companyData) {
        setFormData(companyData);
        setIsFormVisible(true);
        setIsCreating(false);
      } else {
        resetForm();
      }
      setNotification({ message: null, type: null });
      setSearchResult(null);
      setTouched({});
    }
  }, [isOpen, companyData]);

  const resetForm = useCallback(() => {
    setFormData(initialFormState);
    setIsFormVisible(false);
    setIsCreating(false);
    setTouched({});
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const handleSelectChange = useCallback((value, name) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const validateField = useCallback((name, value) => {
    switch (name) {
      case "email":
        return value && !/\S+@\S+\.\S+/.test(value)
          ? "Por favor ingrese un email válido"
          : null;
      case "phone":
        return value && !/^[0-9+ -]+$/.test(value)
          ? "Por favor ingrese solo números y símbolos válidos"
          : null;
      default:
        return null;
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!formData.identificationNumber) {
      setNotification({
        message: "Por favor, ingrese un número de identificación para buscar.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("CompanyGroups")
        .select("*")
        .eq("identificationNumber", formData.identificationNumber)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No se encontró la empresa
          setNotification({
            message: "La empresa no existe en nuestra base de datos.",
            type: "info",
          });
          setSearchResult(null);
        } else {
          throw error;
        }
      } else {
        setSearchResult(data);
        setNotification({ message: null, type: null });
      }
    } catch (error) {
      console.error("Error al buscar la empresa:", error);
      setNotification({
        message: `Error al buscar la empresa: ${error.message}`,
        type: "error",
      });
      setSearchResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [formData.identificationNumber]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const errors = {};
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) errors[key] = error;
    });
    
    // If there are errors, mark all fields as touched and don't submit
    if (Object.keys(errors).length > 0) {
      const allTouched = {};
      Object.keys(formData).forEach(key => {
        allTouched[key] = true;
      });
      setTouched(allTouched);
      return;
    }
    
    setNotification({ message: null, type: null });
    setIsLoading(true);
    
    try {
      let result;

      if (isCreating) {
        result = await onSave(formData, "create");
      } else {
        result = await onSave(formData, "edit");
      }

      if (typeof result === "string") {
        setNotification({ message: result, type: "error" });
      } else {
        setNotification({ 
          message: `Empresa ${isCreating ? 'creada' : 'actualizada'} exitosamente`,
          type: "success" 
        });
        setTimeout(() => {
          handleClose();
        }, 1500);
      }
    } catch (error) {
      setNotification({
        message: "Ocurrió un error al guardar la empresa.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData, isCreating, onSave, validateField]);

  const handleClose = useCallback(() => {
    setNotification({ message: null, type: null });
    setSearchResult(null);
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleAddCompany = useCallback((company) => {
    setFormData({
      ...initialFormState,
      ...company
    });
    setSearchResult(null);
    setNotification({ message: null, type: null });
    setIsFormVisible(true);
    setIsCreating(false);
  }, [initialFormState]);

  const getFieldError = useCallback((fieldName) => {
    if (!touched[fieldName]) return null;
    return validateField(fieldName, formData[fieldName]);
  }, [formData, touched, validateField]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} >
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto z-[9999]">
        <DialogHeader>
          <DialogTitle>
            {formData.id ? "Editar Compañía" : "Nueva Compañía"}
          </DialogTitle>
        </DialogHeader>

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
                {notification.type === "error" && "Error"}
                {notification.type === "info" && "Información"}
                {notification.type === "success" && "Éxito"}
              </AlertTitle>
              <AlertDescription>{notification.message}</AlertDescription>
            </Alert>
          )}

          {/* Campo de búsqueda */}
          <Card className="bg-muted/40">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="searchIdentificationNumber">
                  Buscar por Número de Identificación
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    id="searchIdentificationNumber"
                    name="identificationNumber"
                    value={formData.identificationNumber}
                    onChange={handleChange}
                    className="flex-grow"
                    placeholder="Ingrese número de identificación"
                  />
                  <Button 
                    type="button" 
                    onClick={handleSearch} 
                    disabled={isLoading}
                    variant="default"
                  >
                    {isLoading ? (
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                    ) : (
                      <Search className="mr-2 h-4 w-4" />
                    )}
                    Buscar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opción para Crear Nueva Empresa/Grupo/Persona */}
          <div className="py-2">
            <Separator className="my-2" />
            <Button
              type="button"
              onClick={() => {
                resetForm();
                setIsFormVisible(true);
                setIsCreating(true);
              }}
              variant="link"
              className="p-0 h-auto text-primary font-medium"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Crear nueva Empresa/Grupo/Persona
            </Button>
            <Separator className="my-2" />
          </div>

          {/* Mostrar resultado de búsqueda */}
          {searchResult && !isFormVisible && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <CompanyInfo company={searchResult} onAdd={handleAddCompany} />
              </CardContent>
            </Card>
          )}

          {/* Mostrar el formulario solo si isFormVisible es true */}
          {isFormVisible && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    Nombre de la Compañía*
                  </Label>
                  <Input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.companyName && !formData.companyName ? "border-red-500" : ""}
                    required
                  />
                  {touched.companyName && !formData.companyName && (
                    <p className="text-sm text-red-600">
                      El nombre de la compañía es requerido
                    </p>
                  )}
                </div>

                
<div className="space-y-2">
  <Label htmlFor="identificationType">
    Tipo de Identificación*
  </Label>
  <Select 
    defaultValue={formData.identificationType} 
    onValueChange={(value) => handleSelectChange(value, "identificationType")}
    name="identificationType"
  >
    <SelectTrigger id="identificationType" className="w-full">
      <SelectValue placeholder="Seleccione un tipo" />
    </SelectTrigger>
    <SelectContent position="popper" className="z-[9999]">
      <SelectItem value="CC">Cédula de Ciudadanía (CC)</SelectItem>
      <SelectItem value="NIT">NIT</SelectItem>
      <SelectItem value="CE">Cédula de Extranjería (CE)</SelectItem>
      <SelectItem value="PP">Pasaporte (PP)</SelectItem>
    </SelectContent>
  </Select>
</div>

                <div className="space-y-2">
                  <Label htmlFor="identificationNumber">
                    Número de Identificación*
                  </Label>
                  <Input
                    type="text"
                    id="identificationNumber"
                    name="identificationNumber"
                    value={formData.identificationNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.identificationNumber && !formData.identificationNumber ? "border-red-500" : ""}
                    required
                  />
                  {touched.identificationNumber && !formData.identificationNumber && (
                    <p className="text-sm text-red-600">
                      El número de identificación es requerido
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPerson">
                    Persona de Contacto*
                  </Label>
                  <Input
                    type="text"
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.contactPerson && !formData.contactPerson ? "border-red-500" : ""}
                    required
                  />
                  {touched.contactPerson && !formData.contactPerson && (
                    <p className="text-sm text-red-600">
                      La persona de contacto es requerida
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Teléfono*
                  </Label>
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.phone && (!formData.phone || getFieldError("phone")) ? "border-red-500" : ""}
                    required
                  />
                  {touched.phone && getFieldError("phone") && (
                    <p className="text-sm text-red-600">
                      {getFieldError("phone")}
                    </p>
                  )}
                  {touched.phone && !formData.phone && !getFieldError("phone") && (
                    <p className="text-sm text-red-600">
                      El teléfono es requerido
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email*
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.email && (!formData.email || getFieldError("email")) ? "border-red-500" : ""}
                    required
                  />
                  {touched.email && getFieldError("email") && (
                    <p className="text-sm text-red-600">
                      {getFieldError("email")}
                    </p>
                  )}
                  {touched.email && !formData.email && !getFieldError("email") && (
                    <p className="text-sm text-red-600">
                      El email es requerido
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">
                    Dirección*
                  </Label>
                  <Input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.address && !formData.address ? "border-red-500" : ""}
                    required
                  />
                  {touched.address && !formData.address && (
                    <p className="text-sm text-red-600">
                      La dirección es requerida
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">
                    Ciudad*
                  </Label>
                  <Input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.city && !formData.city ? "border-red-500" : ""}
                    required
                  />
                  {touched.city && !formData.city && (
                    <p className="text-sm text-red-600">
                      La ciudad es requerida
                    </p>
                  )}
                </div>
              </div>

              <Separator className="my-4" />

              <DialogFooter>
                <Button
                  type="button"
                  onClick={handleClose}
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  variant="default"
                >
                  {isLoading && (
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                  )}
                  {isCreating ? "Crear" : "Guardar"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

ModalCompany.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  companyData: PropTypes.object,
};

export default ModalCompany;