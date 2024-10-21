import ModalEvent from "./Modal";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import esLocale from "@fullcalendar/core/locales/es";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import PropTypes from "prop-types";
import React, { useState, useEffect, useMemo, useRef } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";
// needs additional webpack config!
import "@fortawesome/fontawesome-free/css/all.css";
import { supabase } from "../supabaseClient";
import Sidebar from "./Sidebar";
// needs additional webpack config!
import bootstrapPlugin from "@fullcalendar/bootstrap";
import { Modal, Button } from "react-bootstrap";
import "./EventCalendar.css";
import EventList from "./EventList";
import { parseISO, format } from "date-fns";
import { FaPrint } from "react-icons/fa";
// Asegúrate de que la ruta sea correcta
import { useNavigate } from "react-router-dom";

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
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const handleDateSelect = (selectInfo) => {
    // Convertir las fechas a la zona horaria local
    const start = new Date(selectInfo.start);
    const end = new Date(selectInfo.end);

    setCurrentEvent({
      start: format(start, "yyyy-MM-dd'T'HH:mm:ss"),
      end: format(end, "yyyy-MM-dd'T'HH:mm:ss"),
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
      companyGroupId: null,
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
      companyGroupId: clickInfo.event.extendedProps.companyGroupId || null,
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
        const eventResponse = await supabase
          .from("events")
          .select("*")
          .eq("id", eventToUpdate.id);
        const fullEventData = eventResponse.data[0];

        // Prepare the update data, keeping all fields and updating only the dates
        const updateData = {
          ...fullEventData,
          start: start,
          end: end,
        };

        // Remove any fields that might cause issues
        delete updateData.id; // The ID is usually in the URL for PUT requests
        const eventExists = await supabase
          .from("events")
          .select("*")
          .eq("id", eventToUpdate.id);
        console.log("eventExists", eventExists.data); // Verifica si el evento se obtiene correctamente

        const response = await supabase
          .from("events")
          .update(updateData)
          .eq("id", eventToUpdate.id);

        const updatedEvent = response.data[0];
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

      // Convertir foodPackage a un array de PostgreSQL
      const foodPackageArray = formData.get("foodPackage") ? formData.get("foodPackage").split(',') : [];
      const foodPackagePostgres = `{${foodPackageArray.map(item => `"${item}"`).join(',')}}`;

      const eventData = {
        start: new Date(formData.get("startDate")).toISOString(),
        end: new Date(formData.get("endDate")).toISOString(),
        companyName: formData.get("companyName"),
        peopleCount: formData.get("peopleCount"),
        contactName: formData.get("contactName"),
        foodPackage: foodPackagePostgres, // Usar el formato de array de PostgreSQL
        contactPhone: formData.get("contactPhone"),
        email: formData.get("email"),
        eventLocation: formData.get("eventLocation"),
        eventDescription: formData.get("eventDescription"),
        deposit: formData.get("deposit"),
        pendingAmount: formData.get("pendingAmount"),
        eventStatus: formData.get("eventStatus"),
        lastModified: new Date().toISOString(),
        lastModifiedBy: currentUser ? currentUser.username : "Usuario desconocido",
        companyGroupId: formData.get("companyGroupId"),
      };

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

      const savedEvent = response.data[0];
      const eventWithColor = applyEventColor({
        ...savedEvent,
        start: new Date(savedEvent.start).toISOString(),
        end: new Date(savedEvent.end).toISOString()
      });

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
      console.error("Error al guardar el evento:", err);
      setError(`Error al guardar el evento: ${err.message}`);
    }
  };

  const handleDeleteEvent = async () => {
    setError(null);
    try {
      const token = localStorage.getItem("token"); // Suponiendo que guardas el token en localStorage
      await supabase.from("events").delete().eq("id", currentEvent.id);
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
      // Establecer el usuario
      setUser(storedUser);
      // Cargar eventos
      fetchEvents();
    }
  }, [navigate]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase.from("events").select("*");
      if (error) throw error;
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Error al cargar los eventos. Por favor, inténtelo de nuevo.");
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
      borderColor: colors.backgroundColor,
      textColor: colors.textColor,
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
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar currentUser={user?.username} onAddEvent={handleAddEvent} />
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ">
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="bg-white shadow-2xl rounded-3xl h-full overflow-hidden flex flex-col">
            <div className="p-4 lg:p-6 flex-grow">
              <button
                onClick={handleShowModal}
                className="fixed bottom-6 right-6 z-10 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                aria-label="Exportar PDF"
              >
                <FaPrint size={24} />
              </button>

              <Modal
                show={showModal}
                onHide={handleCloseModal}
                size="lg"
                centered
                className="rounded-lg"
              >
                <Modal.Header closeButton className="bg-indigo-600 text-white">
                  <Modal.Title className="text-xl font-semibold">
                    Lista de Eventos
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-6">
                  <EventList events={visibleEvents} />
                </Modal.Body>
                <Modal.Footer className="border-t border-gray-200">
                  <Button
                    variant="secondary"
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-300"
                  >
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
                timeZone="local"
                events={preparedEvents}
                select={handleDateSelect}
                eventClick={handleEventClick}
                ref={calendarRef}
                eventDrop={handleEventDrop}
                eventResize={handleEventResize}
                datesSet={handleDatesSet}
                height="100%"
                eventContent={(eventInfo) => (
                  <div className="flex items-center justify-between w-full px-2 py-1 text-sm bg-indigo-100 rounded-lg shadow-sm overflow-hidden">
                    <span className="font-semibold truncate text-indigo-800 flex-grow">
                      {eventInfo.event.extendedProps.companyName}
                    </span>
                    <span className="ml-1 text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full whitespace-nowrap">
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
                    dayHeaderFormat: { weekday: "short" },
                    displayEventTime: false,
                  },
                  timeGridWeek: {
                    dayHeaderFormat: {
                      weekday: "short",
                      day: "numeric",
                      month: "numeric",
                    },
                    slotDuration: "01:00:00",
                    slotLabelInterval: "01:00:00",
                  },
                  timeGridDay: {
                    dayHeaderFormat: {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    },
                    slotDuration: "01:00:00",
                    slotLabelInterval: "01:00:00",
                  },
                  listWeek: {
                    listDayFormat: {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    },
                    listDaySideFormat: { weekday: "short" },
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
                className="rounded-lg overflow-hidden z-[999]"
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
          </div>
          {error && (
            <div
              className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-md"
              role="alert"
            >
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
      <style jsx global>{`
        .fc .fc-daygrid-day-frame {
          min-height: 100px;
        }
        .fc .fc-daygrid-day-events {
          margin-bottom: 0;
        }
        .fc .fc-daygrid-event {
          margin-top: 2px;
          margin-bottom: 2px;
        }
        .fc .fc-list-event-title {
          font-weight: bold;
          color: #4f46e5;
        }
      `}</style>
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
      companyGroupId: PropTypes.string, // New prop type for company group ID
    })
  ),
};

EventCalendar.defaultProps = {
  initialEvents: [],
};

export default EventCalendar;
