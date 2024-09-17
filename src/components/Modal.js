import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

function Modal({ isOpen, onClose, onSave, onDelete, event }) {
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    companyName: "",
    peopleCount: "",
    contactName: "",
    foodPackage: "",
    contactPhone: "",
    email: "", // New field for email
    eventLocation: "",
    eventDescription: "",
    deposit: "",
    pendingBalance: "",
    attachments: null,
    eventStatus: "", // New field for event status
  });

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        startDate: event.start
          ? new Date(event.start).toISOString().substr(0, 16)
          : "",
        endDate: event.end
          ? new Date(event.end).toISOString().substr(0, 16)
          : "",

        eventStatus: event.eventStatus || "", // Initialize event status
        email: event.email || "", // Initialize email
      });
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleMoneyChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/\D/g, "");
    const formattedValue = Number(numericValue).toLocaleString("es-CO");
    setFormData((prevState) => ({
      ...prevState,
      [name]: formattedValue,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            {event && event.id ? "Editar Evento" : "Nuevo Evento"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition duration-150 ease-in-out"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="w-full">
              <label
                htmlFor="startDate"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Fecha Inicio
              </label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Fecha Inicio"
                required
              />
            </div>
            <div>
              <label
                htmlFor="companyName"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Nombre Empresa/Grupo
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Nombre Empresa/Grupo"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="contactName"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Nombre Responsable/Contacto
              </label>
              <input
                type="text"
                id="contactName"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Nombre Responsable/Contacto"
                required
              />
            </div>
            <div>
              <label
                htmlFor="peopleCount"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                N° de personas
              </label>
              <input
                type="number"
                id="peopleCount"
                name="peopleCount"
                value={formData.peopleCount}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="N° Personas"
                required
              />
            </div>

            <div>
              <label
                htmlFor="foodPackage"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Paquete de alimentación
              </label>
              <input
                type="text"
                id="foodPackage"
                name="foodPackage"
                value={formData.foodPackage}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Nombre Responsable/Contacto"
              />
            </div>
            <div>
              <label
                htmlFor="contactPhone"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Teléfono de Contacto
              </label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Teléfono de Contacto"
                required
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Email"
                required
              />
            </div>
            <div>
              <label
                htmlFor="eventLocation"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Lugar del Evento
              </label>
              <input
                type="text"
                id="eventLocation"
                name="eventLocation"
                value={formData.eventLocation}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Lugar del Evento"
                required
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="eventDescription"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Descripción del Evento
            </label>
            <textarea
              id="eventDescription"
              name="eventDescription"
              value={formData.eventDescription}
              onChange={handleChange}
              rows="5"
              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              placeholder="Descripcion del Evento"
            ></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="deposit"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Consignación/Abono
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="text"
                  id="deposit"
                  name="deposit"
                  value={formData.deposit}
                  onChange={handleMoneyChange}
                  className="pl-7 pr-12 block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="pendingBalance"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Saldo Pendiente
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="text"
                  id="pendingBalance"
                  name="pendingBalance"
                  value={formData.pendingBalance}
                  onChange={handleMoneyChange}
                  className="pl-7 pr-12 block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="eventStatus"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Estado del Evento
              </label>
              <select
                id="eventStatus"
                name="eventStatus"
                value={formData.eventStatus}
                onChange={handleChange}
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                required
              >
                <option selected="">Seleccione un estado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Con Abono">Con Abono</option>
                <option value="Pago Total">Pago Total</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="attachments"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Adjuntar archivos
              </label>
              <input
                type="file"
                id="attachments"
                name="attachments"
                onChange={handleChange}
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg  focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm"
            >
              Guardar
            </button>
            {event && event.id && (
              <button
                type="button"
                onClick={onDelete}
                className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm"
              >
                Eliminar
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  event: PropTypes.shape({
    id: PropTypes.string,
    start: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    end: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    companyName: PropTypes.string,
    peopleCount: PropTypes.string,
    contactName: PropTypes.string,
    foodPackage: PropTypes.string,
    contactPhone: PropTypes.string,
    email: PropTypes.string, // Add email to PropTypes
    eventLocation: PropTypes.string,
    eventDescription: PropTypes.string,
    deposit: PropTypes.string,
    pendingBalance: PropTypes.string,
    eventStatus: PropTypes.string,
  }),
};

export default Modal;
