import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Eye, Download, Search } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const EventResultsTable = ({
  searchResults,
  loading,
  error,
  handleViewEvent,
  handleDownloadExcel,
}) => {
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy", { locale: es });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pendiente":
        return {
          bg: "bg-amber-200",
          text: "text-amber-800",
          dot: "bg-amber-500",
        };
      case "Con Abono":
        return {
          bg: "bg-emerald-200",
          text: "text-emerald-800",
          dot: "bg-emerald-500",
        };
      case "Pago Total":
        return {
          bg: "bg-blue-200",
          text: "text-blue-800",
          dot: "bg-blue-500",
        };
      default:
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          dot: "bg-red-500",
        };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mt-8 border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (searchResults.length === 0) {
    return (
      <Card className="mt-8">
        <CardContent className="text-center py-6">
          <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mx-auto mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">
            No hay resultados que mostrar
          </h3>
          <p className="text-muted-foreground">
            Utiliza los filtros para buscar eventos por empresa o fecha.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">
          Resultados encontrados ({searchResults.length})
        </CardTitle>
        <Button
          onClick={handleDownloadExcel}
          variant="outline"
          size="sm"
          className="ml-auto"
        >
          <Download className="mr-2 h-4 w-4" />
          Descargar Excel
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Fecha del Evento</TableHead>
              <TableHead>Correo electrónico</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {searchResults.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <div className="font-medium">{event.companyName}</div>
                  <div className="text-sm text-muted-foreground">
                    {event.peopleCount} personas
                  </div>
                </TableCell>
                <TableCell>
                  <div>{event.contactName}</div>
                  <div className="text-sm text-muted-foreground">
                    {event.contactPhone}
                  </div>
                </TableCell>
                <TableCell>{formatDate(event.start)}</TableCell>
                <TableCell>{event.email}</TableCell>
                <TableCell>
                  <Badge
                    className={`${getStatusColor(event.eventStatus).bg} ${
                      getStatusColor(event.eventStatus).text
                    } whitespace-nowrap`}
                  >
                    {event.eventStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewEvent(event)}
                    className="flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default EventResultsTable;
