import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  FaMapMarkerAlt,
  FaUsers,
  FaPhoneAlt,
  FaMoneyBillWave,
  FaUtensils,
} from "react-icons/fa";
import { Button, Pagination } from "react-bootstrap";

const EVENTS_PER_PAGE = 3;

const EventList = ({ events }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const eventListRef = useRef();

  // Generar PDF sincronizado con la paginación del modal
  const generatePDF = async () => {
    const pdf = new jsPDF();
    let currentPDFPage = 1;

    // Guardar la página actual para restaurarla al final
    const originalPage = currentPage;

    // Recorrer cada página de la paginación
    for (let page = 1; page <= totalPages; page++) {
      setCurrentPage(page); // Cambiar a la página actual
      await new Promise((resolve) => setTimeout(resolve, 500)); // Esperar a que la página se renderice

      const input = eventListRef.current;
      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL("image/png");

      if (currentPDFPage > 1) pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, 10, 190, 0);

      currentPDFPage++;
    }

    // Restaurar la página original
    setCurrentPage(originalPage);

    pdf.save("reporte_eventos.pdf");
  };

  // Ordenar y agrupar los eventos por fecha
  const groupAndSortEventsByDate = (events) => {
    const grouped = {};
    events.forEach((event) => {
      const eventDate = new Date(event.start);

      // Ajustar el uso de la fecha en UTC para evitar problemas de zona horaria
      const dateString = eventDate.toISOString().split("T")[0]; // Mantener la fecha exacta del evento, sin desajustes
      if (!grouped[dateString]) {
        grouped[dateString] = [];
      }
      grouped[dateString].push(event);
    });

    // Ordenar fechas
    const sortedDates = Object.keys(grouped).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    // Crear un nuevo objeto con fechas ordenadas
    const sortedGrouped = {};
    sortedDates.forEach((date) => {
      sortedGrouped[date] = grouped[date];
    });

    return sortedGrouped;
  };

  // Obtener los eventos paginados y agrupados por fecha
  const getPaginatedAndGroupedEvents = () => {
    // Primero ordenar todos los eventos por fecha
    const groupedEvents = groupAndSortEventsByDate(events);
    const sortedDates = Object.keys(groupedEvents);

    // Aplicar la paginación a los eventos ya ordenados por fecha
    const paginatedGroupedEvents = {};
    let eventCounter = 0;

    sortedDates.forEach((date) => {
      const eventsOnDate = groupedEvents[date];
      if (
        eventCounter >= (currentPage - 1) * EVENTS_PER_PAGE &&
        eventCounter < currentPage * EVENTS_PER_PAGE
      ) {
        paginatedGroupedEvents[date] = eventsOnDate;
      }
      eventCounter += eventsOnDate.length;
    });

    return paginatedGroupedEvents;
  };

  // Formatear la fecha correctamente para mostrarla
  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString + "T00:00:00"); // Forzar la fecha a medianoche en UTC para evitar desajustes
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (value) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Obtener el total de páginas basadas en el número total de eventos
  useEffect(() => {
    setTotalPages(Math.ceil(events.length / EVENTS_PER_PAGE));
  }, [events]);

  // Obtener los eventos paginados y agrupados
  const paginatedGroupedEvents = getPaginatedAndGroupedEvents();
  const sortedDates = Object.keys(paginatedGroupedEvents);

  return (
    <div className="w-full">
      <Button onClick={generatePDF} variant="success" className="mb-4">
        Descargar PDF
      </Button>

      <div ref={eventListRef} className="bg-white p-4 shadow rounded w-full">
        {sortedDates.map((date) => (
          <div key={date} className="mb-6">
            <h2 className="text-xl font-bold mb-3 border-b pb-2">
              {formatDateForDisplay(date)}
            </h2>
            {paginatedGroupedEvents[date].map((event) => (
              <div
                key={event.id}
                className="mb-4 p-3 border rounded shadow-sm text-sm"
              >
                <h3 className="text-lg font-bold mb-2">
                  {event.title || "Evento sin nombre"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <p>
                      <FaUsers className="inline mr-1" />{" "}
                      <strong>N° de personas:</strong>{" "}
                      {event.extendedProps?.peopleCount || "N/A"}
                    </p>
                    <p>
                      <strong>Nombre Responsable:</strong>{" "}
                      {event.extendedProps?.contactName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p>
                      <FaPhoneAlt className="inline mr-1" />{" "}
                      <strong>Teléfonos:</strong>{" "}
                      {event.extendedProps?.contactPhone || "N/A"}
                    </p>
                    <p>
                      <FaMapMarkerAlt className="inline mr-1" />{" "}
                      <strong>Lugar:</strong>{" "}
                      {event.extendedProps?.eventLocation || "No especificado"}
                    </p>
                  </div>
                  <div>
                    <p>
                      <FaMoneyBillWave className="inline mr-1" />{" "}
                      <strong>Consignación:</strong>{" "}
                      {formatCurrency(event.extendedProps.deposit)}
                    </p>
                    <p>
                      <FaMoneyBillWave className="inline mr-1" />{" "}
                      <strong>Saldo Pendiente:</strong>{" "}
                      {formatCurrency(event.extendedProps.pendingAmount)}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <p>
                    <FaUtensils className="inline mr-1" />{" "}
                    <strong>Paquete de alimentación:</strong>{" "}
                    {(event.extendedProps?.foodPackage || []).join(", ") ||
                      "No especificado"}
                  </p>
                  <strong>Descripción:</strong>
                  <p className="text-xs">
                    {event.extendedProps?.eventDescription ||
                      "No hay descripción disponible"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <Pagination className="mt-4 justify-content-center">
        <Pagination.First
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
        />
        <Pagination.Prev
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        />
        {[...Array(totalPages)].map((_, index) => (
          <Pagination.Item
            key={index + 1}
            active={index + 1 === currentPage}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        />
        <Pagination.Last
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        />
      </Pagination>
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
      }),
    })
  ).isRequired,
};

export default EventList;
