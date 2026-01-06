import React from "react";
import { Check, Circle, AlertTriangle } from "lucide-react";
import { cn } from "../../lib/utils";

const STEPS = [
  { label: "Pendiente", value: "Pendiente" },
  { label: "Con Abono", value: "Con Abono" },
  { label: "Pago Total", value: "Pago Total" },
  { label: "Completado", value: "Completado" },
];

const EventStatusStepper = ({ currentStatus, onStatusSelect }) => {
  // Manejo especial para eventos cancelados
  if (currentStatus === "Cancelado") {
    return (
      <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center justify-center text-red-700">
        <AlertTriangle className="w-5 h-5 mr-3" />
        <span className="font-semibold">Este evento está CANCELADO</span>
      </div>
    );
  }

  // Si el estado no está en nuestros pasos (ej. vacío), asumimos el inicio
  const currentIndex = STEPS.findIndex((s) => s.value === currentStatus);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="w-full py-4 mb-6">
      <div className="flex items-center justify-between relative">
        {/* Línea de fondo */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10" />

        {/* Línea de progreso */}
        <div
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 transition-all duration-500 -z-10"
          style={{
            width: `${(activeIndex / (STEPS.length - 1)) * 100}%`,
          }}
        />

        {STEPS.map((step, index) => {
          const isCompleted = index < activeIndex;
          const isCurrent = index === activeIndex;

          return (
            <div
              key={step.value}
              className="flex flex-col items-center justify-center bg-white px-2 cursor-pointer group"
              onClick={() => onStatusSelect && onStatusSelect(step.value)}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  isCompleted
                    ? "bg-green-500 border-green-500 text-white"
                    : isCurrent
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg scale-110"
                    : "bg-white border-gray-300 text-gray-400"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Circle
                    className={cn("w-4 h-4", isCurrent && "fill-current")}
                  />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium mt-2 absolute -bottom-6 transition-colors duration-300 w-max",
                  isCurrent ? "text-blue-700 font-bold" : "text-gray-500"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      {/* Spacer para el texto de abajo */}
      <div className="h-6" />
    </div>
  );
};

export default EventStatusStepper;
