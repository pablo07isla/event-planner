import {
  getLocalDateString,
  formatDate,
  formatCurrency,
} from "../../utils/eventPdfUtils";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import React from "react";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#f8f9fa",
  },

  // Header con fecha
  dateHeader: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  calendarIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    backgroundColor: "#666",
    borderRadius: 2,
  },

  dateText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
  },

  // Card principal del evento
  eventCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  // Header azul del evento
  eventHeader: {
    backgroundColor: "#4285f4",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    flex: 1,
  },

  peopleCountBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 50,
    textAlign: "center",
  },

  peopleCountText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "500",
  },

  // Contenido del evento
  eventContent: {
    padding: 16,
  },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: 8,
  },

  infoItemFull: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 8,
  },

  icon: {
    width: 12,
    height: 12,
    marginRight: 8,
    borderRadius: 2,
  },

  locationIcon: {
    backgroundColor: "#34a853",
  },

  personIcon: {
    backgroundColor: "#4285f4",
  },

  phoneIcon: {
    backgroundColor: "#4285f4",
  },

  moneyIcon: {
    backgroundColor: "#34a853",
  },

  debtIcon: {
    backgroundColor: "#ea4335",
  },

  foodIcon: {
    backgroundColor: "#ff9800",
  },

  infoLabel: {
    fontSize: 9,
    color: "#666",
    fontWeight: "500",
    marginRight: 4,
  },

  infoValue: {
    fontSize: 9,
    color: "#333",
    flex: 1,
  },

  moneyValue: {
    fontSize: 10,
    fontWeight: "600",
  },

  positiveAmount: {
    color: "#34a853",
  },

  negativeAmount: {
    color: "#ea4335",
  },

  // Sección de descripción
  descriptionSection: {
    marginTop: 8,
    paddingTop: 12,
    borderTop: "1pt solid #eee",
  },

  descriptionLabel: {
    fontSize: 9,
    color: "#666",
    fontWeight: "600",
    marginBottom: 4,
  },

  descriptionText: {
    fontSize: 9,
    color: "#555",
    lineHeight: 1.4,
    fontStyle: "italic",
  },

  // Título principal
  mainHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
});

const EventListPDF = ({ events }) => {
  // Agrupa eventos por fecha local
  const grouped = events.reduce((acc, ev) => {
    const date = getLocalDateString(ev.start);
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
        <Text style={styles.mainHeader}>Lista de Eventos</Text>

        {sortedDates.map((date) => (
          <View key={date}>
            {/* Header de fecha */}
            <View style={styles.dateHeader}>
              <View style={styles.calendarIcon} />
              <Text style={styles.dateText}>{formatDate(date)}</Text>
            </View>

            {/* Eventos de esa fecha */}
            {grouped[date].map((event) => (
              <View key={event.id} style={styles.eventCard} wrap={false}>
                {/* Header azul con nombre y cantidad de personas */}
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>
                    {event.extendedProps?.companyName || "Evento sin nombre"}
                  </Text>
                  <View style={styles.peopleCountBadge}>
                    <Text style={styles.peopleCountText}>
                      {event.extendedProps?.peopleCount || "0"} pax
                    </Text>
                  </View>
                </View>

                {/* Contenido del evento */}
                <View style={styles.eventContent}>
                  {/* Grid de información */}
                  <View style={styles.infoGrid}>
                    {/* Lugar */}
                    <View style={styles.infoItem}>
                      <View style={[styles.icon, styles.locationIcon]} />
                      <Text style={styles.infoLabel}>Lugar:</Text>
                      <Text style={styles.infoValue}>
                        {event.extendedProps?.eventLocation ||
                          "No especificado"}
                      </Text>
                    </View>

                    {/* Consignación */}
                    <View style={styles.infoItem}>
                      <View style={[styles.icon, styles.moneyIcon]} />
                      <Text style={styles.infoLabel}>Consignación:</Text>
                      <Text
                        style={[
                          styles.infoValue,
                          styles.moneyValue,
                          styles.positiveAmount,
                        ]}
                      >
                        {formatCurrency(event.extendedProps?.deposit)}
                      </Text>
                    </View>

                    {/* Responsable */}
                    <View style={styles.infoItem}>
                      <View style={[styles.icon, styles.personIcon]} />
                      <Text style={styles.infoLabel}>Responsable:</Text>
                      <Text style={styles.infoValue}>
                        {event.extendedProps?.contactName || "N/A"}
                      </Text>
                    </View>

                    {/* Saldo Pendiente */}
                    <View style={styles.infoItem}>
                      <View style={[styles.icon, styles.debtIcon]} />
                      <Text style={styles.infoLabel}>Saldo Pendiente:</Text>
                      <Text
                        style={[
                          styles.infoValue,
                          styles.moneyValue,
                          styles.negativeAmount,
                        ]}
                      >
                        {formatCurrency(event.extendedProps?.pendingAmount)}
                      </Text>
                    </View>

                    {/* Teléfonos */}
                    <View style={styles.infoItemFull}>
                      <View style={[styles.icon, styles.phoneIcon]} />
                      <Text style={styles.infoLabel}>Teléfonos:</Text>
                      <Text style={styles.infoValue}>
                        {event.extendedProps?.contactPhone || "N/A"}
                      </Text>
                    </View>

                    {/* Alimentación */}
                    <View style={styles.infoItemFull}>
                      <View style={[styles.icon, styles.foodIcon]} />
                      <Text style={styles.infoLabel}>Alimentación:</Text>
                      <Text style={styles.infoValue}>
                        {(event.extendedProps?.foodPackage || []).join(", ") ||
                          "No especificado"}
                      </Text>
                    </View>
                  </View>

                  {/* Descripción */}
                  {event.extendedProps?.eventDescription && (
                    <View style={styles.descriptionSection}>
                      <Text style={styles.descriptionLabel}>Descripción</Text>
                      <Text style={styles.descriptionText}>
                        {event.extendedProps.eventDescription}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
};

export default EventListPDF;
