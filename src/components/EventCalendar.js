import React, { useState } from "react";
import PropTypes from "prop-types";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Modal from "./Modal";

function EventCalendar({ initialEvents }) {
  const [events, setEvents] = useState(initialEvents);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [setError] = useState(null);

  const handleDateSelect = (selectInfo) => {
    setCurrentEvent({
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: selectInfo.allDay,
    });
    setModalOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    setCurrentEvent(clickInfo.event);
    setModalOpen(true);
  };

  const handleSaveEvent = (title) => {
    setError(null);
    try {
      if (currentEvent.id) {
        // Updating existing event
        setEvents(
          events.map((e) => (e.id === currentEvent.id ? { ...e, title } : e))
        );
      } else {
        // Creating new event
        const newEvent = {
          id: createEventId(),
          title,
          start: currentEvent.start,
          end: currentEvent.end,
          allDay: currentEvent.allDay,
        };
        setEvents([...events, newEvent]);
      }
      setModalOpen(false);
    } catch (err) {
      setError("Error al guardar el evento. Por favor, inténtelo de nuevo.");
    }
  };

  const handleDeleteEvent = () => {
    setError(null);
    try {
      setEvents(events.filter((e) => e.id !== currentEvent.id));
      setModalOpen(false);
    } catch (err) {
      setError("Error al eliminar el evento. Por favor, inténtelo de nuevo.");
    }
  };

  const createEventId = () => String(new Date().getTime());

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
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
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          className="p-4"
        />
      </div>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        event={currentEvent}
      />
    </div>
  );
}

EventCalendar.propTypes = {
  initialEvents: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      start: PropTypes.string.isRequired,
      end: PropTypes.string,
      allDay: PropTypes.bool,
    })
  ),
};

EventCalendar.defaultProps = {
  initialEvents: [],
};

export default EventCalendar;
