import { supabase } from "../../supabaseClient";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Sheet, SheetContent } from "../ui/sheet";
import CompanySheetForm from "./CompanySheetForm";
import { Search } from "lucide-react";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";

/**
 * CompanyAutocomplete: Autocompletado/buscador de empresas con opción de crear nueva.
 * Props:
 *   value: { companyName, companyGroupId }
 *   onChange: (companyObj) => void
 *   placeholder: string
 */
const CompanyAutocomplete = ({ value, onChange, placeholder }) => {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [createOption, setCreateOption] = useState(false);
  const [showSheet, setShowSheet] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setOptions([]);
      setCreateOption(false);
      return;
    }
    setLoading(true);
    supabase
      .from("CompanyGroups")
      .select("id, companyName")
      .ilike("companyName", `%${query}%`)
      .then(({ data }) => {
        setOptions(data || []);
        setCreateOption(
          !data?.some(
            (c) => c.companyName.toLowerCase() === query.toLowerCase()
          )
        );
      })
      .finally(() => setLoading(false));
  }, [query]);

  const handleSelect = (company) => {
    onChange({ companyName: company.companyName, companyGroupId: company.id });
    setShowDropdown(false);
    setQuery(company.companyName);
  };

  const handleCreate = () => {
    setShowSheet(true);
    // No llamar a onChange aquí, solo abrir el sheet
  };

  // Permitir limpiar el campo y volver a buscar/cambiar empresa
  const handleClear = () => {
    setQuery("");
    onChange({ companyName: "", companyGroupId: null });
    setShowDropdown(true);
  };

  // Si el usuario borra el campo, también borra la selección
  useEffect(() => {
    if (value?.companyName === "" && query !== "") {
      setQuery("");
    }
    if (value?.companyName && value.companyName !== query) {
      setQuery(value.companyName);
    }
  }, [value?.companyName, query]);

  // Si hay empresa seleccionada, el input sigue editable y muestra botón de limpiar
  return (
    <div className="relative">
      <Input
        type="text"
        value={
          typeof value?.companyName === "string" ? value.companyName : query
        }
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
          onChange({ companyName: e.target.value, companyGroupId: null });
        }}
        onFocus={() => setShowDropdown(true)}
        placeholder={placeholder}
        className="pr-10 bg-gray-50"
        autoComplete="off"
      />
      {/* Ícono de búsqueda */}
      <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </span>
      {/* Botón de limpiar */}
      {value?.companyName && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-8 flex items-center px-1 text-gray-400 hover:text-gray-700 focus:outline-none"
          tabIndex={-1}
          aria-label="Limpiar empresa"
        >
          ×
        </button>
      )}
      {showDropdown && (query.length > 1 || options.length > 0) && (
        <Card className="absolute z-50 w-full mt-1 shadow-lg">
          <CardContent className="p-0 divide-y divide-gray-100">
            {loading && <div className="p-2 text-sm">Buscando...</div>}
            {options.map((company) => (
              <Button
                key={company.id}
                type="button"
                variant="ghost"
                className="w-full justify-start rounded-none"
                onClick={() => handleSelect(company)}
              >
                {company.companyName}
              </Button>
            ))}
            {createOption && !loading && (
              <>
                <Separator />
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-start text-blue-600"
                  onClick={handleCreate}
                >
                  Crear nueva empresa: <b className="ml-1">{query}</b>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
      {/* Sheet para crear empresa */}
      <Sheet open={showSheet} onOpenChange={setShowSheet}>
        <SheetContent side="right" className="w-1/2 max-w-2xl">
          <CompanySheetForm
            open={showSheet}
            onClose={() => setShowSheet(false)}
            initialName={query}
            onSuccess={(empresa) => {
              setShowSheet(false);
              setShowDropdown(false);
              if (empresa && empresa.companyName) {
                onChange({
                  companyName: empresa.companyName,
                  companyGroupId: empresa.id,
                });
                setQuery(empresa.companyName);
              }
            }}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};

CompanyAutocomplete.propTypes = {
  value: PropTypes.shape({
    companyName: PropTypes.string,
    companyGroupId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    isNew: PropTypes.bool,
  }),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

export default CompanyAutocomplete;
