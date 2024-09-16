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
  const [error, setError] = useState(null);

  const handleDateSelect = (selectInfo) => {
    setCurrentEvent({
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: selectInfo.allDay,
      companyName: "",
      peopleCount: "",
      contactName: "",
      foodPackage: "",
      contactPhone: "",
      eventLocation: "",
      eventDescription: "",
      deposit: "",
      pendingAmount: "",
      attachments: null,
    });
    setModalOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    setCurrentEvent({
      id: clickInfo.event.id,
      start: clickInfo.event.start,
      end: clickInfo.event.end,
      allDay: clickInfo.event.allDay,
      companyName: clickInfo.event.extendedProps.companyName || "",
      peopleCount: clickInfo.event.extendedProps.peopleCount || "",
      contactName: clickInfo.event.extendedProps.contactName || "",
      foodPackage: clickInfo.event.extendedProps.foodPackage || "",
      contactPhone: clickInfo.event.extendedProps.contactPhone || "",
      eventLocation: clickInfo.event.extendedProps.eventLocation || "",
      eventDescription: clickInfo.event.extendedProps.eventDescription || "",
      deposit: clickInfo.event.extendedProps.deposit || "",
      pendingAmount: clickInfo.event.extendedProps.pendingAmount || "",
      attachments: clickInfo.event.extendedProps.attachments || null,
    });
    setModalOpen(true);
  };

  const handleSaveEvent = (eventData) => {
    setError(null);
    try {
      const newEventData = {
        ...eventData,
        start: new Date(eventData.startDate),
        end: new Date(eventData.endDate),
        title: eventData.companyName,
      };

      if (eventData.id) {
        // Updating existing event
        setEvents(
          events.map((e) =>
            e.id === eventData.id ? { ...e, ...newEventData } : e
          )
        );
      } else {
        // Creating new event
        const newEvent = {
          ...newEventData,
          id: createEventId(),
        };
        setEvents([...events, newEvent]);
      }

      // Handle file upload here if needed
      if (eventData.attachments) {
        // You might want to implement a file upload function here
        // For example: uploadFile(eventData.attachments, eventData.id)
        console.log("File attached:", eventData.attachments.name);
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
          eventContent={(eventInfo) => (
            <>
              <b>{eventInfo.event.title}</b>
              <p>{eventInfo.event.extendedProps.eventLocation}</p>
            </>
          )}
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
      {error && <div className="text-red-500 mt-2">{error}</div>}
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
      foodPackage: PropTypes.string,
      contactPhone: PropTypes.string,
      eventLocation: PropTypes.string,
      eventDescription: PropTypes.string,
      deposit: PropTypes.string,
      pendingAmount: PropTypes.string,
      attachments: PropTypes.object,
    })
  ),
};

EventCalendar.defaultProps = {
  initialEvents: [],
};

export default EventCalendar;
