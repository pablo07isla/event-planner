import { supabase } from "../supabaseClient";

export const useEventMutations = ({
  setModalOpen,
  setError,
  onSuccess,
  currentEvent,
}) => {
  const handleSaveEvent = async (formData) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("user"));

      const foodPackageArray = formData.get("foodPackage")
        ? formData.get("foodPackage").split(",")
        : [];
      const foodPackagePostgres = `{${foodPackageArray
        .map((item) => `"${item}"`)
        .join(",")}}`;

      let attachments = [];
      try {
        const attachmentsStr = formData.get("attachments");
        if (attachmentsStr) {
          attachments = JSON.parse(attachmentsStr);
          attachments = attachments.map((attachment) => ({
            name: attachment.name,
            url: attachment.url,
            path: attachment.path,
          }));
        }
      } catch (e) {
        console.error("Error parsing attachments:", e);
        attachments = [];
      }

      let paymentHistory = [];
      try {
        const paymentHistoryStr = formData.get("paymentHistory");
        if (paymentHistoryStr) {
          paymentHistory = JSON.parse(paymentHistoryStr);
        }
      } catch (e) {
        console.error("Error parsing paymentHistory:", e);
        paymentHistory = [];
      }

      const deposit = formData.get("deposit");
      const pendingAmount = formData.get("pendingAmount");
      const peopleCount = formData.get("peopleCount");

      const eventData = {
        start: new Date(formData.get("startDate")).toISOString(),
        end: new Date(formData.get("endDate")).toISOString(),
        companyName: formData.get("companyName"),
        peopleCount: peopleCount ? parseInt(peopleCount, 10) || 0 : 0,
        contactName: formData.get("contactName"),
        foodPackage: foodPackagePostgres,
        contactPhone: formData.get("contactPhone"),
        email: formData.get("email"),
        eventLocation: formData.get("eventLocation"),
        eventDescription: formData.get("eventDescription"),
        deposit: deposit ? parseFloat(deposit.replace(/[^\d.-]/g, "")) || 0 : 0,
        pendingAmount: pendingAmount
          ? parseFloat(pendingAmount.replace(/[^\d.-]/g, "")) || 0
          : 0,
        eventStatus: formData.get("eventStatus"),
        lastModified: new Date().toISOString(),
        lastModifiedBy: currentUser
          ? currentUser.username
          : "Usuario desconocido",
        companyGroupId: formData.get("companyGroupId"),
        attachments: attachments,
        paymentHistory: paymentHistory,
      };

      console.log("Saving event with data:", eventData);

      let response;
      if (formData.get("id")) {
        const { data, error } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", formData.get("id"))
          .select();
        if (error) throw error;
        response = { data };
      } else {
        const { data, error } = await supabase
          .from("events")
          .insert([eventData])
          .select();
        if (error) throw error;
        response = { data };
      }

      if (!response.data || response.data.length === 0) {
        throw new Error("No se recibieron datos después de guardar el evento");
      }

      await onSuccess();
      setModalOpen(false);
    } catch (err) {
      console.error("Error detailed save event:", err);
      setError(`Error al guardar el evento: ${err.message}`);
    }
  };

  const handleDeleteEvent = async () => {
    try {
      if (currentEvent && currentEvent.id) {
        await supabase.from("events").delete().eq("id", currentEvent.id);
        await onSuccess(); // Actually we might want to pass a specific deletion handler or just refresh all
        setModalOpen(false);
      }
    } catch (err) {
      console.error("Error deleting event:", err);
      setError("Error al eliminar el evento. Por favor, inténtelo de nuevo.");
    }
  };

  return {
    handleSaveEvent,
    handleDeleteEvent,
  };
};
