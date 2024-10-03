import React, { useState, useEffect, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import ModalEvent from "./Modal";
import esLocale from "@fullcalendar/core/locales/es";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css"; // needs additional webpack config!
import "@fortawesome/fontawesome-free/css/all.css"; // needs additional webpack config!
import bootstrapPlugin from "@fullcalendar/bootstrap";
import axios from "axios";
import Sidebar from "./Sidebar";
import { Modal, Button } from "react-bootstrap";
import "./EventCalendar.css"; // Asegúrate de que la ruta sea correcta
import { useNavigate } from "react-router-dom";
import EventList from "./EventList";
import { FaPrint } from "react-icons/fa";
import { parseISO, format } from "date-fns";

function EventCalendar({ initialEvents }) {
  const [events, setEvents] = useState(initialEvents);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [error, setError] = useState(null);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [eventToUpdate, setEventToUpdate] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  const [showModal, setShowModal] = useState(false); // Estado para controlar el modal
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

  const handleDateSelect = (selectInfo) => {
    const start = parseISO(selectInfo.startStr);
    const end = parseISO(selectInfo.endStr);

    setCurrentEvent({
      start: format(start, "yyyy-MM-dd'T'HH:mm"),
      end: format(end, "yyyy-MM-dd'T'HH:mm"),
      allDay: true,
      companyName: "",
      peopleCount: "",
      contactName: "",
      foodPackage: "",
      contactPhone: "",
      email: "",
      eventLocation: "",
      eventDescription: "",
      deposit: "",
      pendingAmount: "",
      attachments: null,
      eventStatus: "Pendiente",
    });
    setModalOpen(true);
  };

  console.log("events", events);

  const handleEventClick = (clickInfo) => {
    const start = parseISO(clickInfo.event.startStr);
    const end = parseISO(clickInfo.event.endStr);

    setCurrentEvent({
      id: clickInfo.event.id,
      start: format(start, "yyyy-MM-dd'T'HH:mm"),
      end: format(end, "yyyy-MM-dd'T'HH:mm"),
      allDay: clickInfo.event.allDay,
      companyName: clickInfo.event.extendedProps.companyName || "",
      peopleCount: clickInfo.event.extendedProps.peopleCount || "",
      contactName: clickInfo.event.extendedProps.contactName || "",
      foodPackage: clickInfo.event.extendedProps.foodPackage || [],
      contactPhone: clickInfo.event.extendedProps.contactPhone || "",
      email: clickInfo.event.extendedProps.email || "", // New field for email
      eventLocation: clickInfo.event.extendedProps.eventLocation || "",
      eventDescription: clickInfo.event.extendedProps.eventDescription || "",
      deposit: clickInfo.event.extendedProps.deposit || "",
      pendingAmount: clickInfo.event.extendedProps.pendingAmount || "",
      attachments: clickInfo.event.extendedProps.attachments || [],
      eventStatus: clickInfo.event.extendedProps.eventStatus || "Pendiente",
      lastModified: clickInfo.event.extendedProps.lastModified || "",
      lastModifiedBy: clickInfo.event.extendedProps.lastModifiedBy || "",
    });
    setModalOpen(true);
  };

  const handleEventDrop = (dropInfo) => {
    setEventToUpdate({
      id: dropInfo.event.id,
      start: dropInfo.event.start.toISOString(), // Convertir a UTC
      end: dropInfo.event.end.toISOString(), // Convertir a UTC
      oldStart: dropInfo.oldEvent.start.toISOString(),
      oldEnd: dropInfo.oldEvent.end.toISOString(),
    });
    setAlertDialogOpen(true);
  };

  const handleEventResize = (resizeInfo) => {
    setEventToUpdate({
      id: resizeInfo.event.id,
      start: resizeInfo.event.start.toISOString(), // Convertir a UTC
      end: resizeInfo.event.end.toISOString(), // Convertir a UTC
      oldStart: resizeInfo.oldEvent.start.toISOString(),
      oldEnd: resizeInfo.oldEvent.end.toISOString(),
    });
    setAlertDialogOpen(true);
  };

  const handleConfirmDateChange = async () => {
    setAlertDialogOpen(false);
    if (eventToUpdate) {
      try {
        // Log the eventToUpdate ID for debugging
        console.log("eventToUpdate.id:", eventToUpdate.id);

        // Ensure start and end dates are valid
        const start =
          eventToUpdate.start instanceof Date
            ? eventToUpdate.start.toISOString()
            : eventToUpdate.start;
        const end =
          eventToUpdate.end instanceof Date
            ? eventToUpdate.end.toISOString()
            : eventToUpdate.end;

        // Fetch the full event data before updating
        const eventResponse = await axios.get(
          `${API_URL}/api/events/${eventToUpdate.id}`
        );
        const fullEventData = eventResponse.data;

        // Prepare the update data, keeping all fields and updating only the dates
        const updateData = {
          ...fullEventData,
          start: start,
          end: end,
        };

        // Remove any fields that might cause issues
        delete updateData.id; // The ID is usually in the URL for PUT requests
        const eventExists = await axios.get(
          `${API_URL}/api/events/${eventToUpdate.id}`
        );
        console.log("eventExists", eventExists.data); // Verifica si el evento se obtiene correctamente

        const response = await axios.put(
          `${API_URL}/api/events/${eventToUpdate.id}`,
          updateData
        );

        const updatedEvent = response.data;
        setEvents((prevEvents) =>
          prevEvents.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
        );
      } catch (err) {
        console.error("Error details:", err.response?.data);
        setError(
          `Error al actualizar el evento: ${
            err.response?.data?.error || err.message
          }. Por favor, inténtelo de nuevo.`
        );
      }
    }
  };

  const handleCancelDateChange = () => {
    setAlertDialogOpen(false);
    console.log("eventToUpdate:", eventToUpdate);
    if (eventToUpdate && calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const event = calendarApi.getEventById(eventToUpdate.id);
      console.log("Event found:", event);
      if (event) {
        event.setDates(eventToUpdate.oldStart, eventToUpdate.oldEnd);

        const eventStatus = event.extendedProps.eventStatus || "Pendiente";
        console.log("Event status:", eventStatus);
        const colors = getEventColor(eventStatus);
        console.log("Colors:", colors);

        event.setProp("backgroundColor", colors.backgroundColor);
        event.setProp("borderColor", colors.backgroundColor);
        event.setProp("textColor", colors.textColor);

        console.log("Event after updates:", event);
      }
    }
    setEvents((prevEvents) => [...prevEvents]);
  };

  const handleSaveEvent = async (formData) => {
    setError(null);
    try {
      const currentUser = JSON.parse(localStorage.getItem("user"));

      // Convertir las fechas a formato UTC
      let start = new Date(formData.get("startDate"));
      let end = new Date(formData.get("endDate"));

      // Asegúrate de enviar las fechas en UTC (toISOString convierte a UTC)
      formData.set("start", start.toISOString());
      formData.set("end", end.toISOString());
      // Añadir datos adicionales al FormData
      formData.append("lastModified", new Date().toISOString());
      formData.append(
        "lastModifiedBy",
        currentUser ? currentUser.username : "Usuario desconocido"
      );

      let response;
      if (formData.get("id")) {
        response = await axios.put(
          `${API_URL}/api/events/${formData.get("id")}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        response = await axios.post(`${API_URL}/api/events`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
      const savedEvent = response.data;
      const eventWithColor = applyEventColor(savedEvent);

      setEvents((prevEvents) => {
        if (formData.get("id")) {
          return prevEvents.map((e) =>
            e.id === formData.get("id") ? eventWithColor : e
          );
        } else {
          return [...prevEvents, eventWithColor];
        }
      });

      setModalOpen(false);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        // Token expirado o inválido, redirigir al login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      } else {
        setError("Error al guardar el evento. Por favor, inténtelo de nuevo.");
        console.error(err);
      }
    }
  };

  const handleDeleteEvent = async () => {
    setError(null);
    try {
      const token = localStorage.getItem("token"); // Suponiendo que guardas el token en localStorage
      await axios.delete(`${API_URL}/api/events/${currentEvent.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEvents((prevEvents) =>
        prevEvents.filter((e) => e.id !== currentEvent.id)
      );
      setModalOpen(false);
    } catch (err) {
      setError("Error al eliminar el evento. Por favor, inténtelo de nuevo.");
      console.error(err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!token || !storedUser) {
      navigate("/login");
    } else {
      // Configurar axios con el token
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // Establecer el usuario
      setUser(storedUser);
      // Cargar eventos
      fetchEvents();
    }
  }, [navigate]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/events`);
      setEvents(response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Token expirado o inválido
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        console.error("Error fetching events:", error);
      }
    }
  };

  const getEventColor = (status) => {
    switch (status) {
      case "Pendiente":
        return { backgroundColor: "#FFA500", textColor: "#1F2937" };
      case "Con Abono":
        return { backgroundColor: "#4CAF50", textColor: "#FFFFFF" };
      case "Pago Total":
        return { backgroundColor: "#2196F3", textColor: "#FFFFFF" };
      case "Cancelado":
        return { backgroundColor: "#F44336", textColor: "#FFFFFF" };
      default:
        return { backgroundColor: "#9E9E9E", textColor: "#FFFFFF" };
    }
  };

  const applyEventColor = (event) => {
    const colors = getEventColor(event.eventStatus);
    return {
      ...event,
      backgroundColor: colors.backgroundColor,
      textColor: colors.textColor,
      borderColor: colors.backgroundColor,
    };
  };

  const preparedEvents = useMemo(() => {
    const applyEventColor = (event) => {
      const colors = getEventColor(event.eventStatus);
      return {
        ...event,
        backgroundColor: colors.backgroundColor,
        textColor: colors.textColor,
        borderColor: colors.backgroundColor,
      };
    };

    const isValidDate = (date) => {
      return date instanceof Date && !isNaN(date);
    };

    return events.map((event) => {
      const preparedEvent = applyEventColor(event);
      let start = parseISO(preparedEvent.start);
      let end = parseISO(preparedEvent.end);

      // If end date is invalid, set it to start date + 1 day
      if (!isValidDate(end)) {
        console.warn(
          `Invalid end date for event: ${preparedEvent.id}. Using start date + 1 day.`
        );
        end = new Date(start);
        end.setDate(end.getDate() + 1);
      }

      // Ensure start date is valid
      if (!isValidDate(start)) {
        console.warn(
          `Invalid start date for event: ${preparedEvent.id}. Using current date.`
        );
        start = new Date();
        end = new Date(start);
        end.setDate(end.getDate() + 1);
      }

      return {
        ...preparedEvent,
        start: format(start, "yyyy-MM-dd'T'HH:mm:ss"),
        end: format(end, "yyyy-MM-dd'T'HH:mm:ss"),
        allDay: true,
      };
    });
  }, [events]); // Only re-run the memoization if events changes

  //const calendarRef = useRef(null);

  const handleAddEvent = () => {
    setCurrentEvent({
      start: "",
      end: "",
      allDay: true,
      companyName: "",
      peopleCount: "",
      contactName: "",
      foodPackage: [],
      contactPhone: "",
      email: "",
      eventLocation: "",
      eventDescription: "",
      deposit: "",
      pendingAmount: "",
      attachments: null,
      eventStatus: "Pendiente",
    });
    setModalOpen(true);
  };

  const [visibleEvents, setVisibleEvents] = useState([]); // Eventos visibles en el rango actual

  // Función para capturar el rango visible actual de FullCalendar
  const handleDatesSet = (dateInfo) => {
    const calendarApi = calendarRef.current?.getApi(); // Verifica que calendarRef no sea undefined

    if (calendarApi) {
      const currentEvents = calendarApi.getEvents(); // Obtiene todos los eventos visibles en la vista actual

      // Filtra los eventos basados en el rango de fechas de la vista actual
      const filteredEvents = currentEvents.filter((event) => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end || event.start); // Si no hay 'end', usa 'start'
        return eventStart >= dateInfo.start && eventEnd <= dateInfo.end;
      });

      setVisibleEvents(filteredEvents); // Actualiza el estado con los eventos filtrados
    }
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar currentUser={user?.username} onAddEvent={handleAddEvent} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white shadow-xl rounded-2xl h-full">
            {/* <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Calendario de Eventos
            </h2> */}
            {/* Botón para exportar PDF que abre el modal */}
            {/* Botón flotante circular para exportar PDF */}
            <button
              onClick={handleShowModal}
              className="floating-button"
              aria-label="Exportar PDF"
            >
              <FaPrint size={24} color="white" />
            </button>
            {/* Modal con la tabla de eventos */}
            <Modal
              show={showModal}
              onHide={handleCloseModal}
              size="lg"
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Lista de Eventos</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {/* Muestra la tabla de eventos dentro del modal */}
                <EventList events={visibleEvents} />
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal}>
                  Cerrar
                </Button>
              </Modal.Footer>
            </Modal>
            <FullCalendar
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                listPlugin,
                interactionPlugin,
                bootstrap5Plugin,
                bootstrapPlugin,
              ]}
              themeSystem="bootstrap"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
              }}
              initialView="dayGridMonth"
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              timeZone="local" // Asegúrate de usar la zona horaria correcta
              events={preparedEvents}
              select={handleDateSelect}
              eventClick={handleEventClick}
              ref={calendarRef}
              eventDrop={handleEventDrop}
              eventResize={handleEventResize}
              datesSet={handleDatesSet} // Cada vez que cambie la vista, capturamos el rango visible
              height="100%"
              eventContent={(eventInfo) => (
                <div className="flex items-center justify-between w-full px-2 py-1 text-sm">
                  <span className="font-semibold truncate">
                    {eventInfo.event.extendedProps.companyName}
                  </span>
                  <span className="ml-1 text-xs bg-gray-200 text-gray-700 px-1 rounded">
                    {eventInfo.event.extendedProps.peopleCount}pax
                  </span>
                </div>
              )}
              locale={esLocale}
              buttonText={{
                today: "Hoy",
                month: "Mes",
                week: "Semana",
                day: "Día",
                list: "Lista",
              }}
              firstDay={1}
              titleFormat={{ year: "numeric", month: "long" }}
              views={{
                dayGridMonth: {
                  dayHeaderFormat: { weekday: "long" },
                },
                timeGridWeek: {
                  dayHeaderFormat: {
                    weekday: "long",
                    day: "numeric",
                    month: "numeric",
                  },
                  allDaySlot: true,
                  allDayText: "Todo el día",
                  slotDuration: "24:00:00",
                  slotLabelFormat: {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  },
                },
                timeGridDay: {
                  dayHeaderFormat: {
                    weekday: "long",
                    day: "numeric",
                    month: "numeric",
                  },
                  allDaySlot: true,
                  allDayText: "Todo el día",
                  slotDuration: "24:00:00",
                  slotLabelFormat: {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  },
                },
                listWeek: {
                  buttonText: "Lista", // Texto para la vista de lista
                },
              }}
              slotLabelFormat={{
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }}
              eventTimeFormat={{
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }}
            />

            <ModalEvent
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              onSave={handleSaveEvent}
              onDelete={handleDeleteEvent}
              event={currentEvent}
            />

            <Modal
              show={alertDialogOpen}
              onHide={() => setAlertDialogOpen(false)}
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Confirmar cambio de fecha</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                ¿Está seguro de que desea cambiar la fecha del evento?
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCancelDateChange}>
                  Cancelar
                </Button>
                <Button variant="primary" onClick={handleConfirmDateChange}>
                  Confirmar
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

EventCalendar.propTypes = {
  initialEvents: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      start: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
        .isRequired,
      end: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      allDay: PropTypes.bool,
      companyName: PropTypes.string,
      peopleCount: PropTypes.string,
      contactName: PropTypes.string,
      foodPackage: PropTypes.arrayOf(PropTypes.string),
      contactPhone: PropTypes.string,
      email: PropTypes.string, // Add email to PropTypes
      eventLocation: PropTypes.string,
      eventDescription: PropTypes.string,
      deposit: PropTypes.string,
      pendingAmount: PropTypes.string,
      attachments: PropTypes.arrayOf(PropTypes.object),
      eventStatus: PropTypes.string, // New prop type for event status
    })
  ),
};

EventCalendar.defaultProps = {
  initialEvents: [],
};

export default EventCalendar;
