import { Trans } from "@lingui/macro";
import { useState } from "react";
import { Badge } from "../ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
} from "../ui/card";
import { IconCalendarEvent } from "@tabler/icons-react";
import ModalEvent from "../events/Modal";
import { PDFDownloadLink } from "@react-pdf/renderer";
import EventListPDF from "../events/EventListPDF";
import { IconPrinter } from "@tabler/icons-react";

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

export default function SectionCards({ events, loading, refreshEvents }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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
  }) => {
    return (
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
              {/* Botón de imprimir PDF */}
              {!loading && events.length > 0 && (
                <PDFDownloadLink
                  document={
                    <EventListPDF
                      events={events.map((event) => ({
                        ...event,
                        extendedProps: {
                          companyName: event.companyName,
                          peopleCount: event.peopleCount,
                          contactName: event.contactName,
                          contactPhone: event.contactPhone,
                          eventLocation: event.eventLocation,
                          deposit: event.deposit,
                          pendingAmount: event.pendingAmount,
                          eventDescription: event.eventDescription,
                          foodPackage: event.foodPackage,
                        },
                      }))}
                    />
                  }
                  fileName={`eventos_${typeof title === 'string' ? title : ''}.pdf`}
                  className="ml-2"
                >
                  {({ loading: pdfLoading }) => (
                    <button
                      className="p-2 rounded hover:bg-gray-200 transition"
                      title="Descargar PDF"
                      disabled={pdfLoading}
                    >
                      <IconPrinter className="h-6 w-6 text-gray-700" />
                    </button>
                  )}
                </PDFDownloadLink>
              )}
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
                  <div className="flex items-center gap-2 w-full">
                    <span className="font-medium text-gray-900 truncate text-sm flex-1">
                      {event.companyName || event.title || 'Sin nombre'}
                    </span>
                    {event.peopleCount && (
                      <span className="font-bold text-gray-900 text-xs whitespace-nowrap">
                        {event.peopleCount} p
                      </span>
                    )}
                    {event.eventStatus && (
                      <span className="text-xs text-gray-600 ml-2 whitespace-nowrap">
                        {event.eventStatus}
                      </span>
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
  };

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