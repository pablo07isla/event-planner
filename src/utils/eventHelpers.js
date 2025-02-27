export const getEventColor = (status) => {
  switch (status) {
    case "Pendiente":
      return { backgroundColor: "#FFA500", textColor: "#1F2937" };
    case "Con Abono":
      return { backgroundColor: "#4CAF50", textColor: "#FFFFFF" };
    case "Pago Total":
      return { backgroundColor: "#2196F3", textColor: "#FFFFFF" };
    case "Cancelado":
      return { backgroundColor: "#F44336", textColor: "#FFFFFF" };
    default:
      return { backgroundColor: "#9E9E9E", textColor: "#FFFFFF" };
  }
};

export const applyEventColor = (event) => {
  const colors = getEventColor(event.eventStatus);
  return {
    ...event,
    backgroundColor: colors.backgroundColor,
    borderColor: colors.backgroundColor,
    textColor: colors.textColor
  };
}; 