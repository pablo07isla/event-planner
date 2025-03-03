import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { format, parseISO } from "date-fns";
import { Calendar, Search, Building, Eye, Hash, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ModalEvent from "./Modal";
import Sidebar from "./Sidebar";

const SearchEvents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [singleDate, setSingleDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [searchMode, setSearchMode] = useState("company");
  const navigate = useNavigate();

  // Cargar la lista de empresas al iniciar
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data, error } = await supabase
          .from("CompanyGroups")
          .select("id, identificationNumber, companyName")
          .order("companyName");
        
        if (error) throw error;
        setCompanies(data || []);
      } catch (err) {
        console.error("Error al cargar empresas:", err);
        setError("No se pudieron cargar las empresas");
      }
    };

    fetchCompanies();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setSearchResults([]);

    try {
      // Modificamos la consulta para usar la relación específica
      let query = supabase.from("events").select("*");

      // Filtrar por nombre de empresa
      if (searchTerm) {
        query = query.ilike("companyName", `%${searchTerm}%`);
      }

      // Filtrar por número de identificación de empresa
      if (companyId) {
        // Primero, buscar las empresas que coinciden con el número de identificación
        const { data: matchingCompanies, error: companyError } = await supabase
          .from("CompanyGroups")
          .select("id")
          .ilike("identificationNumber", `%${companyId}%`);
        
        if (companyError) throw companyError;
        
        if (matchingCompanies && matchingCompanies.length > 0) {
          // Obtener los IDs de las empresas que coinciden
          const companyIds = matchingCompanies.map(company => company.id);
          // Filtrar eventos por esos IDs de empresa
          query = query.in("companyGroupId", companyIds);
        } else {
          // Si no hay coincidencias, devolver un conjunto vacío
          setSearchResults([]);
          setLoading(false);
          return;
        }
      }

      // Filtrar por empresa seleccionada
      if (selectedCompany) {
        query = query.eq("companyGroupId", selectedCompany);
      }

      // Filtrar por fecha única (solo eventos en esa fecha)
      if (singleDate && searchMode === "singleDate") {
        // Corregir el problema de zona horaria para fecha única
        const dateOnly = singleDate.split('T')[0]; // Asegurarnos de tener solo la fecha
        
        // Crear fechas en UTC para evitar problemas de zona horaria
        const startOfDay = new Date(`${dateOnly}T00:00:00.000Z`);
        const endOfDay = new Date(`${dateOnly}T23:59:59.999Z`);
        
        console.log("Fecha de búsqueda:", dateOnly);
        console.log("Inicio del día (UTC):", startOfDay.toISOString());
        console.log("Fin del día (UTC):", endOfDay.toISOString());
        
        // Usar formato ISO8601 con offset local para la búsqueda
        query = query.gte("start", startOfDay.toISOString())
                     .lt("start", endOfDay.toISOString());
      }
      
      // Filtrar por rango de fechas (solo considerando fecha de inicio)
      if (startDate && endDate && searchMode === "dateRange") {
        // Corregir el problema de zona horaria para rango de fechas
        const startDateOnly = startDate.split('T')[0];
        const endDateOnly = endDate.split('T')[0];
        
        // Crear fechas en UTC para evitar problemas de zona horaria
        const startOfStartDate = new Date(`${startDateOnly}T00:00:00.000Z`);
        const endOfEndDate = new Date(`${endDateOnly}T23:59:59.999Z`);
        
        console.log("Rango de fechas:", startDateOnly, "a", endDateOnly);
        console.log("Inicio del rango (UTC):", startOfStartDate.toISOString());
        console.log("Fin del rango (UTC):", endOfEndDate.toISOString());
        
        query = query.gte("start", startOfStartDate.toISOString())
                     .lt("start", endOfEndDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Si necesitamos información de la empresa, hacemos una segunda consulta
      if (data && data.length > 0) {
        // Obtener los IDs de empresa únicos
        const companyGroupIds = [...new Set(data.filter(event => event.companyGroupId).map(event => event.companyGroupId))];
        
        if (companyGroupIds.length > 0) {
          // Obtener información de las empresas
          const { data: companyData, error: companyError } = await supabase
            .from("CompanyGroups")
            .select("id, companyName, identificationNumber")
            .in("id", companyGroupIds);
          
          if (companyError) throw companyError;
          
          // Crear un mapa para acceso rápido
          const companyMap = {};
          companyData.forEach(company => {
            companyMap[company.id] = company;
          });
          
          // Enriquecer los resultados con información de la empresa
          data.forEach(event => {
            if (event.companyGroupId && companyMap[event.companyGroupId]) {
              event.companyInfo = companyMap[event.companyGroupId];
            }
          });
        }
      }
      
      setSearchResults(data || []);
      console.log("Resultados de búsqueda:", data);
    } catch (err) {
      console.error("Error en la búsqueda:", err);
      setError(`Error al realizar la búsqueda: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewEvent = (event) => {
    // Procesar los attachments
    let attachments = [];
    try {
      if (event.attachments) {
        if (typeof event.attachments === 'string') {
          attachments = JSON.parse(event.attachments);
        } else if (Array.isArray(event.attachments)) {
          attachments = event.attachments;
        }
      }
    } catch (e) {
      console.error("Error processing attachments:", e);
      attachments = [];
    }

    // Formatear las fechas
    const start = parseISO(event.start);
    const end = parseISO(event.end);

    // Preparar el evento para el modal
    setCurrentEvent({
      id: event.id,
      start: format(start, "yyyy-MM-dd'T'HH:mm"),
      end: format(end, "yyyy-MM-dd'T'HH:mm"),
      allDay: true,
      companyName: event.companyName || "",
      peopleCount: event.peopleCount || "",
      contactName: event.contactName || "",
      foodPackage: Array.isArray(event.foodPackage) ? event.foodPackage : [],
      contactPhone: event.contactPhone || "",
      email: event.email || "",
      eventLocation: event.eventLocation || "",
      eventDescription: event.eventDescription || "",
      deposit: event.deposit || "",
      pendingAmount: event.pendingAmount || "",
      attachments: attachments,
      eventStatus: event.eventStatus || "Pendiente",
      lastModified: event.lastModified || "",
      lastModifiedBy: event.lastModifiedBy || "",
      companyGroupId: event.companyGroupId || null,
    });
    
    setModalOpen(true);
  };

  const handleSaveEvent = async (formData) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("user"));

      // Convertir foodPackage a un array de PostgreSQL
      const foodPackageArray = formData.get("foodPackage") ? formData.get("foodPackage").split(',') : [];
      const foodPackagePostgres = `{${foodPackageArray.map(item => `"${item}"`).join(',')}}`;

      // Parsear los archivos adjuntos y asegurarse de que sea un array válido
      let attachments = [];
      try {
        const attachmentsStr = formData.get("attachments");
        if (attachmentsStr) {
          attachments = JSON.parse(attachmentsStr);
          attachments = attachments.map(attachment => ({
            name: attachment.name,
            url: attachment.url,
            path: attachment.path
          }));
        }
      } catch (e) {
        console.error("Error parsing attachments:", e);
        attachments = [];
      }

      // Manejar campos numéricos
      const deposit = formData.get("deposit");
      const pendingAmount = formData.get("pendingAmount");
      const peopleCount = formData.get("peopleCount");

      const eventData = {
        start: new Date(formData.get("startDate")).toISOString(),
        end: new Date(formData.get("endDate")).toISOString(),
        companyName: formData.get("companyName"),
        peopleCount: peopleCount ? parseInt(peopleCount, 10) || 0 : 0,
        contactName: formData.get("contactName"),
        foodPackage: foodPackagePostgres,
        contactPhone: formData.get("contactPhone"),
        email: formData.get("email"),
        eventLocation: formData.get("eventLocation"),
        eventDescription: formData.get("eventDescription"),
        deposit: deposit ? parseFloat(deposit.replace(/[^\d.-]/g, '')) || 0 : 0,
        pendingAmount: pendingAmount ? parseFloat(pendingAmount.replace(/[^\d.-]/g, '')) || 0 : 0,
        eventStatus: formData.get("eventStatus"),
        lastModified: new Date().toISOString(),
        lastModifiedBy: currentUser ? currentUser.username : "Usuario desconocido",
        companyGroupId: formData.get("companyGroupId"),
        attachments: attachments
      };

      console.log("Saving event with data:", eventData);

      let response;
      if (formData.get("id")) {
        const { data, error } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", formData.get("id"))
          .select();
        if (error) throw error;
        response = { data };
      } else {
        const { data, error } = await supabase
          .from("events")
          .insert([eventData])
          .select();
        if (error) throw error;
        response = { data };
      }

      if (!response.data || response.data.length === 0) {
        throw new Error("No se recibieron datos después de guardar el evento");
      }

      // Después de guardar, actualizar la lista de resultados
      await handleSearch();
      
      // Cerrar el modal
      setModalOpen(false);
    } catch (err) {
      console.error("Error detallado al guardar el evento:", err);
      setError(`Error al guardar el evento: ${err.message}`);
    }
  };

  const handleDeleteEvent = async () => {
    try {
      if (currentEvent && currentEvent.id) {
        await supabase.from("events").delete().eq("id", currentEvent.id);
        
        // Actualizar la lista de resultados
        setSearchResults(prevResults => 
          prevResults.filter(event => event.id !== currentEvent.id)
        );
        
        // Cerrar el modal
        setModalOpen(false);
      }
    } catch (err) {
      console.error("Error al eliminar el evento:", err);
      setError("Error al eliminar el evento. Por favor, inténtelo de nuevo.");
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm");
    } catch (error) {
      return "Fecha inválida";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendiente':
        return {
          bg: 'bg-amber-100',
          text: 'text-amber-800',
          dot: 'bg-amber-500'
        };
      case 'Con Abono':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          dot: 'bg-blue-500'
        };
      case 'Pago Total':
        return {
          bg: 'bg-emerald-100',
          text: 'text-emerald-800',
          dot: 'bg-emerald-500'
        };
      default:
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          dot: 'bg-red-500'
        };
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Contenido principal */}
      <div className="flex-1 p-6 lg:p-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-800 mb-2">Búsqueda de Eventos</h1>
          <p className="text-gray-600">Encuentra y gestiona eventos por empresa o fecha</p>
        </header>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 transition-all duration-300 hover:shadow-md">
          <div className="mb-8">
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={() => setSearchMode("company")}
                className={`flex items-center px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  searchMode === "company" 
                    ? "bg-indigo-600 text-white shadow-md" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Building className="h-4 w-4 mr-2" />
                Por Empresa
              </button>
              <button
                onClick={() => {
                  setSearchMode("singleDate");
                  setStartDate("");
                  setEndDate("");
                }}
                className={`flex items-center px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  searchMode === "singleDate" 
                    ? "bg-indigo-600 text-white shadow-md" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Fecha Específica
              </button>
              <button
                onClick={() => {
                  setSearchMode("dateRange");
                  setSingleDate("");
                }}
                className={`flex items-center px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  searchMode === "dateRange" 
                    ? "bg-indigo-600 text-white shadow-md" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Rango de Fechas
              </button>
            </div>

            {searchMode === "company" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Búsqueda por nombre de empresa */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre de Empresa
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por nombre..."
                      className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                    <Building className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
                  </div>
                </div>
                
                {/* Búsqueda por número de identificación */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    N° Identificación de Empresa
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={companyId}
                      onChange={(e) => setCompanyId(e.target.value)}
                      placeholder="Buscar por N° identificación..."
                      className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                    <Hash className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
                  </div>
                </div>
              </div>
            )}

            {searchMode === "singleDate" && (
              <div className="max-w-md mx-auto md:mx-0 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Fecha del Evento
                </label>
                <div className="relative group">
                  <input
                    type="date"
                    value={singleDate}
                    onChange={(e) => setSingleDate(e.target.value)}
                    className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                  <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
                </div>
              </div>
            )}

            {searchMode === "dateRange" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fecha de inicio */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha Inicio
                  </label>
                  <div className="relative group">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                    <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
                  </div>
                </div>
                
                {/* Fecha de fin */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha Fin
                  </label>
                  <div className="relative group">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                    <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={handleSearch}
              className="flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              <Search className="h-5 w-5 mr-2" />
              Buscar
            </button>
          </div>
        </div>
        
        {loading && (
          <div className="flex justify-center items-center my-12">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-indigo-500 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-indigo-700 font-medium">
                <span className="animate-pulse">...</span>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-5 rounded-lg my-8 animate-fadeIn shadow-sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}
        
        {searchResults.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md animate-fadeIn">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Fecha Inicio
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Fecha Fin
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {searchResults.map((event) => {
                    const statusColors = getStatusColor(event.eventStatus);
                    return (
                      <tr 
                        key={event.id} 
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{event.companyName}</div>
                          <div className="text-xs text-gray-500 mt-1 flex items-center">
                            <span className="flex items-center justify-center bg-indigo-50 text-indigo-700 rounded-full h-5 w-5 mr-1">
                              <span className="text-xs">{event.peopleCount}</span>
                            </span>
                            personas
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{event.contactName}</div>
                          <div className="text-xs text-gray-500 mt-1">{event.contactPhone}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(event.start)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(event.end)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${statusColors.dot} mr-1.5`}></span>
                            {event.eventStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <button
                            onClick={() => handleViewEvent(event)}
                            className="flex items-center text-indigo-600 hover:text-indigo-900 transition-colors duration-200 group"
                          >
                            <Eye className="h-4 w-4 mr-1.5 group-hover:scale-110 transition-transform duration-200" />
                            <span className="group-hover:underline">Ver detalles</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center transition-all duration-300 hover:shadow-md animate-fadeIn">
            <div className="max-w-md mx-auto">
              <div className="rounded-full bg-gray-100 h-16 w-16 flex items-center justify-center mx-auto mb-5">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay resultados que mostrar</h3>
              <p className="text-gray-500">
                {searchResults.length === 0 && (singleDate || startDate || endDate || searchTerm || companyId)
                  ? "No se encontraron eventos que coincidan con tu búsqueda. Intenta con otros criterios."
                  : "Utiliza los filtros para buscar eventos por empresa o fecha."}
              </p>
            </div>
          </div>
        )}

        {/* Modal para ver/editar evento */}
        <ModalEvent
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          event={currentEvent}
        />
      </div>
    </div>
  );
};

export default SearchEvents;