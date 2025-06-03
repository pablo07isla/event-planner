// EventsCalendar/event-planner/src/components/CompanyInfo.js

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Plus, Phone, User, Building, Mail, MapPin } from "lucide-react";
import PropTypes from "prop-types";
import React from "react";

const CompanyInfo = ({ company, onAdd }) => {
  return (
    <Card className="bg-blue-50 border-blue-200 transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
        <CardTitle className="text-xl font-semibold text-gray-800">
          Información de la Empresa
        </CardTitle>
        <Button
          onClick={() => onAdd(company)}
          variant="ghost"
          size="icon"
          className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
          title="Agregar esta empresa al formulario"
          aria-label="Agregar empresa"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <Building className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Nombre:</span>
              <span className="text-sm font-medium text-gray-900">
                {company.companyName}
              </span>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <User className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">
                Contacto:
              </span>
              <span className="text-sm text-gray-700">
                {company.contactPerson}
              </span>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Phone className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">
                Teléfono:
              </span>
              <span className="text-sm text-gray-700">{company.phone}</span>
            </div>
          </div>

          {company.email && (
            <div className="flex items-start space-x-3">
              <Mail className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">
                  Email:
                </span>
                <span className="text-sm text-gray-700">{company.email}</span>
              </div>
            </div>
          )}

          {company.address && (
            <div className="flex items-start space-x-3">
              <MapPin className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">
                  Dirección:
                </span>
                <span className="text-sm text-gray-700">{company.address}</span>
                {company.city && (
                  <Badge
                    variant="outline"
                    className="mt-1 text-xs font-normal bg-blue-50"
                  >
                    {company.city}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

CompanyInfo.propTypes = {
  company: PropTypes.shape({
    companyName: PropTypes.string.isRequired,
    contactPerson: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    email: PropTypes.string,
    address: PropTypes.string,
    city: PropTypes.string,
  }).isRequired,
  onAdd: PropTypes.func.isRequired,
};

export default CompanyInfo;
