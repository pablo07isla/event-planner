import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  BrainCircuit,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Trans } from "@lingui/macro";

export default function AIAnalysisModal({
  isOpen,
  onClose,
  loading,
  progress, // { current, total } or null
  results, // { items: [{name, quantity, notes}], warnings: [], totalPax: 0, eventsAnalyzed: 0 }
  dateLabel,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BrainCircuit className="h-6 w-6 text-purple-600" />
            <Trans>Análisis Inteligente de Catering</Trans>
            {dateLabel && (
              <span className="text-muted-foreground">- {dateLabel}</span>
            )}
          </DialogTitle>
          <DialogDescription>
            <Trans>
              Validación y consolidación de requerimientos de alimentación
              mediante IA.
            </Trans>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 px-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
              <div className="text-center">
                <p className="text-lg font-medium text-foreground">
                  <Trans>Analizando eventos...</Trans>
                </p>
                {progress && (
                  <p className="text-sm text-muted-foreground">
                    <Trans>
                      Procesando evento {progress.current} de {progress.total}
                    </Trans>
                  </p>
                )}
              </div>
            </div>
          ) : results ? (
            <div className="space-y-6">
              {/* Resumen General */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      <Trans>Total Pax</Trans>
                    </CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="h-4 w-4 text-muted-foreground"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{results.totalPax}</div>
                    <p className="text-xs text-muted-foreground">
                      <Trans>Personas esperadas</Trans>
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      <Trans>Eventos</Trans>
                    </CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {results.eventsAnalyzed}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <Trans>Analizados hoy</Trans>
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      <Trans>Alertas</Trans>
                    </CardTitle>
                    <AlertTriangle
                      className={`h-4 w-4 ${
                        results.warnings.length > 0
                          ? "text-red-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${
                        results.warnings.length > 0 ? "text-red-500" : ""
                      }`}
                    >
                      {results.warnings.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <Trans>Inconsistencias</Trans>
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Warnings List */}
              {results.warnings.length > 0 && (
                <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle
                        className="h-5 w-5 text-yellow-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        <Trans>Atención requerida</Trans>
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <ul className="list-disc pl-5 space-y-1">
                          {results.warnings.map((warning, idx) => (
                            <li key={idx}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Grouped Meal Display */}
              <div className="space-y-4">
                {results.mealGroups &&
                Object.keys(results.mealGroups).length > 0 ? (
                  Object.entries(results.mealGroups).map(
                    ([mealType, items]) => (
                      <div key={mealType} className="rounded-lg border bg-card">
                        <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-t-lg border-b">
                          <h3 className="font-semibold text-lg capitalize">
                            {mealType === "ALMUERZO" && "🍽️ Almuerzos"}
                            {mealType === "REFRIGERIO" && "🥪 Refrigerios"}
                            {mealType === "DESAYUNO" && "☕ Desayunos"}
                            {mealType === "MENU INFANTIL" && "👶 Menú Infantil"}
                            {mealType === "VEGETARIANO" && "🥗 Vegetariano"}
                            {mealType === "OTRO" && "📦 Otros"}
                            {![
                              "ALMUERZO",
                              "REFRIGERIO",
                              "DESAYUNO",
                              "MENU INFANTIL",
                              "VEGETARIANO",
                              "OTRO",
                            ].includes(mealType) && mealType}
                          </h3>
                        </div>
                        <div className="p-4 space-y-2">
                          {items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center py-1 border-b border-dashed last:border-0"
                            >
                              <span className="text-sm font-medium">
                                {item.category}
                              </span>
                              <span className="text-lg font-bold tabular-nums">
                                {item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Trans>No se encontraron requerimientos de comida.</Trans>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter className="sm:justify-between">
          <div className="text-xs text-muted-foreground self-center">
            <Trans>Powered by Google Gemini</Trans>
          </div>
          <Button type="button" variant="secondary" onClick={onClose}>
            <Trans>Cerrar</Trans>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
