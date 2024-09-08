import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

function Modal({ isOpen, onClose, onSave, onDelete, event }) {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (event) {
      setTitle(event.title || "");
    }
  }, [event]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(title);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-5 rounded-lg shadow-xl w-96">
        <h2 className="text-2xl font-bold mb-4">
          {event && event.id ? "Editar Evento" : "Nuevo Evento"}
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título del evento"
            required
            className="w-full p-2 mb-4 border border-gray-300 rounded"
          />
          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Guardar
            </button>
            {event && event.id && (
              <button
                type="button"
                onClick={onDelete}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Eliminar
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
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
    title: PropTypes.string,
    start: PropTypes.string,
    end: PropTypes.string,
    allDay: PropTypes.bool,
  }),
};

export default Modal;
