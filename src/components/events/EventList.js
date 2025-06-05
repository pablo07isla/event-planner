import EventListPDF from "./EventListPDF";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PropTypes from "prop-types";
import React, { useState, useEffect, useMemo } from "react";
import {
  FaMapMarkerAlt,
  FaUsers,
  FaPhoneAlt,
  FaMoneyBillWave,
  FaUtensils,
  FaFilePdf,
  FaCalendarAlt,
} from "react-icons/fa";

// Constants
const EVENTS_PER_PAGE = 2;

// Utility functions
const formatDate = (dateString) => {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "0";
  const numericValue = Number(value);
  if (isNaN(numericValue)) return "0";

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericValue);
};

// Sub-components
const EventCard = ({ event }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
    {/* Encabezado */}
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 flex justify-between items-center">
      <h3 className="text-xl font-bold w-full">
        {event.extendedProps?.companyName || "Evento sin nombre"}
      </h3>
      <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold ml-2 flex-shrink-0">
        {event.extendedProps?.peopleCount || "N/A"} pax
      </span>
    </div>

    {/* Cuerpo del Card */}
    <div className="mt-3 p-3">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Columna Izquierda */}
        <div>
          <DetailItem
            Icon={FaMapMarkerAlt}
            label="Lugar"
            value={event.extendedProps?.eventLocation || "No especificado"}
            iconColor="text-blue-500"
          />
          <DetailItem
            Icon={FaUsers}
            label="Responsable"
            value={event.extendedProps?.contactName || "N/A"}
            iconColor="text-blue-500"
          />
          <DetailItem
            Icon={FaPhoneAlt}
            label="Teléfonos"
            value={event.extendedProps?.contactPhone || "N/A"}
            iconColor="text-blue-500"
          />
        </div>

        {/* Columna Derecha */}
        <div>
          <DetailItem
            Icon={FaMoneyBillWave}
            label="Consignación"
            value={formatCurrency(event.extendedProps.deposit)}
            iconColor="text-green-500"
          />
          <DetailItem
            Icon={FaMoneyBillWave}
            label="Saldo Pendiente"
            value={formatCurrency(event.extendedProps.pendingAmount)}
            iconColor="text-red-500"
          />
          <DetailItem
            Icon={FaUtensils}
            label="Alimentación"
            value={
              (event.extendedProps?.foodPackage || []).join(", ") ||
              "No especificado"
            }
            iconColor="text-blue-500"
          />
        </div>
      </div>

      {/* Sección de Descripción */}
      <div className="mt-2 pt-4 border-t border-gray-200">
        <h4 className="text-lg font-semibold text-gray-700 mb-2">
          Descripción
        </h4>
        <div className="text-gray-600">
          {event.extendedProps?.eventDescription ? (
            event.extendedProps.eventDescription
              .split("\n")
              .map((line, index) => (
                <p key={index} className="mb-1">
                  {line}
                </p>
              ))
          ) : (
            <p className="italic">No hay descripción disponible</p>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Componente auxiliar para mostrar detalles con ícono
const DetailItem = ({ Icon, label, value, iconColor = "text-gray-500" }) => (
  <div className="flex items-center mb-3">
    <Icon className={`${iconColor} mr-3 text-xl flex-shrink-0`} />
    <div>
      <span className="font-semibold text-gray-700 mr-2">{label}:</span>
      <span className="text-gray-600">{value}</span>
    </div>
  </div>
);

EventCard.propTypes = {
  event: PropTypes.object.isRequired,
};

// Main component
const EventList = ({ events, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Event processing logic
  const processEvents = useMemo(() => {
    // Sort all events by date
    const sortedEvents = [...events].sort(
      (a, b) => new Date(a.start) - new Date(b.start)
    );

    // Create paginated array
    const pages = [];
    for (let i = 0; i < sortedEvents.length; i += EVENTS_PER_PAGE) {
      pages.push(sortedEvents.slice(i, i + EVENTS_PER_PAGE));
    }

    // Group events for the current page by date
    const groupEventsByDate = (eventsToGroup) => {
      const grouped = {};

      eventsToGroup.forEach((event) => {
        const dateString = new Date(event.start).toISOString().split("T")[0];
        if (!grouped[dateString]) {
          grouped[dateString] = [];
        }
        grouped[dateString].push(event);
      });

      return grouped;
    };

    return {
      pages,
      total: pages.length,
      getGroupedEvents: (pageIdx) => {
        const pageEvents = pages[pageIdx] || [];
        return groupEventsByDate(pageEvents);
      },
    };
  }, [events]);

  // Set total pages when events change
  useEffect(() => {
    setTotalPages(processEvents.total);
  }, [processEvents.total]);

  // Get events for current page, grouped by date
  const currentGroupedEvents = useMemo(() => {
    return processEvents.getGroupedEvents(currentPage - 1);
  }, [processEvents, currentPage]);

  // Get sorted dates for current page
  const sortedDates = useMemo(() => {
    return Object.keys(currentGroupedEvents).sort(
      (a, b) => new Date(a) - new Date(b)
    );
  }, [currentGroupedEvents]);

  // Handler para cerrar el modal después de descargar el PDF
  const handlePDFDownload = (e) => {
    // Espera un pequeño tiempo para asegurar la descarga
    setTimeout(() => {
      if (typeof onClose === "function") {
        onClose();
      }
    }, 1000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {/* Encabezado y Botón de PDF */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Lista de Eventos</h1>
        <PDFDownloadLink
          document={<EventListPDF events={events} />}
          fileName="reporte_eventos.pdf"
        >
          {({ loading, url }) => (
            <button
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300 disabled:opacity-50"
              disabled={loading}
              onClick={handlePDFDownload}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generando PDF...
                </>
              ) : (
                <>
                  <FaFilePdf className="mr-2" />
                  Descargar PDF
                </>
              )}
            </button>
          )}
        </PDFDownloadLink>
      </div>

      {/* Lista de Eventos */}
      <div className="space-y-6">
        {sortedDates.length > 0 ? (
          sortedDates.map((date) => (
            <div
              key={date}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center">
                <FaCalendarAlt className="mr-4 text-xl" />
                <h2 className="text-xl font-semibold">{formatDate(date)}</h2>
              </div>
              <div className="p-4 space-y-4">
                {currentGroupedEvents[date].map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div
            className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative"
            role="alert"
          >
            No hay eventos para mostrar en esta página.
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-white text-gray-700 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
          >
            Primera
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-white text-gray-700 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
          >
            Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-2 rounded-lg ${
                i + 1 === currentPage
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-white text-gray-700 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
          >
            Siguiente
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-white text-gray-700 border rounded-lg disabled:opacity-50 hover:bg-gray-100"
          >
            Última
          </button>
        </div>
      )}
    </div>
  );
};

EventList.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string,
      start: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
        .isRequired,
      extendedProps: PropTypes.shape({
        peopleCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        contactName: PropTypes.string,
        contactPhone: PropTypes.string,
        eventLocation: PropTypes.string,
        deposit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        pendingAmount: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),
        eventDescription: PropTypes.string,
        foodPackage: PropTypes.arrayOf(PropTypes.string),
        companyName: PropTypes.string,
      }),
    })
  ).isRequired,
};

export default EventList;
