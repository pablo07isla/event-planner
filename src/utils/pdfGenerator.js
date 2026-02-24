import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

/**
 * Generate a PDF report for Catering Analysis
 * @param {Object} results - The analysis results object
 * @param {string} dateLabel - The date label for the report
 */
export const generateCateringPDF = (results, dateLabel) => {
  try {
    const doc = new jsPDF();

    // Colores corporativos
    const primaryColor = [74, 21, 75]; // Slack purple
    const secondaryColor = [240, 240, 240];
    const textColor = [50, 50, 50];

    let yPos = 20;

    // --- HEADER ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`Análisis de Catering`, 14, yPos);

    if (dateLabel) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      yPos += 7;
      doc.text(`Fecha Contexto: ${dateLabel}`, 14, yPos);
    }

    yPos += 12;

    // --- TOTALES ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text("Totales", 14, yPos);
    yPos += 5;

    autoTable(doc, {
      startY: yPos,
      head: [["Métrica", "Valor"]],
      body: [
        ["Total Pax (Personas)", `${results.totalPax} pax`],
        ["Eventos Analizados", `${results.eventsAnalyzed}`],
      ],
      theme: "grid",
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      styles: { fontSize: 11, cellPadding: 4 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 100 } },
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // --- ALERTAS ---
    if (results.warnings && results.warnings.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(220, 53, 69); // Rojo peligro
      doc.text(`Alertas (${results.warnings.length})`, 14, yPos);
      yPos += 5;

      const warningsBody = results.warnings.map((w) => [`• ${w}`]);
      autoTable(doc, {
        startY: yPos,
        body: warningsBody,
        theme: "plain",
        styles: { textColor: [220, 53, 69], fontSize: 10, cellPadding: 2 },
      });

      yPos = doc.lastAutoTable.finalY + 10;
    }

    // --- DETALLE DE COMIDAS ---
    if (results.mealGroups && Object.keys(results.mealGroups).length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("Detalle de Comidas", 14, yPos);
      yPos += 8;

      Object.entries(results.mealGroups).forEach(([type, items]) => {
        // Check page break
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text(type.toUpperCase(), 14, yPos);
        yPos += 4;

        const tableBody = items.map((item) => [item.quantity, item.category]);

        autoTable(doc, {
          startY: yPos,
          head: [["Cantidad", "Ítem / Categoría"]],
          body: tableBody,
          theme: "striped",
          headStyles: {
            fillColor: secondaryColor,
            textColor: [0, 0, 0],
            fontStyle: "bold",
          },
          styles: { fontSize: 10, cellPadding: 3 },
          columnStyles: {
            0: { cellWidth: 40, fontStyle: "bold", halign: "center" },
            1: { cellWidth: 140 },
          },
          margin: { left: 14 },
        });

        yPos = doc.lastAutoTable.finalY + 10;
      });
    }

    // --- PIE DE PÁGINA ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Generado por IA Los Arrayanes - Página ${i} de ${pageCount}`,
        14,
        285,
      );
    }

    const fileName = `analisis_catering${dateLabel ? `_${dateLabel.replace(/\s+/g, "_")}` : ""}.pdf`;
    doc.save(fileName);
    toast.success("PDF generado exitosamente");
  } catch (error) {
    console.error("Error generating PDF:", error);
    toast.error("Error al generar el PDF");
  }
};
