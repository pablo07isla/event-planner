import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react"; // El componente de FullCalendar
import dayGridPlugin from "@fullcalendar/daygrid"; // Vista de cuadrícula mensual
import interactionPlugin from "@fullcalendar/interaction"; // Interacción para arrastrar y soltar
import "./App.css";

function App() {
  const [events, setEvents] = useState([
    {
      id: "1",
      title: "Evento 1",
      date: "2023-09-10",
      endDate: "2023-09-11",
      description: "Descripción del evento 1",
      location: "Madrid",
    },
    {
      id: "2",
      title: "Evento 2",
      date: "2023-09-12",
      endDate: "2023-09-12",
      description: "Descripción del evento 2",
      location: "Barcelona",
    },
  ]);

  // Función para manejar la creación de un nuevo evento
  const handleDateClick = (info) => {
    const newEventTitle = prompt("Ingrese el título del evento:");
    const newEventDescription = prompt("Ingrese la descripción del evento:");
    const newEventLocation = prompt("Ingrese la ubicación del evento:");
    const newEventEndDate = prompt(
      "Ingrese la fecha de fin del evento (YYYY-MM-DD):",
      info.dateStr
    );

    if (newEventTitle) {
      const newEvent = {
        id: Date.now().toString(), // Generar un ID único para cada evento
        title: newEventTitle,
        date: info.dateStr,
        endDate: newEventEndDate || info.dateStr, // Fecha de fin (igual a la de inicio si no se ingresa)
        description: newEventDescription || "Sin descripción",
        location: newEventLocation || "Ubicación no especificada",
      };
      setEvents([...events, newEvent]); // Añadir el nuevo evento al estado
    }
  };

  // Función para manejar el clic en un evento para editar o eliminar
  const handleEventClick = (info) => {
    const selectedEvent = events.find((event) => event.id === info.event.id); // Encontrar el evento seleccionado
    if (selectedEvent) {
      // Mostrar los detalles del evento
      alert(
        `Detalles del evento:\n\nTítulo: ${selectedEvent.title}\nDescripción: ${selectedEvent.description}\nUbicación: ${selectedEvent.location}\nFecha de Fin: ${selectedEvent.endDate}`
      );

      const action = prompt(
        `Escriba un nuevo título para el evento o 'eliminar' para borrarlo: ${selectedEvent.title}`
      );

      if (action === "eliminar") {
        // Confirmación para eliminar el evento
        const confirmDelete = window.confirm(
          "¿Estás seguro de que deseas eliminar este evento?"
        );
        if (confirmDelete) {
          setEvents(events.filter((event) => event.id !== info.event.id)); // Eliminar el evento
        }
      } else if (action) {
        const newDescription = prompt(
          "Actualiza la descripción del evento:",
          selectedEvent.description
        );
        const newLocation = prompt(
          "Actualiza la ubicación del evento:",
          selectedEvent.location
        );
        const newEndDate = prompt(
          "Actualiza la fecha de fin del evento (YYYY-MM-DD):",
          selectedEvent.endDate
        );

        // Editar el título, descripción, ubicación y fecha de fin del evento
        const updatedEvents = events.map((event) =>
          event.id === info.event.id
            ? {
                ...event,
                title: action,
                description: newDescription || event.description,
                location: newLocation || event.location,
                endDate: newEndDate || event.endDate,
              }
            : event
        );
        setEvents(updatedEvents);
      }
    }
  };

  return (
    <div className="App">
      <h1>Planificador de Eventos</h1>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth" // Vista mensual
        events={events.map((event) => ({
          id: event.id,
          title: event.title,
          start: event.date,
          end: event.endDate, // Añadir fecha de fin
          extendedProps: {
            description: event.description,
            location: event.location,
          },
        }))} // Convertir eventos al formato esperado
        dateClick={handleDateClick} // Click en una fecha para añadir eventos
        eventClick={handleEventClick} // Click en un evento para editar/eliminar
        editable={true} // Permitir mover eventos
      />
    </div>
  );
}

export default App;
