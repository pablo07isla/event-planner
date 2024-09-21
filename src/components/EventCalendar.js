import React, { useState, useEffect, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ModalEvent from "./Modal";
import esLocale from "@fullcalendar/core/locales/es";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css"; // needs additional webpack config!
import "@fortawesome/fontawesome-free/css/all.css"; // needs additional webpack config!
import bootstrapPlugin from "@fullcalendar/bootstrap";
import axios from "axios";

import { Modal, Button } from "react-bootstrap";

function EventCalendar({ initialEvents }) {
  const [events, setEvents] = useState(initialEvents);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [error, setError] = useState(null);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [eventToUpdate, setEventToUpdate] = useState(null);

  const handleDateSelect = (selectInfo) => {
    let endDate = new Date(selectInfo.end);
    endDate.setDate(endDate.getDate() - 1); // Restar un día a la fecha de fin

    setCurrentEvent({
      start: selectInfo.startStr,
      end: selectInfo.endStr, // No restar días, usar el valor que ya es correcto
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
    setCurrentEvent({
      id: clickInfo.event.id,
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr,
      allDay: true, // Establecer allDay como true
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
      attachments: clickInfo.event.extendedProps.attachments || null,
      eventStatus: clickInfo.event.extendedProps.eventStatus || "Pendiente",
    });
    setModalOpen(true);
  };

  const handleEventDrop = (dropInfo) => {
    setEventToUpdate({
      id: dropInfo.event.id,
      start: dropInfo.event.start,
      end: dropInfo.event.end,
      oldStart: dropInfo.oldEvent.start,
      oldEnd: dropInfo.oldEvent.end,
    });
    setAlertDialogOpen(true);
  };

  const handleEventResize = (resizeInfo) => {
    setEventToUpdate({
      id: resizeInfo.event.id,
      start: resizeInfo.event.start,
      end: resizeInfo.event.end,
      oldStart: resizeInfo.oldEvent.start,
      oldEnd: resizeInfo.oldEvent.end,
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
          `http://localhost:3001/api/events/${eventToUpdate.id}`
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

        const response = await axios.put(
          `http://localhost:3001/api/events/${eventToUpdate.id}`,
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
    // Revert the change in the calendar
    if (eventToUpdate) {
      const calendarApi = calendarRef.current.getApi();
      const event = calendarApi.getEventById(eventToUpdate.id);
      if (event) {
        event.setDates(eventToUpdate.oldStart, eventToUpdate.oldEnd);
      }
    }
  };

  const handleSaveEvent = async (eventData) => {
    setError(null);
    try {
      const newEventData = {
        ...eventData,
        start: new Date(eventData.start).toISOString(),
        end: new Date(eventData.end).toISOString(),
        title: eventData.companyName,
        allDay: true, // Asegurarse de que allDay sea true
        peopleCount: parseInt(eventData.peopleCount, 10),
        deposit: parseFloat(eventData.deposit) || 0,
        pendingAmount: parseFloat(eventData.pendingAmount) || 0,
      };

      let response;
      if (eventData.id) {
        response = await axios.put(
          `http://localhost:3001/api/events/${eventData.id}`,
          newEventData
        );
      } else {
        response = await axios.post(
          "http://localhost:3001/api/events",
          newEventData
        );
      }

      // Aplicar el color basado en el estado del evento
      // const updatedEvent = response.data;
      // const colors = getEventColor(updatedEvent.eventStatus);
      // const eventWithColor = {
      //   ...updatedEvent,
      //   backgroundColor: colors.backgroundColor,
      //   textColor: colors.textColor,
      //   borderColor: colors.backgroundColor,
      // };

      const savedEvent = response.data;
      const eventWithColor = applyEventColor(savedEvent);

      setEvents((prevEvents) => {
        if (eventData.id) {
          return prevEvents.map((e) =>
            e.id === eventData.id ? eventWithColor : e
          );
        } else {
          return [...prevEvents, eventWithColor];
        }
      });

      setModalOpen(false);
    } catch (err) {
      setError("Error al guardar el evento. Por favor, inténtelo de nuevo.");
      console.error(err);
    }
  };

  const handleDeleteEvent = async () => {
    setError(null);
    try {
      await axios.delete(`http://localhost:3001/api/events/${currentEvent.id}`);
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
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/events");
        setEvents(response.data);
      } catch (err) {
        setError("Error al cargar los eventos. Por favor, recargue la página.");
        console.error(err);
      }
    };

    fetchEvents();
  }, []);

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
      let end = new Date(preparedEvent.end);
      let start = new Date(preparedEvent.start);

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
        start: start.toISOString(),
        end: end.toISOString(),
        allDay: true,
      };
    });
  }, [events]); // Only re-run the memoization if events changes

  const calendarRef = useRef(null);

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="p-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Calendario de Eventos
          </h2>
          <FullCalendar
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              bootstrap5Plugin,
              bootstrapPlugin,
            ]}
            themeSystem="bootstrap"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            events={preparedEvents}
            select={handleDateSelect}
            eventClick={handleEventClick}
            ref={calendarRef}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            eventContent={(eventInfo) => (
              <div className="flex items-center justify-between w-full px-2 py-1 text-sm">
                <span className="font-semibold truncate">
                  {eventInfo.event.title}
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
              },
              timeGridDay: {
                dayHeaderFormat: {
                  weekday: "long",
                  day: "numeric",
                  month: "numeric",
                },
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
            // className="bootstrap5"
          />
        </div>
      </div>
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
      attachments: PropTypes.object,
      eventStatus: PropTypes.string, // New prop type for event status
    })
  ),
};

EventCalendar.defaultProps = {
  initialEvents: [],
};

export default EventCalendar;
