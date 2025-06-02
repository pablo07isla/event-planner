import { Trans } from "@lingui/macro";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { Badge } from "../ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { IconCalendarEvent } from "@tabler/icons-react";
import ModalEvent from "../Modal";

function parseToLocalDate(dateString) {
  // Si viene como 'YYYY-MM-DD', fuerza a local
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(dateString + "T00:00:00");
  }
  // Si viene con hora, usa el constructor normal
  return new Date(dateString);
}

function isSameDay(dateA, dateB) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

export default function SectionCards() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      const { data, error } = await supabase.from("events").select();
      console.log("Supabase data:", data);
      console.log("Supabase error:", error);
      if (!error) setEvents(data || []);
      setLoading(false);
    }
    fetchEvents();
  }, []);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const afterTomorrow = new Date(today);
  afterTomorrow.setDate(today.getDate() + 2);

  // Cambia 'date' por 'start' y ajusta nombre/cantidad
  const eventsToday = events.filter((e) => isSameDay(parseToLocalDate(e.start), today));
  const eventsTomorrow = events.filter((e) => isSameDay(parseToLocalDate(e.start), tomorrow));
  const eventsAfterTomorrow = events.filter((e) => isSameDay(parseToLocalDate(e.start), afterTomorrow));

  // Calcular el total de personas para cada día
  const totalPeopleToday = eventsToday.reduce((acc, e) => acc + (parseInt(e.peopleCount) || 0), 0);
  const totalPeopleTomorrow = eventsTomorrow.reduce((acc, e) => acc + (parseInt(e.peopleCount) || 0), 0);
  const totalPeopleAfterTomorrow = eventsAfterTomorrow.reduce((acc, e) => acc + (parseInt(e.peopleCount) || 0), 0);

  // Obtener el nombre del día de la semana para pasado mañana
  const afterTomorrowDayName = afterTomorrow.toLocaleDateString('es-ES', { weekday: 'long' });

  console.log("events state:", events);
  console.log("today:", today, "tomorrow:", tomorrow, "afterTomorrow:", afterTomorrow);
  console.log("eventsToday:", eventsToday);
  console.log("eventsTomorrow:", eventsTomorrow);
  console.log("eventsAfterTomorrow:", eventsAfterTomorrow);

  // Componente para renderizar cada tarjeta
  const EventCard = ({ 
    title, 
    events, 
    totalPeople, 
    bgColor, 
    borderColor, 
    badgeColor, 
    textColor,
    emptyMessage 
  }) => (
    <Card className={`${bgColor} ${borderColor} h-full flex flex-col`}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4 mb-3 w-full justify-between">
          <CardDescription className="text-lg font-semibold text-gray-700 capitalize flex-1">
            {title}
          </CardDescription>
          <div className="flex items-center gap-2 flex-1 justify-center">
            <IconCalendarEvent className="h-6 w-6 text-gray-600" />
            <span className="text-xl font-bold tabular-nums text-gray-900">
              {loading ? "..." : events.length}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-1 justify-end">
           <Badge variant="secondary" className="bg-white/80 border-white/40 text-xl font-bold tabular-nums text-gray-900 px-3 py-2">
              {loading ? "..." : totalPeople}
              <span className="text-sm text-gray-600 font-medium ml-1">
                <Trans>pax</Trans>
              </span>
            </Badge>
          </div>
        </div>
        {/* {!loading && events.length === 0 && (
          <div className="flex justify-center">
            <Badge variant="secondary" className="text-gray-500">
              <Trans>Sin eventos</Trans>
            </Badge>
          </div>
        )} */}
      </CardHeader>
      <CardFooter className="pt-0 flex-1 flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-pulse text-gray-500">
              <Trans>Cargando...</Trans>
            </div>
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-3 w-full">
            {events.map((event, idx) => (
              <div
                key={idx}
                className="bg-white/50 rounded-lg p-3 border border-white/20 backdrop-blur-sm cursor-pointer hover:bg-blue-100/70 transition"
                onClick={() => {
                  setSelectedEvent(event);
                  setModalOpen(true);
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate text-sm">
                      {event.companyName || event.title || 'Sin nombre'}
                    </h4>
                    {event.eventStatus && (
                      <p className="text-xs text-gray-600 mt-1">
                        {event.eventStatus}
                      </p>
                    )}
                  </div>
                  {event.peopleCount && (
                    <div className="text-right flex-shrink-0">
                      <span className="font-bold text-gray-900 text-sm">
                        {event.peopleCount}
                      </span>
                      <p className="text-xs text-gray-500">personas</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <div className="text-center">
              <IconCalendarEvent className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{emptyMessage}</p>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 lg:px-6">
      <EventCard
        title={<Trans>Hoy</Trans>}
        events={eventsToday}
        totalPeople={totalPeopleToday}
        bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
        borderColor="border-blue-200"
        badgeColor="bg-blue-500"
        textColor="text-white"
        emptyMessage={<Trans>No hay eventos para hoy</Trans>}
      />
      
      <EventCard
        title={<Trans>Mañana</Trans>}
        events={eventsTomorrow}
        totalPeople={totalPeopleTomorrow}
        bgColor="bg-gradient-to-br from-green-50 to-green-100"
        borderColor="border-green-200"
        badgeColor="bg-green-500"
        textColor="text-white"
        emptyMessage={<Trans>No hay eventos para mañana</Trans>}
      />
      
      <EventCard
        title={afterTomorrowDayName}
        events={eventsAfterTomorrow}
        totalPeople={totalPeopleAfterTomorrow}
        bgColor="bg-gradient-to-br from-amber-50 to-amber-100"
        borderColor="border-amber-200"
        badgeColor="bg-amber-500"
        textColor="text-white"
        emptyMessage={<Trans>No hay eventos para pasado mañana</Trans>}
      />

      {/* Modal para ver el evento */}
      <ModalEvent
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={() => setModalOpen(false)}
        onDelete={() => setModalOpen(false)}
        event={selectedEvent}
      />
    </div>
  );
}