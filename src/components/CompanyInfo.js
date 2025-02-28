// EventsCalendar/event-planner/src/components/CompanyInfo.js
import React from "react";
import PropTypes from "prop-types";
import { PlusCircleIcon, PhoneIcon, UserIcon, BuildingOfficeIcon, EnvelopeIcon, MapPinIcon } from "@heroicons/react/24/outline";

const CompanyInfo = ({ company, onAdd }) => {
  return (
    <div className="relative bg-blue-50 border border-blue-400 rounded-lg shadow-sm p-5 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          Información de la Empresa
        </h3>
        <button
          onClick={() => onAdd(company)}
          className="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full transition-colors p-1"
          title="Agregar esta empresa al formulario"
          aria-label="Agregar empresa"
        >
          <PlusCircleIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex items-start space-x-2">
          <BuildingOfficeIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-600">Nombre:</span>
            <span className="text-base text-gray-800 font-medium">{company.companyName}</span>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <UserIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-600">Contacto:</span>
            <span className="text-base text-gray-800">{company.contactPerson}</span>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <PhoneIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-600">Teléfono:</span>
            <span className="text-base text-gray-800">{company.phone}</span>
          </div>
        </div>

        {company.email && (
          <div className="flex items-start space-x-2">
            <EnvelopeIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-600">Email:</span>
              <span className="text-base text-gray-800">{company.email}</span>
            </div>
          </div>
        )}

        {company.address && (
          <div className="flex items-start space-x-2">
            <MapPinIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-600">Dirección:</span>
              <span className="text-base text-gray-800">{company.address}</span>
              {company.city && <span className="text-sm text-gray-700">{company.city}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

CompanyInfo.propTypes = {
  company: PropTypes.shape({
    companyName: PropTypes.string.isRequired,
    contactPerson: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    email: PropTypes.string,
    address: PropTypes.string,
    city: PropTypes.string
  }).isRequired,
  onAdd: PropTypes.func.isRequired,
};

export default CompanyInfo;