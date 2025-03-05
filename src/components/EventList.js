import React, { useState, useRef, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  FaMapMarkerAlt,
  FaUsers,
  FaPhoneAlt,
  FaMoneyBillWave,
  FaUtensils,
  FaFilePdf,
  FaCalendarAlt
} from "react-icons/fa";
import { Button, Pagination, Card, Alert, Badge, Spinner } from "react-bootstrap";

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
      <div className="mt-3 p-4">
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
              value={(event.extendedProps?.foodPackage || []).join(", ") || "No especificado"} 
              iconColor="text-blue-500"
            />
          </div>
        </div>

        {/* Sección de Descripción */}
        <div className="mt-2 pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">Descripción</h4>
          <div className="text-gray-600">
            {event.extendedProps?.eventDescription 
              ? event.extendedProps.eventDescription.split('\n').map((line, index) => (
                <p key={index} className="mb-1">{line}</p>
              ))
              : <p className="italic">No hay descripción disponible</p>
            }
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
  event: PropTypes.object.isRequired
};

// Main component
const EventList = ({ events }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const eventListRef = useRef();
  const [pdfState, setPdfState] = useState({
    isGenerating: false,
    error: null
  });

  // PDF Generation with improved error handling
  const generatePDF = async () => {
    try {
      setPdfState({ isGenerating: true, error: null });
      const pdf = new jsPDF();
      let currentPDFPage = 1;
      const originalPage = currentPage;
      
      for (let page = 1; page <= totalPages; page++) {
        setCurrentPage(page);
        // Wait for React to update the DOM
        await new Promise(resolve => setTimeout(resolve, 300));
  
        const input = eventListRef.current;
        
        // Create a clean copy for capturing
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.width = '800px'; // Fixed width for PDF
        tempContainer.style.background = 'white';
        tempContainer.appendChild(input.cloneNode(true));
        document.body.appendChild(tempContainer);
  
        try {
          const canvas = await html2canvas(tempContainer.firstChild, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#FFFFFF',
            logging: false,
          });
          
          const imgData = canvas.toDataURL("image/png");
          
          if (currentPDFPage > 1) pdf.addPage();
          pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
          
          currentPDFPage++;
        } finally {
          // Always clean up the DOM
          document.body.removeChild(tempContainer);
        }
      }
  
      // Restore the original page
      setCurrentPage(originalPage);
      pdf.save("reporte_eventos.pdf");
    } catch (error) {
      console.error('Error generando PDF:', error);
      setPdfState({
        isGenerating: false,
        error: "Error al generar el PDF. Por favor, intenta nuevamente."
      });
      return;
    }
    
    setPdfState({ isGenerating: false, error: null });
  };

  // Event processing logic
  const processEvents = useMemo(() => {
    // Sort all events by date
    const sortedEvents = [...events].sort((a, b) => new Date(a.start) - new Date(b.start));
    
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
      }
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
    return Object.keys(currentGroupedEvents).sort((a, b) => new Date(a) - new Date(b));
  }, [currentGroupedEvents]);

  return (
    <div className="w-full">
      {pdfState.error && (
        <Alert variant="danger" dismissible onClose={() => setPdfState(prev => ({ ...prev, error: null }))}>
          {pdfState.error}
        </Alert>
      )}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
                  Lista de Eventos
        </h2>
        <Button
          onClick={generatePDF}
          variant="primary"
          className="d-flex align-items-center"
          disabled={pdfState.isGenerating}
        >
          {pdfState.isGenerating ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Generando PDF...
            </>
          ) : (
            <>
              <FaFilePdf className="me-2" />
              Descargar PDF
            </>
          )}
        </Button>
      </div>

      <div ref={eventListRef} className="bg-white p-4 shadow-sm rounded w-full">
        {sortedDates.length > 0 ? (
          sortedDates.map((date) => (
            <div key={date} className="mb-6">
              <h2 className="fs-4 fw-bold mb-3 pb-2 border-bottom text-primary d-flex align-items-center">
                <FaCalendarAlt className="me-2" />
                {formatDate(date)}
              </h2>
              {currentGroupedEvents[date].map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ))
        ) : (
          <Alert variant="info">No hay eventos para mostrar en esta página.</Alert>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-4 justify-content-center">
          <Pagination.First
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          />
          {Array.from({ length: totalPages }, (_, i) => (
            <Pagination.Item
              key={i + 1}
              active={i + 1 === currentPage}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          />
          <Pagination.Last
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
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