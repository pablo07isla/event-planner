import React, { useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export const formatCurrency = (value) => {
  if (value === null || value === undefined) return "0";
  const numericValue = Number(value);
  if (isNaN(numericValue)) return "0";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericValue);
};

export default function PaymentHistory({
  paymentHistory = [],
  deposit,
  onAddPayment,
  onDeletePayment,
}) {
  const [newPayment, setNewPayment] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const handleAdd = () => {
    if (!newPayment.amount || !newPayment.date) return;
    onAddPayment(newPayment);
    setNewPayment({
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
    });
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50/50">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Historial de Pagos / Abonos
      </h3>

      <div className="rounded-md border bg-white mb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentHistory.length > 0 ? (
              paymentHistory.map((payment, index) => (
                <TableRow key={index}>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>{payment.description}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/90"
                      onClick={() => onDeletePayment(index)}
                      type="button"
                    >
                      <FaTrash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  No hay pagos registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-bold">Total Abonado:</TableCell>
              <TableCell className="font-bold">
                {formatCurrency(deposit)}
              </TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-white p-3 rounded border">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Fecha
          </label>
          <Input
            type="date"
            value={newPayment.date}
            onChange={(e) =>
              setNewPayment({ ...newPayment, date: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Monto
          </label>
          <Input
            type="number"
            value={newPayment.amount}
            onChange={(e) =>
              setNewPayment({ ...newPayment, amount: e.target.value })
            }
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <Input
            type="text"
            value={newPayment.description}
            onChange={(e) =>
              setNewPayment({
                ...newPayment,
                description: e.target.value,
              })
            }
            placeholder="Ej. Anticipo"
          />
        </div>
        <div>
          <Button
            onClick={handleAdd}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            type="button"
          >
            <FaPlus className="mr-2 h-4 w-4" /> Agregar
          </Button>
        </div>
      </div>
    </div>
  );
}
