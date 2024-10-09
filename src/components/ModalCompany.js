import React, { useState, useContext } from "react";
import PropTypes from "prop-types";
import axios from "axios";

import { useNavigate } from "react-router-dom";

const ModalCompany = ({ isOpen, onClose, onSave }) => {
  const [companyData, setCompanyData] = useState({
    companyName: "",
    identificationType: "CC",
    identificationNumber: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    city: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(companyData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-[9999]">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Nueva Compañía</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
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
                value={companyData.companyName}
                onChange={(e) =>
                  setCompanyData({
                    ...companyData,
                    companyName: e.target.value,
                  })
                }
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
                value={companyData.identificationType}
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
                value={companyData.identificationNumber}
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
                value={companyData.contactPerson}
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
                value={companyData.phone}
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
                value={companyData.email}
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
                value={companyData.address}
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
                value={companyData.city}
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
              onClick={onClose}
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
};

export default ModalCompany;
