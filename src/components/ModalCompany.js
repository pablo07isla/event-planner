import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const ModalCompany = ({ isOpen, onClose, onSave, companyData }) => {
  const [formData, setFormData] = useState({
    id: "",
    companyName: "",
    identificationType: "CC",
    identificationNumber: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    city: "",
  });
  const [error, setError] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

  useEffect(() => {
    if (isOpen) {
      if (companyData) {
        setFormData(companyData);
      } else {
        setFormData({
          id: "",
          companyName: "",
          identificationType: "CC",
          identificationNumber: "",
          contactPerson: "",
          phone: "",
          email: "",
          address: "",
          city: "",
        });
      }
      setError(null); // Limpiar el error cuando se abre el modal
    }
  }, [isOpen, companyData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSearch = async () => {
    if (!formData.identificationNumber) {
      setError("Por favor, ingrese un número de identificación para buscar.");
      return;
    }
    try {
      console.log("Buscando empresa con identificationNumber:", formData.identificationNumber);
      const response = await fetch(`${API_URL}/api/companies/search?identificationNumber=${encodeURIComponent(formData.identificationNumber)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
      }
      
      setSearchResult(data);
      setError(null);
    } catch (error) {
      console.error("Error al buscar la empresa:", error);
      setError(`Error al buscar la empresa: ${error.message}`);
      setSearchResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const result = await onSave(formData);
      if (typeof result === "string") {
        // Si onSave devuelve un string, es un mensaje de error
        setError(result);
      } else {
        handleClose();
      }
    } catch (error) {
      setError("Ocurrió un error al guardar la empresa.");
    }
  };

  const handleClose = () => {
    setError(null); // Limpiar el error al cerrar el modal
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-[9999]">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {formData.id ? "Editar Compañía" : "Nueva Compañía"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Campo de búsqueda */}
            <div className="col-span-2">
              <label
                htmlFor="identificationNumber"
                className="block mb-2 text-sm font-medium"
              >
                Buscar por Número de Identificación
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="identificationNumber"
                  name="identificationNumber"
                  value={formData.identificationNumber}
                  onChange={handleChange}
                  className="border rounded-l-lg p-2 flex-grow"
                  required
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="bg-blue-500 text-white rounded-r-lg px-4 py-2 hover:bg-blue-600"
                >
                  Buscar
                </button>
              </div>
            </div>

            {/* Mostrar resultado de búsqueda */}
            {searchResult && (
              <div className="col-span-2 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
                <p>Empresa encontrada:</p>
                <p>Nombre: {searchResult.companyName}</p>
                <p>Contacto: {searchResult.contactPerson}</p>
                <p>Teléfono: {searchResult.phone}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="companyName"
                className="block mb-2 text-sm font-medium"
              >
                Nombre de la Compañía
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="border rounded-lg p-2 w-full"
                required
              />
            </div>
            <div>
              <label
                htmlFor="identificationType"
                className="block mb-2 text-sm font-medium"
              >
                Tipo de Identificación
              </label>
              <select
                id="identificationType"
                name="identificationType"
                value={formData.identificationType}
                onChange={handleChange}
                className="border rounded-lg p-2 w-full"
                required
              >
                <option value="CC">CC</option>
                <option value="NIT">NIT</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="identificationNumber"
                className="block mb-2 text-sm font-medium"
              >
                Número de Identificación
              </label>
              <input
                type="text"
                id="identificationNumber"
                name="identificationNumber"
                value={formData.identificationNumber}
                onChange={handleChange}
                className="border rounded-lg p-2 w-full"
                required
              />
            </div>
            <div>
              <label
                htmlFor="contactPerson"
                className="block mb-2 text-sm font-medium"
              >
                Persona de Contacto
              </label>
              <input
                type="text"
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                className="border rounded-lg p-2 w-full"
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="block mb-2 text-sm font-medium">
                Teléfono
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="border rounded-lg p-2 w-full"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="border rounded-lg p-2 w-full"
                required
              />
            </div>
            <div>
              <label
                htmlFor="address"
                className="block mb-2 text-sm font-medium"
              >
                Dirección
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="border rounded-lg p-2 w-full"
                required
              />
            </div>
            <div>
              <label htmlFor="city" className="block mb-2 text-sm font-medium">
                Ciudad
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="border rounded-lg p-2 w-full"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
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
