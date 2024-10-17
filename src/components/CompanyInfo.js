// EventsCalendar/event-planner/src/components/CompanyInfo.js
import React from "react";
import PropTypes from "prop-types";
import { PlusCircleIcon } from "@heroicons/react/24/solid";

const CompanyInfo = ({ company, onAdd }) => {
  return (
    <div className="relative bg-blue-50 border border-blue-400 text-blue-700 px-4 py-4 rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold mb-3">Información de la Empresa</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-600">Nombre:</span>
          <span className="text-base text-gray-800">{company.companyName}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-600">Contacto:</span>
          <span className="text-base text-gray-800">{company.contactPerson}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-600">Teléfono:</span>
          <span className="text-base text-gray-800">{company.phone}</span>
        </div>
        
      </div>
      
      {/* Icono de "+" para agregar la empresa */}
      <button
        onClick={() => onAdd(company)}
        className="absolute top-4 right-4 text-blue-600 hover:text-blue-800 focus:outline-none"
        title="Agregar esta empresa al formulario"
      >
        <PlusCircleIcon className="h-6 w-6" />
      </button>
    </div>
  );
};

CompanyInfo.propTypes = {
  company: PropTypes.object.isRequired,
  onAdd: PropTypes.func.isRequired,
};

export default CompanyInfo;