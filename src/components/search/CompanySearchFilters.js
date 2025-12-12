import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Search } from "lucide-react";

const CompanySearchFilters = ({
  companySearchTerm,
  setCompanySearchTerm,
  companyIdType,
  setCompanyIdType,
  companyIdNumber,
  setCompanyIdNumber,
  handleCompanySearch,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nombre de Empresa</label>
          <Input
            type="text"
            value={companySearchTerm}
            onChange={(e) => setCompanySearchTerm(e.target.value)}
            placeholder="Buscar por nombre..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo de Identificación</label>
          <select
            value={companyIdType}
            onChange={(e) => setCompanyIdType(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            <option value="NIT">NIT</option>
            <option value="CC">CC</option>
            <option value="CE">CE</option>
            <option value="PP">PP</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">N° Identificación</label>
          <Input
            type="text"
            value={companyIdNumber}
            onChange={(e) => setCompanyIdNumber(e.target.value)}
            placeholder="Buscar por N°..."
          />
        </div>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleCompanySearch} className="w-full sm:w-auto">
          <Search className="h-5 w-5 mr-2" />
          Buscar Empresas
        </Button>
      </div>
    </div>
  );
};

export default CompanySearchFilters;
