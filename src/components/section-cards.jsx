import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Badge } from "./ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { IconCalendarEvent } from "@tabler/icons-react";

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 lg:px-6">
      <Card className="@container/card bg-blue-100 border-blue-300">
        <CardHeader>
          <div className="flex flex-row items-center gap-2 mb-2 w-full">
            <Badge className="bg-blue-300 text-blue-900" variant="outline">
              {loading ? "..." : totalPeopleToday}
            </Badge>
            <div className="flex flex-col flex-1">
              <CardDescription>Hoy</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {loading ? "..." : eventsToday.length}
              </CardTitle>
            </div>
            {!loading && eventsToday.length === 0 && (
              <Badge variant="outline">
                Sin eventos
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm w-full">
          {loading ? (
            <div>Cargando...</div>
          ) : eventsToday.length > 0 ? (
            <ul className="w-full">
              {eventsToday.map((event, idx) => (
                <li key={idx} className="flex justify-between w-full">
                  <span>{event.companyName || event.title || 'Sin nombre'}</span>
                  <span className="font-bold">{event.peopleCount ? `${event.peopleCount} personas` : ''}</span>
                  <span className="ml-2">{event.eventStatus ? event.eventStatus : ''}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div>No hay eventos para hoy</div>
          )}
        </CardFooter>
      </Card>
      <Card className="@container/card bg-green-100 border-green-300">
        <CardHeader>
          <div className="flex flex-row items-center gap-2 mb-2 w-full">
            <Badge className="bg-green-300 text-green-900" variant="outline">
              {loading ? "..." : totalPeopleTomorrow}
            </Badge>
            <div className="flex flex-col flex-1">
              <CardDescription>Mañana</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {loading ? "..." : eventsTomorrow.length}
              </CardTitle>
            </div>
            {!loading && eventsTomorrow.length === 0 && (
              <Badge variant="outline">
                Sin eventos
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm w-full">
          {loading ? (
            <div>Cargando...</div>
          ) : eventsTomorrow.length > 0 ? (
            <ul className="w-full">
              {eventsTomorrow.map((event, idx) => (
                <li key={idx} className="flex justify-between w-full">
                  <span>{event.companyName || event.title || 'Sin nombre'}</span>
                  <span className="font-bold">{event.peopleCount ? `${event.peopleCount} personas` : ''}</span>
                  <span className="ml-2">{event.eventStatus ? event.eventStatus : ''}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div>No hay eventos para mañana</div>
          )}
        </CardFooter>
      </Card>
      <Card className="@container/card bg-yellow-100 border-yellow-300">
        <CardHeader>
          <div className="flex flex-row items-center gap-2 mb-2 w-full">
            <Badge className="bg-yellow-300 text-yellow-900" variant="outline">
              {loading ? "..." : totalPeopleAfterTomorrow}
            </Badge>
            <div className="flex flex-col flex-1">
              <CardDescription className="capitalize">{afterTomorrowDayName}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {loading ? "..." : eventsAfterTomorrow.length}
              </CardTitle>
            </div>
            {!loading && eventsAfterTomorrow.length === 0 && (
              <Badge variant="outline">
                Sin eventos
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm w-full">
          {loading ? (
            <div>Cargando...</div>
          ) : eventsAfterTomorrow.length > 0 ? (
            <ul className="w-full">
              {eventsAfterTomorrow.map((event, idx) => (
                <li key={idx} className="flex justify-between w-full">
                  <span>{event.companyName || event.title || 'Sin nombre'}</span>
                  <span className="font-bold">{event.peopleCount ? `${event.peopleCount} personas` : ''}</span>
                  <span className="ml-2">{event.eventStatus ? event.eventStatus : ''}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div>No hay eventos para pasado mañana</div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
