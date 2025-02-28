import { supabase } from "../supabaseClient";
import CompanyInfo from "./CompanyInfo";
import { PlusCircleIcon, XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";

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
    <div className="fixed inset-0 bg-gray-800 bg-opacity-70 overflow-y-auto h-full w-full flex items-center justify-center z-[9999]" 
         role="dialog" 
         aria-modal="true" 
         aria-labelledby="modal-title">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 id="modal-title" className="text-2xl font-bold text-gray-800">
            {formData.id ? "Editar Compañía" : "Nueva Compañía"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors"
            aria-label="Cerrar"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {notification.message && (
            <div
              className={`flex items-center px-4 py-3 rounded relative ${
                notification.type === "error"
                  ? "bg-red-100 border-l-4 border-red-500 text-red-700"
                  : notification.type === "info"
                  ? "bg-blue-100 border-l-4 border-blue-500 text-blue-700"
                  : "bg-green-100 border-l-4 border-green-500 text-green-700"
              }`}
              role="alert"
            >
              <strong className="font-bold mr-2">
                {notification.type === "error" && "Error: "}
                {notification.type === "info" && "Información: "}
                {notification.type === "success" && "Éxito: "}
              </strong>
              <span className="block sm:inline">{notification.message}</span>
            </div>
          )}

          {/* Campo de búsqueda */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label
              htmlFor="searchIdentificationNumber"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Buscar por Número de Identificación
            </label>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <input
                  type="text"
                  id="searchIdentificationNumber"
                  name="identificationNumber"
                  value={formData.identificationNumber}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg pl-3 pr-10 py-2.5 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  aria-label="Número de identificación"
                  placeholder="Ingrese número de identificación"
                />
              </div>
              <button
                type="button"
                onClick={handleSearch}
                disabled={isLoading}
                className={`bg-blue-600 text-white rounded-lg px-4 py-2.5 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                aria-label="Buscar empresa"
              >
                {isLoading ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2" />
                ) : (
                  <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                )}
                Buscar
              </button>
            </div>
          </div>

          {/* Opción para Crear Nueva Empresa/Grupo/Persona */}
          <div className="border-t border-b py-4">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsFormVisible(true);
                setIsCreating(true);
              }}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:underline transition-colors"
              aria-label="Crear nueva empresa"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Crear nueva Empresa/Grupo/Persona
            </button>
          </div>

          {/* Mostrar resultado de búsqueda */}
          {searchResult && !isFormVisible && (
            <div className="mt-4 border rounded-lg p-4 bg-blue-50">
              <CompanyInfo company={searchResult} onAdd={handleAddCompany} />
            </div>
          )}

          {/* Mostrar el formulario solo si isFormVisible es true */}
          {isFormVisible && (
            <div className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="companyName"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Nombre de la Compañía*
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`border rounded-lg p-2.5 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      touched.companyName && !formData.companyName
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    required
                    aria-required="true"
                    aria-invalid={touched.companyName && !formData.companyName}
                    aria-describedby={
                      touched.companyName && !formData.companyName
                        ? "companyName-error"
                        : undefined
                    }
                  />
                  {touched.companyName && !formData.companyName && (
                    <p
                      id="companyName-error"
                      className="mt-1 text-sm text-red-600"
                    >
                      El nombre de la compañía es requerido
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="identificationType"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Tipo de Identificación*
                  </label>
                  <select
                    id="identificationType"
                    name="identificationType"
                    value={formData.identificationType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    aria-required="true"
                  >
                    <option value="CC">Cédula de Ciudadanía (CC)</option>
                    <option value="NIT">NIT</option>
                    <option value="CE">Cédula de Extranjería (CE)</option>
                    <option value="PP">Pasaporte (PP)</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="identificationNumber"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Número de Identificación*
                  </label>
                  <input
                    type="text"
                    id="identificationNumber"
                    name="identificationNumber"
                    value={formData.identificationNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`border rounded-lg p-2.5 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      touched.identificationNumber && !formData.identificationNumber
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    required
                    aria-required="true"
                    aria-invalid={touched.identificationNumber && !formData.identificationNumber}
                  />
                  {touched.identificationNumber && !formData.identificationNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      El número de identificación es requerido
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contactPerson"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Persona de Contacto*
                  </label>
                  <input
                    type="text"
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`border rounded-lg p-2.5 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      touched.contactPerson && !formData.contactPerson
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    required
                    aria-required="true"
                  />
                  {touched.contactPerson && !formData.contactPerson && (
                    <p className="mt-1 text-sm text-red-600">
                      La persona de contacto es requerida
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Teléfono*
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`border rounded-lg p-2.5 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      touched.phone && (!formData.phone || getFieldError("phone"))
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    required
                    aria-required="true"
                    aria-invalid={touched.phone && (!formData.phone || getFieldError("phone"))}
                  />
                  {touched.phone && getFieldError("phone") && (
                    <p className="mt-1 text-sm text-red-600">
                      {getFieldError("phone")}
                    </p>
                  )}
                  {touched.phone && !formData.phone && !getFieldError("phone") && (
                    <p className="mt-1 text-sm text-red-600">
                      El teléfono es requerido
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Email*
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`border rounded-lg p-2.5 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      touched.email && (!formData.email || getFieldError("email"))
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    required
                    aria-required="true"
                    aria-invalid={touched.email && (!formData.email || getFieldError("email"))}
                  />
                  {touched.email && getFieldError("email") && (
                    <p className="mt-1 text-sm text-red-600">
                      {getFieldError("email")}
                    </p>
                  )}
                  {touched.email && !formData.email && !getFieldError("email") && (
                    <p className="mt-1 text-sm text-red-600">
                      El email es requerido
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Dirección*
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`border rounded-lg p-2.5 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      touched.address && !formData.address
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    required
                    aria-required="true"
                  />
                  {touched.address && !formData.address && (
                    <p className="mt-1 text-sm text-red-600">
                      La dirección es requerida
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Ciudad*
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`border rounded-lg p-2.5 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      touched.city && !formData.city
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    required
                    aria-required="true"
                  />
                  {touched.city && !formData.city && (
                    <p className="mt-1 text-sm text-red-600">
                      La ciudad es requerida
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 mt-6 border-t">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading && (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2" />
                  )}
                  {isCreating ? "Crear" : "Guardar"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

ModalCompany.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  companyData: PropTypes.object,
};

export default ModalCompany;