import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import React from "react";

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 12, fontFamily: "Helvetica" },
  section: { marginBottom: 16 },
  header: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  eventCard: {
    border: "1pt solid #eee",
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
  },
  eventTitle: { fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  row: { flexDirection: "row", marginBottom: 2 },
  label: { width: 90, fontWeight: "bold" },
  value: {},
  description: { marginTop: 6, fontStyle: "italic" },
});

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const formatCurrency = (value) => {
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

const EventListPDF = ({ events }) => {
  // Agrupa eventos por fecha
  const grouped = events.reduce((acc, ev) => {
    const date = new Date(ev.start).toISOString().split("T")[0];
    acc[date] = acc[date] || [];
    acc[date].push(ev);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.header}>Lista de Eventos</Text>
        {sortedDates.map((date) => (
          <View key={date} style={styles.section}>
            <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
              {formatDate(date)}
            </Text>
            {grouped[date].map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <Text style={styles.eventTitle}>
                  {event.extendedProps?.companyName || "Evento sin nombre"}
                </Text>
                <View style={styles.row}>
                  <Text style={styles.label}>Personas:</Text>
                  <Text style={styles.value}>
                    {event.extendedProps?.peopleCount || "N/A"}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Lugar:</Text>
                  <Text style={styles.value}>
                    {event.extendedProps?.eventLocation || "No especificado"}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Responsable:</Text>
                  <Text style={styles.value}>
                    {event.extendedProps?.contactName || "N/A"}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Teléfonos:</Text>
                  <Text style={styles.value}>
                    {event.extendedProps?.contactPhone || "N/A"}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Consignación:</Text>
                  <Text style={styles.value}>
                    {formatCurrency(event.extendedProps?.deposit)}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Saldo Pendiente:</Text>
                  <Text style={styles.value}>
                    {formatCurrency(event.extendedProps?.pendingAmount)}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Alimentación:</Text>
                  <Text style={styles.value}>
                    {(event.extendedProps?.foodPackage || []).join(", ") ||
                      "No especificado"}
                  </Text>
                </View>
                <Text style={styles.description}>
                  {event.extendedProps?.eventDescription ||
                    "No hay descripción disponible"}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
};

export default EventListPDF;
