import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import EventForm from "./EventForm";
import EventList from "./EventList";
import { supabase } from "../../supabaseClient";
import { Modal } from "react-bootstrap"; // Keeping React-Bootstrap ONLY for PDF modal for now to avoid z-index hell, or I can try to replace it too.
// Actually, strict requirement was "keep tailwind components", does not strictly forbid bootstrap mixed, but better to remove it.
// I will try to use shadcn dialog for PDF too, but it might need different portal.
// For safety, I'll stick to the existing portal approach for PDF if possible, or just standard Dialog.

function useCompanyData(companyGroupId) {
  const [companyData, setCompanyData] = useState(null);

  useEffect(() => {
    if (companyGroupId) {
      (async () => {
        try {
          const { data, error } = await supabase
            .from("CompanyGroups")
            .select("*")
            .eq("id", companyGroupId)
            .single();
          if (!error && data) {
            setCompanyData(data);
          }
        } catch (err) {
          console.error("Error fetching company:", err);
        }
      })();
    } else {
      setCompanyData(null);
    }
  }, [companyGroupId]);

  return { companyData };
}

export default function ModalEvent({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
}) {
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [eventForPDF, setEventForPDF] = useState(null);

  const { companyData } = useCompanyData(event?.companyGroupId);

  // Merge fetched company name into event object if available
  const eventWithCompany = {
    ...event,
    companyName: companyData?.companyName || event?.companyName || "",
  };

  const handleSave = (data) => {
    // Convert data object to FormData to match Dashboard.js expectation
    const formDataToSubmit = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === "startDate" || key === "endDate") {
        // EventForm already formats it for input, but Dashboard might expect ISO?
        // Dashboard.js line 58/59 handles mapping properties.
        // Let's pass the string value from the form (which is yyyy-MM-ddThh:mm)
        // Dashboard might re-parse it.
        // Wait, Dashboard.js assumes FormData entries.
        // Let's look at Dashboard.js handling again?
        // Dashboard logic:
        // if (key === "startDate") mappedKey = "start";
        formDataToSubmit.append(key, data[key]);
      } else if (key === "foodPackage") {
        formDataToSubmit.append(
          key,
          Array.isArray(data[key]) ? data[key].join(",") : data[key]
        );
      } else if (
        key === "pendingAmount" ||
        key === "deposit" ||
        key === "peopleCount"
      ) {
        // Ensure string for FormData
        formDataToSubmit.append(key, String(data[key]));
      } else if (key === "attachments" || key === "paymentHistory") {
        formDataToSubmit.append(key, JSON.stringify(data[key]));
      } else if (key === "companyGroupId") {
        if (data[key]) formDataToSubmit.append(key, data[key]);
      } else {
        if (data[key] !== undefined && data[key] !== null) {
          formDataToSubmit.append(key, data[key]);
        }
      }
    });

    if (event && event.id) {
      formDataToSubmit.append("id", event.id);
    }

    onSave(formDataToSubmit);
  };

  const handleGeneratePdf = () => {
    // Prepare data for PDF. EventList expects an array of events.
    // EventForm 'event' prop might be outdated if user edited fields but hasn't saved.
    // Ideally we generate PDF from the *current* form state.
    // But 'onGeneratePdf' is called from EventForm, which doesn't pass the current data back unless we ask.
    // EventForm passes `onGeneratePdf` callback.
    // For now, allow generating PDF only for Saved events (using 'event' prop).
    if (!event) return;

    const pdfEvent = {
      id: event.id,
      title: eventWithCompany.companyName,
      start: event.start,
      end: event.end,
      extendedProps: {
        ...eventWithCompany,
        // Ensure arrays
        foodPackage: Array.isArray(event.foodPackage) ? event.foodPackage : [],
        paymentHistory: Array.isArray(event.paymentHistory)
          ? event.paymentHistory
          : [],
      },
    };
    setEventForPDF([pdfEvent]);
    setShowPdfModal(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {event?.id ? "Editar Evento" : "Nuevo Evento"}
            </DialogTitle>
          </DialogHeader>

          <EventForm
            event={eventWithCompany}
            onSave={handleSave}
            onDelete={onDelete}
            onGeneratePdf={handleGeneratePdf}
            onClose={onClose}
          />
        </DialogContent>
      </Dialog>

      {/* PDF Modal using shadcn Dialog as well, with higher z-index if needed (controlled by Dialog primitive) */}
      {showPdfModal && (
        <Dialog open={showPdfModal} onOpenChange={setShowPdfModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto z-[9999]">
            <DialogHeader>
              <DialogTitle>Vista Previa PDF</DialogTitle>
            </DialogHeader>
            {eventForPDF && (
              <EventList
                events={eventForPDF}
                onClose={() => setShowPdfModal(false)}
              />
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowPdfModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cerrar
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

ModalEvent.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  event: PropTypes.object,
};
