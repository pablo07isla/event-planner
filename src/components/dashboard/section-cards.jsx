import { Trans } from "@lingui/macro";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Card, CardDescription, CardFooter, CardHeader } from "../ui/card";
import { IconCalendarEvent } from "@tabler/icons-react";
import ModalEvent from "../events/Modal";
import { PDFDownloadLink } from "@react-pdf/renderer";
import EventListPDF from "../events/EventListPDF";
import { IconPrinter } from "@tabler/icons-react";
import { BrainCircuit } from "lucide-react"; // AI Icon
import AIAnalysisModal from "./ai-analysis-modal";
import { toast } from "sonner";

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

export default function SectionCards({
  events,
  loading,
  refreshEvents,
  onDelete,
  onSave,
}) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // AI Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiProgress, setAiProgress] = useState(null);
  const [aiResults, setAiResults] = useState(null);
  const [aiDateLabel, setAiDateLabel] = useState("");

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const afterTomorrow = new Date(today);
  afterTomorrow.setDate(today.getDate() + 2);

  const eventsToday = events.filter(
    (e) =>
      isSameDay(parseToLocalDate(e.start), today) &&
      e.eventStatus !== "Cancelado"
  );
  const eventsTomorrow = events.filter(
    (e) =>
      isSameDay(parseToLocalDate(e.start), tomorrow) &&
      e.eventStatus !== "Cancelado"
  );
  const eventsAfterTomorrow = events.filter(
    (e) =>
      isSameDay(parseToLocalDate(e.start), afterTomorrow) &&
      e.eventStatus !== "Cancelado"
  );

  const totalPeopleToday = eventsToday.reduce(
    (acc, e) => acc + (parseInt(e.peopleCount) || 0),
    0
  );
  const totalPeopleTomorrow = eventsTomorrow.reduce(
    (acc, e) => acc + (parseInt(e.peopleCount) || 0),
    0
  );
  const totalPeopleAfterTomorrow = eventsAfterTomorrow.reduce(
    (acc, e) => acc + (parseInt(e.peopleCount) || 0),
    0
  );

  const afterTomorrowDayName = afterTomorrow.toLocaleDateString("es-ES", {
    weekday: "long",
  });

  const handleViewAnalysis = (dayEvents, title, dateObj) => {
    if (dayEvents.length === 0) {
      toast.info("No hay eventos para ver.");
      return;
    }

    let dateStr = "Día seleccionado";
    if (dateObj instanceof Date) {
      dateStr = dateObj.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      // Capitalize first letter
      dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    } else if (typeof title === "string") {
      dateStr = title;
    }

    setAiDateLabel(dateStr);

    const aggregatedItems = {}; // { key: { mealType, category, quantity, notes: Set() } }
    const allWarnings = [];

    let eventsWithData = 0;

    dayEvents.forEach((event) => {
      // Data is now pre-calculated in DB by Webhook
      const storedAnalysis = event.catering_intelligence;
      const mealGroups = storedAnalysis?.mealGroups || {};

      // Check if no food detected but event has people
      const hasMeals = Object.values(mealGroups).some(
        (items) => items && items.length > 0
      );

      if (!hasMeals && event.peopleCount > 0) {
        // Silently ignore or maybe add a visual indicator?
        // For now let's just log it to warnings if entirely missing to hint user might need to wait
        if (!storedAnalysis) {
          // allWarnings.push(`[${event.companyName}] Análisis pendiente o no disponible.`);
        } else {
          allWarnings.push(
            `Evento "${event.companyName || event.title}" (${
              event.peopleCount
            } pax) no tiene comida detectada.`
          );
        }
      }

      if (storedAnalysis) eventsWithData++;

      // Aggregate items from all meal groups
      Object.entries(mealGroups).forEach(([mealType, items]) => {
        if (!items || !Array.isArray(items)) return;

        items.forEach((item) => {
          const category = item.category || "Otro";
          const key = `${mealType}::${category}`;

          if (!aggregatedItems[key]) {
            aggregatedItems[key] = {
              mealType: mealType,
              category: category,
              quantity: 0,
              notes: new Set(),
            };
          }
          aggregatedItems[key].quantity += item.quantity || 0;
          if (item.notes) aggregatedItems[key].notes.add(item.notes);
        });
      });
    });

    // Final Assembly - group by mealType for display
    const itemsByMealType = {};
    Object.values(aggregatedItems).forEach((i) => {
      const mealType = i.mealType || "OTRO";
      if (!itemsByMealType[mealType]) {
        itemsByMealType[mealType] = [];
      }
      itemsByMealType[mealType].push({
        category: i.category,
        quantity: i.quantity,
        notes: Array.from(i.notes).join("; "),
      });
    });

    // Sort meal types in preferred order
    const mealTypeOrder = [
      "ALMUERZO",
      "REFRIGERIO",
      "DESAYUNO",
      "MENU INFANTIL",
      "VEGETARIANO",
      "OTRO",
    ];
    const sortedMealGroups = {};
    mealTypeOrder.forEach((type) => {
      if (itemsByMealType[type] && itemsByMealType[type].length > 0) {
        sortedMealGroups[type] = itemsByMealType[type];
      }
    });
    // Add any remaining types not in the order
    Object.keys(itemsByMealType).forEach((type) => {
      if (!sortedMealGroups[type]) {
        sortedMealGroups[type] = itemsByMealType[type];
      }
    });

    // Calculate totals
    const totalPaxInEvents = dayEvents.reduce(
      (sum, e) => sum + (e.peopleCount || 0),
      0
    );
    const totalFoodQuantity = Object.values(sortedMealGroups)
      .flat()
      .reduce((sum, i) => sum + i.quantity, 0);

    // Simple warning for big mismatch
    if (totalFoodQuantity < totalPaxInEvents * 0.5 && totalPaxInEvents > 0) {
      allWarnings.push(
        "⚠️ Alerta: Cantidad total de comida parece baja respecto al número de personas."
      );
    }

    if (eventsWithData < dayEvents.length && dayEvents.length > 0) {
      // Optional: warn that some events are not yet analyzed
      // allWarnings.push("ℹ️ Algunos eventos aún no han sido procesados por la IA.");
    }

    setAiResults({
      mealGroups: sortedMealGroups,
      warnings: allWarnings,
      totalPax: totalPaxInEvents,
      totalFood: totalFoodQuantity,
      eventsAnalyzed: dayEvents.length,
    });

    setAiModalOpen(true);
  };

  const EventCard = ({
    title,
    events,
    totalPeople,
    bgColor,
    borderColor,
    badgeColor,
    textColor,
    emptyMessage,
    date,
  }) => {
    return (
      <Card className={`${bgColor} ${borderColor} h-full flex flex-col`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-2 mb-3 w-full">
            <CardDescription className="text-lg font-semibold text-gray-700 capitalize shrink-0">
              {title}
            </CardDescription>
            <div className="flex items-center gap-2 shrink-0">
              <IconCalendarEvent className="h-6 w-6 text-gray-600" />
              <span className="text-xl font-bold tabular-nums text-gray-900">
                {loading ? "..." : events.length}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0 justify-end">
              <Badge
                variant="secondary"
                className="bg-white/80 border-white/40 text-xl font-bold tabular-nums text-gray-900 px-3 py-2"
              >
                {loading ? "..." : totalPeople}
                <span className="text-sm text-gray-600 font-medium ml-1">
                  <Trans>pax</Trans>
                </span>
              </Badge>

              {/* AI Button */}
              {!loading && events.length > 0 && (
                <button
                  className="p-2 rounded hover:bg-purple-100 transition ml-2 text-purple-600 border border-purple-200 bg-white"
                  title="Ver Análisis de Catering (IA)"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewAnalysis(events, title, date);
                  }}
                >
                  <BrainCircuit className="h-6 w-6" />
                </button>
              )}

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
                          paymentHistory: Array.isArray(event.paymentHistory)
                            ? event.paymentHistory
                            : [],
                        },
                      }))}
                    />
                  }
                  fileName={`eventos_${
                    typeof title === "string" ? title : ""
                  }.pdf`}
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
                      {event.companyName || event.title || "Sin nombre"}
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
    <>
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
          date={today}
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
          date={tomorrow}
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
          date={afterTomorrow}
        />

        {/* Modal para ver el evento */}
        <ModalEvent
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={async (formData) => {
            await onSave(formData);
            setModalOpen(false);
          }}
          onDelete={(id) => {
            onDelete(id);
            setModalOpen(false);
          }}
          event={selectedEvent}
        />
      </div>

      {/* AI Modal */}
      <AIAnalysisModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        loading={aiLoading}
        progress={aiProgress}
        results={aiResults}
        dateLabel={aiDateLabel}
      />
    </>
  );
}
