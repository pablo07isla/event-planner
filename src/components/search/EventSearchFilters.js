import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Calendar as CalendarUI } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar, Search, Building } from "lucide-react";
import { cn } from "../../lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const EventSearchFilters = ({
  searchMode,
  setSearchMode,
  searchTerm,
  setSearchTerm,
  companyId,
  setCompanyId,
  singleDate,
  setSingleDate,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  handleSearch,
}) => {
  const [singleDatePopoverOpen, setSingleDatePopoverOpen] = useState(false);
  const [startDatePopoverOpen, setStartDatePopoverOpen] = useState(false);
  const [endDatePopoverOpen, setEndDatePopoverOpen] = useState(false);

  const formatButtonDate = (date) => {
    return format(date, "PPP", { locale: es });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button
          variant={searchMode === "company" ? "default" : "outline"}
          onClick={() => {
            setSearchMode("company");
            setSearchTerm("");
          }}
          className="flex items-center"
        >
          <Building className="h-4 w-4 mr-2" />
          Por Empresa
        </Button>
        <Button
          variant={searchMode === "singleDate" ? "default" : "outline"}
          onClick={() => {
            setSearchMode("singleDate");
            setStartDate(null);
            setEndDate(null);
          }}
          className="flex items-center"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Fecha Específica
        </Button>
        <Button
          variant={searchMode === "dateRange" ? "default" : "outline"}
          onClick={() => {
            setSearchMode("dateRange");
            setSingleDate(null);
          }}
          className="flex items-center"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Rango de Fechas
        </Button>
      </div>

      {searchMode === "company" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre de Empresa</label>
            <div className="relative">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre..."
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              N° Identificación de Empresa
            </label>
            <div className="relative">
              <Input
                type="text"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                placeholder="Buscar por N° identificación..."
                className="pl-10"
              />
            </div>
          </div>
        </div>
      )}

      {searchMode === "singleDate" && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Fecha del Evento</label>
          <div>
            <Popover
              open={singleDatePopoverOpen}
              onOpenChange={setSingleDatePopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !singleDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {singleDate
                    ? formatButtonDate(singleDate)
                    : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarUI
                  mode="single"
                  selected={singleDate}
                  onSelect={(date) => {
                    setSingleDate(date);
                    setSingleDatePopoverOpen(false);
                  }}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {searchMode === "dateRange" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Desde</label>
            <div>
              <Popover
                open={startDatePopoverOpen}
                onOpenChange={setStartDatePopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? formatButtonDate(startDate) : "Fecha inicio"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarUI
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      setStartDatePopoverOpen(false);
                    }}
                    initialFocus
                    disabled={(date) => endDate && date > endDate}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Hasta</label>
            <div>
              <Popover
                open={endDatePopoverOpen}
                onOpenChange={setEndDatePopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? formatButtonDate(endDate) : "Fecha fin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarUI
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      setEndDatePopoverOpen(false);
                    }}
                    initialFocus
                    disabled={(date) => startDate && date < startDate}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center mt-6">
        <Button onClick={handleSearch} className="w-full sm:w-auto">
          <Search className="h-5 w-5 mr-2" />
          Buscar
        </Button>
      </div>
    </div>
  );
};

export default EventSearchFilters;
