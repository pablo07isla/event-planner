import { supabase } from "../../supabaseClient";
import MultiSelectDropdown from "../MultiSelectDropdown";
import CompanyAutocomplete from "../companies/CompanyAutocomplete";
import ModalCompany from "../companies/ModalCompany";
import EventList from "./EventList";
import { format } from "date-fns";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import ReactDOM from "react-dom";
import {
  FaFilePdf,
  FaFileAlt,
  FaFileImage,
  FaFileDownload,
  FaTrash,
  FaPaperclip,
  FaPlus,
} from "react-icons/fa";

// Hook personalizado para obtener datos de la empresa según el companyGroupId
function useCompanyData(companyGroupId) {
  const [companyData, setCompanyData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (companyGroupId) {
      (async () => {
        try {
          const { data, error } = await supabase
            .from("CompanyGroups")
            .select("*")
            .eq("id", companyGroupId)
            .single();
          if (error) throw error;
          setCompanyData(data);
          setError(null);
        } catch (err) {
          setError("No se pudieron obtener los datos de la empresa.");
          setCompanyData(null);
        }
      })();
    } else {
      setCompanyData(null);
    }
  }, [companyGroupId]);

  return { companyData, error };
}

function ModalEvent({ isOpen, onClose, onSave, onDelete, event }) {
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    companyName: "",
    peopleCount: "",
    contactName: "",
    foodPackage: [],
    contactPhone: "",
    email: "",
    eventLocation: "",
    eventDescription: "",
    deposit: "",
    pendingAmount: "",
    attachments: [],
    eventStatus: "",
    lastModified: "",
    lastModifiedBy: "",
    lastModifiedBy: "",
    companyGroupId: null,
    paymentHistory: [],
  });

  const [newPayment, setNewPayment] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const [isCompanyModalOpen, setCompanyModalOpen] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("error");
  const [, setError] = useState(null);
  const [showModal, setShowModal] = useState(false); // Estado para controlar el modal
  const [eventForPDF, setEventForPDF] = useState(null); // Estado para almacenar el evento para el PDF
  const [uploadingFiles, setUploadingFiles] = useState(false); // Estado para controlar la carga de archivos

  // Usamos el hook personalizado para obtener datos de la empresa según el event.companyGroupId
  const { companyData: fetchedCompanyData } = useCompanyData(
    event?.companyGroupId
  );

  // Efecto para manejar los estilos del modal
  useEffect(() => {
    // Crear estilos para asegurar que el modal aparezca por encima
    const styleElement = document.createElement("style");
    styleElement.id = "modal-event-styles";
    styleElement.innerHTML = `
      .modal-backdrop-high {
        z-index: 9998 !important;
      }
      .modal-open .modal {
        z-index: 9999 !important;
      }
      .pdf-preview-modal {
        z-index: 10000 !important;
      }
      .pdf-preview-modal .modal-content {
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5) !important;
      }
      body.modal-open {
        overflow: hidden;
        padding-right: 0 !important;
      }
      #pdf-modal-root {
        position: relative;
        z-index: 10000;
      }
    `;

    // Verificar si ya existe el estilo para evitar duplicados
    if (!document.getElementById("modal-event-styles")) {
      document.head.appendChild(styleElement);
    }

    // Crear un elemento para el portal del modal si no existe
    if (!document.getElementById("pdf-modal-root")) {
      const modalRoot = document.createElement("div");
      modalRoot.id = "pdf-modal-root";
      document.body.appendChild(modalRoot);
    }

    // Limpiar al desmontar
    return () => {
      const existingStyle = document.getElementById("modal-event-styles");
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  // Actualiza el estado del formulario cuando cambia la propiedad "event"
  useEffect(() => {
    if (event) {
      // Resetear mensajes cuando se abre un nuevo evento
      setMessage(null);
      setMessageType("error");
      setError(null);

      setFormData({
        ...event,
        startDate: event.start
          ? format(new Date(event.start), "yyyy-MM-dd'T'HH:mm")
          : "",
        endDate: event.end
          ? format(new Date(event.end), "yyyy-MM-dd'T'HH:mm")
          : "",
        title: event.companyName || "",
        foodPackage: Array.isArray(event.foodPackage) ? event.foodPackage : [],
        eventStatus: event.eventStatus || "",
        email: event.email || "",
        deposit: event.deposit ? event.deposit.toString() : "",
        pendingAmount:
          event.pendingAmount !== null ? event.pendingAmount.toString() : "0",
        attachments: Array.isArray(event.attachments) ? event.attachments : [],
        lastModified: event.lastModified || "",
        lastModified: event.lastModified || "",
        lastModifiedBy: event.lastModifiedBy || "",
        paymentHistory: Array.isArray(event.paymentHistory)
          ? event.paymentHistory
          : [],
      });
    }
  }, [event]);

  // Cuando se obtengan datos de la empresa, actualizamos el formulario
  useEffect(() => {
    if (fetchedCompanyData) {
      setFormData((prevState) => ({
        ...prevState,
        companyName: fetchedCompanyData.companyName,
        companyGroupId: fetchedCompanyData.id,
      }));
    }
  }, [fetchedCompanyData]);

  const handleCompanySave = async (companyFormData, action) => {
    try {
      console.log("[Modal] handleCompanySave called", {
        companyFormData,
        action,
      });
      let response;
      // Eliminar id si está vacío o falsy
      if (!companyFormData.id) {
        delete companyFormData.id;
      }
      if (action === "create") {
        console.log("[Modal] Insertando en Supabase:", companyFormData);
        const { data, error } = await supabase
          .from("CompanyGroups")
          .insert([companyFormData])
          .select();
        console.log("[Modal] Supabase insert result", { data, error });
        if (error) throw error;
        if (!data || data.length === 0) {
          const { data: fetchedData, error: fetchError } = await supabase
            .from("CompanyGroups")
            .select("*")
            .eq("identificationNumber", companyFormData.identificationNumber)
            .single();
          console.log("[Modal] Fallback fetch after insert", {
            fetchedData,
            fetchError,
          });
          if (fetchError) throw fetchError;
          if (!fetchedData) {
            throw new Error("No se pudo obtener la empresa recién creada");
          }
          response = { data: fetchedData };
        } else {
          response = { data: data[0] };
        }
        setMessage("Empresa creada exitosamente.");
        setMessageType("info");
      } else if (action === "edit") {
        if (!companyFormData.id) {
          throw new Error("ID de empresa no válido para edición");
        }
        const { data, error } = await supabase
          .from("CompanyGroups")
          .update(companyFormData)
          .eq("id", companyFormData.id)
          .select();
        console.log("[Modal] Supabase update result", { data, error });
        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error("No se recibieron datos después de la actualización");
        }
        response = { data: data[0] };
        setMessage("Empresa actualizada exitosamente.");
        setMessageType("info");
      }

      if (!response || !response.data) {
        console.error("[Modal] No response data from Supabase", response);
        throw new Error("Respuesta de Supabase no contiene datos");
      }

      setFormData((prevState) => ({
        ...prevState,
        companyName: response.data.companyName,
        companyGroupId: response.data.id,
      }));

      setCompanyModalOpen(false);
      setError(null);
      console.log("[Modal] Empresa guardada con éxito", response.data);
      return response.data; // Siempre retorna el objeto creado/actualizado
    } catch (err) {
      const errorMsg = err.message || "Ocurrió un error al guardar la empresa.";
      setError(errorMsg);
      setMessageType("error");
      setMessage(errorMsg); // Mostrar mensaje de error visible en el modal
      console.error("[Modal] Error al guardar empresa:", err);
      return errorMsg;
    }
  };

  const formatLastModified = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si se está cambiando la fecha de inicio, actualizar automáticamente la fecha fin
    if (name === "startDate" && value) {
      const startDate = new Date(value);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1);

      // Formatear la fecha fin para el input datetime-local
      const formattedEndDate = format(endDate, "yyyy-MM-dd'T'HH:mm");

      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
        endDate: formattedEndDate,
      }));

      // Cerrar el date picker haciendo blur del elemento
      setTimeout(() => {
        e.target.blur();
      }, 100);
    } else if (name === "endDate" && value) {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));

      // Cerrar el date picker haciendo blur del elemento
      setTimeout(() => {
        e.target.blur();
      }, 100);
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleFoodPackageChange = (selectedOptions) => {
    setFormData((prevState) => ({
      ...prevState,
      foodPackage: selectedOptions,
    }));
  };

  const handleMoneyChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^\d]/g, "");
    setFormData((prevState) => ({
      ...prevState,
      [name]: numericValue || "",
    }));
  };

  // Función para manejar la carga de archivos
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    setError(null);
    setMessage(null); // Limpiar mensajes anteriores

    try {
      // El bucket 'event-images' ya existe en Supabase, no intentamos crearlo
      const newAttachments = [...formData.attachments];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()
          .toString(36)
          .substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${event?.id || "new-event"}/${fileName}`;

        console.log("Subiendo archivo:", file.name, "a la ruta:", filePath);

        // Subir archivo a Supabase Storage
        const { error } = await supabase.storage
          .from("event-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error("Error al subir archivo:", error);
          throw error;
        }

        console.log("Archivo subido correctamente, obteniendo URL pública");

        // Obtener URL pública del archivo
        const { data: urlData } = supabase.storage
          .from("event-images")
          .getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl;
        console.log("URL pública generada:", publicUrl);

        // Agregar el archivo a los adjuntos
        newAttachments.push({
          name: file.name,
          url: publicUrl,
          path: filePath,
          type: file.type,
        });
      }

      setFormData((prevState) => ({
        ...prevState,
        attachments: newAttachments,
      }));

      setMessage("Archivos adjuntados correctamente");
      setMessageType("success");
    } catch (err) {
      console.error("Error al subir archivos:", err);
      setError(`Error al subir archivos: ${err.message}`);
    } finally {
      setUploadingFiles(false);
      // Limpiar el input de archivos
      e.target.value = null;
    }
  };

  // Función para eliminar un archivo adjunto
  const handleRemoveAttachment = async (index) => {
    try {
      setMessage(null); // Limpiar mensajes anteriores
      const attachmentToRemove = formData.attachments[index];
      console.log("Eliminando archivo:", attachmentToRemove);

      // Si el archivo ya está en Supabase, eliminarlo
      if (attachmentToRemove.path) {
        console.log(
          "Intentando eliminar archivo de Supabase:",
          attachmentToRemove.path
        );

        try {
          const { error } = await supabase.storage
            .from("event-images")
            .remove([attachmentToRemove.path]);

          if (error) {
            console.error("Error al eliminar archivo de Supabase:", error);
            // Continuar con la eliminación local incluso si hay error en Supabase
          } else {
            console.log("Archivo eliminado correctamente de Supabase");
          }
        } catch (storageErr) {
          console.error(
            "Error al intentar eliminar archivo de Supabase:",
            storageErr
          );
          // Continuar con la eliminación local incluso si hay error en Supabase
        }
      }

      // Eliminar el archivo de los adjuntos
      const newAttachments = [...formData.attachments];
      newAttachments.splice(index, 1);

      setFormData((prevState) => ({
        ...prevState,
        attachments: newAttachments,
      }));

      setMessage("Archivo eliminado correctamente");
      setMessageType("success");
    } catch (err) {
      console.error("Error al eliminar archivo:", err);
      setError(`Error al eliminar archivo: ${err.message}`);
    }
  };

  // Función para descargar un archivo adjunto
  const handleDownloadAttachment = async (url, fileName) => {
    try {
      setError(null);
      setMessage(null); // Limpiar mensajes anteriores

      // Verificar si la URL es válida
      if (!url) {
        throw new Error("URL de descarga no válida");
      }

      console.log("Intentando descargar archivo:", fileName, "URL:", url);

      // Extraer la ruta del archivo de la URL pública
      let filePath = "";
      try {
        // Intentar extraer la ruta del archivo de la URL
        if (url.includes("event-images/")) {
          filePath = url.split("event-images/")[1];
        } else if (url.includes("/storage/v1/object/public/")) {
          filePath = url.split("/storage/v1/object/public/event-images/")[1];
        }

        console.log("Ruta del archivo extraída:", filePath);
      } catch (e) {
        console.error("Error extracting file path from URL:", e);
      }

      // Si tenemos la ruta del archivo, intentar obtener el archivo directamente
      if (filePath) {
        try {
          // Intentar descargar el archivo directamente
          const { data, error } = await supabase.storage
            .from("event-images")
            .download(filePath);

          if (error) {
            console.error("Error downloading file directly:", error);
            // Si hay error, intentar con la URL pública
          } else if (data) {
            // Crear un objeto URL para el blob
            const blob = new Blob([data]);
            const blobUrl = URL.createObjectURL(blob);

            // Crear un enlace temporal para la descarga
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = fileName || "archivo";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Liberar el objeto URL
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

            setMessage("Archivo descargado correctamente");
            setMessageType("success");
            return;
          }
        } catch (e) {
          console.error("Error downloading file:", e);
        }
      }

      // Si no pudimos descargar directamente, intentar con la URL pública
      console.log("Intentando descargar con URL pública:", url);

      // Crear un enlace temporal para la descarga
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "archivo";
      link.target = "_blank"; // Abrir en una nueva pestaña si la descarga directa falla
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessage("Descarga iniciada");
      setMessageType("success");
    } catch (err) {
      console.error("Error al descargar archivo:", err);
      setError(`Error al descargar archivo: ${err.message}`);

      // Intentar abrir la URL en una nueva pestaña como alternativa
      window.open(url, "_blank");
    }
  };

  const handleAddPayment = () => {
    if (!newPayment.amount || !newPayment.date) {
      setMessage("Monto y Fecha son obligatorios para el pago.");
      setMessageType("error");
      return;
    }
    const amount = parseFloat(newPayment.amount);
    if (isNaN(amount)) {
      setMessage("Monto inválido.");
      setMessageType("error");
      return;
    }

    const updatedHistory = [
      ...(formData.paymentHistory || []),
      { ...newPayment, amount },
    ];

    // Recalcular el total abonado (deposit)
    const totalPaid = updatedHistory.reduce(
      (sum, p) => sum + (parseFloat(p.amount) || 0),
      0
    );

    setFormData((prev) => ({
      ...prev,
      paymentHistory: updatedHistory,
      deposit: totalPaid.toString(),
    }));

    setNewPayment({
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
    });
    setMessage("Pago agregado correctamente.");
    setMessageType("success");
  };

  const handleDeletePayment = (index) => {
    const updatedHistory = [...(formData.paymentHistory || [])];
    updatedHistory.splice(index, 1);

    // Recalcular el total abonado (deposit)
    const totalPaid = updatedHistory.reduce(
      (sum, p) => sum + (parseFloat(p.amount) || 0),
      0
    );

    setFormData((prev) => ({
      ...prev,
      paymentHistory: updatedHistory,
      deposit: totalPaid.toString(),
    }));
  };

  // Efecto para auto-ocultar los mensajes de éxito después de unos segundos
  useEffect(() => {
    let timer;
    if (message && messageType === "success") {
      timer = setTimeout(() => {
        setMessage(null);
      }, 5000); // 5 segundos
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [message, messageType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    // Validación: empresa requerida
    if (!formData.companyGroupId || formData.companyGroupId === "null") {
      setMessage(
        "Debe seleccionar una empresa válida antes de guardar el evento."
      );
      setMessageType("error");
      return;
    }

    const formDataToSubmit = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "startDate" || key === "endDate") {
        const date = new Date(formData[key]);
        formDataToSubmit.append(key, date.toISOString());
      } else if (key === "foodPackage") {
        formDataToSubmit.append(key, formData[key].join(","));
      } else if (key === "pendingAmount") {
        const value = formData[key] === "" ? "0" : formData[key];
        formDataToSubmit.append(key, value);
      } else if (key === "attachments") {
        formDataToSubmit.append(key, JSON.stringify(formData[key]));
      } else if (key === "companyGroupId") {
        // Solo agregar si es un UUID válido (no null, no string 'null', no vacío)
        if (formData.companyGroupId && formData.companyGroupId !== "null") {
          formDataToSubmit.append(key, formData.companyGroupId);
        }
      } else if (key === "paymentHistory") {
        formDataToSubmit.append(key, JSON.stringify(formData[key]));
      } else {
        formDataToSubmit.append(key, formData[key]);
      }
    });
    if (event && event.id) {
      formDataToSubmit.append("id", event.id);
    }
    onSave(formDataToSubmit);
  };

  const handleShowModal = () => {
    // Preparar el evento para el PDF
    if (event) {
      // Crear una copia del evento con la estructura esperada por EventList
      const eventForPDF = {
        id: event.id,
        title: event.companyName,
        start: event.start,
        end: event.end,
        extendedProps: {
          companyName: event.companyName,
          peopleCount: event.peopleCount,
          contactName: event.contactName,
          foodPackage: Array.isArray(event.foodPackage)
            ? event.foodPackage
            : [],
          contactPhone: event.contactPhone,
          email: event.email,
          eventLocation: event.eventLocation,
          eventDescription: event.eventDescription,
          deposit: event.deposit,
          pendingAmount: event.pendingAmount,
          eventStatus: event.eventStatus,
          paymentHistory: Array.isArray(event.paymentHistory)
            ? event.paymentHistory
            : [],
        },
      };
      setEventForPDF([eventForPDF]); // Guardar como array para EventList
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleClose = () => {
    // Resetear mensajes cuando se cierra el modal
    setMessage(null);
    setMessageType("error");
    setError(null);

    // Llamar a la función onClose pasada como prop
    onClose();
  };

  if (!isOpen) return null;

  // Renderizar el modal de PDF en un portal
  const renderPDFModal = () => {
    const modalRoot = document.getElementById("pdf-modal-root");
    if (!modalRoot) return null;

    return ReactDOM.createPortal(
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        size="lg"
        centered
        className="rounded-lg pdf-preview-modal"
        style={{ zIndex: 10000 }}
        backdropClassName="modal-backdrop-high"
        dialogClassName="pdf-preview-dialog"
        animation={true}
      >
        <Modal.Body className="p-6">
          {eventForPDF && (
            <EventList events={eventForPDF} onClose={handleCloseModal} />
          )}
        </Modal.Body>
        <Modal.Footer className="border-t border-gray-200 p-4">
          <button
            onClick={handleCloseModal}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out text-sm flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Cerrar
          </button>
        </Modal.Footer>
      </Modal>,
      modalRoot
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-800 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-[9999]">
        <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transition-transform duration-300 ease-in-out transform">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              {event?.id ? "Editar Evento" : "Nuevo Evento"}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition duration-150 ease-in-out"
            >
              &times;
            </button>
          </div>
          {event?.id && (
            <div className="mb-4 text-sm text-gray-400">
              Última modificación: {formatLastModified(formData.lastModified)}{" "}
              por {formData.lastModifiedBy}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="w-full">
                <label
                  htmlFor="startDate"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Fecha Inicio <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Fecha Inicio"
                  required
                />
              </div>
              <div className="w-full">
                <label
                  htmlFor="endDate"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Fecha Fin <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 w-full p-2.5"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="companyName"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Nombre Empresa/Grupo{" "}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <CompanyAutocomplete
                  value={{
                    companyName: formData.companyName,
                    companyGroupId: formData.companyGroupId,
                  }}
                  onChange={(company) => {
                    setFormData((prev) => ({
                      ...prev,
                      companyName: company.companyName,
                      companyGroupId: company.companyGroupId || null,
                    }));
                    // Si es nueva, abrir el modal de creación
                    if (company.isNew) setCompanyModalOpen(true);
                  }}
                  placeholder="Buscar o crear empresa/grupo..."
                />
              </div>
              <div>
                <label
                  htmlFor="contactName"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Nombre Responsable/Contacto{" "}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  id="contactName"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Nombre Responsable/Contacto"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="contactPhone"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Teléfono de Contacto{" "}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Teléfono de Contacto"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Email <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Email"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="peopleCount"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  N° de personas <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="number"
                  id="peopleCount"
                  name="peopleCount"
                  value={formData.peopleCount}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="N° Personas"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="eventLocation"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Lugar del Evento
                </label>
                <input
                  type="text"
                  id="eventLocation"
                  name="eventLocation"
                  value={formData.eventLocation}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 w-full p-2.5"
                  placeholder="Lugar del Evento"
                />
              </div>
              <div className="col-span-2">
                <label
                  htmlFor="foodPackage"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Paquete de alimentación
                </label>
                <MultiSelectDropdown
                  options={[
                    { value: "Paquete 1", label: "Paquete 1" },
                    { value: "Paquete 2", label: "Paquete 2" },
                    { value: "Paquete 3", label: "Paquete 3" },
                    { value: "Desayuno", label: "Desayuno" },
                    { value: "Refrigerio", label: "Refrigerio" },
                    { value: "Auditorio", label: "Auditorio" },
                  ]}
                  selectedValues={formData.foodPackage}
                  onChange={handleFoodPackageChange}
                  placeholder="Seleccionar paquetes de alimentación"
                />
              </div>
            </div>
            <div className="col-span-2">
              <label
                htmlFor="eventDescription"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Descripción del Evento
              </label>
              <textarea
                id="eventDescription"
                name="eventDescription"
                value={formData.eventDescription}
                onChange={handleChange}
                rows="5"
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Descripción del Evento"
              ></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sección de Historial de Pagos */}
              <div className="col-span-1 md:col-span-2 border rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Historial de Pagos / Abonos
                </h3>

                {/* Tabla de pagos existentes */}
                {formData.paymentHistory &&
                formData.paymentHistory.length > 0 ? (
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Monto
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Descripción
                          </th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.paymentHistory.map((payment, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                              {payment.date}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                              {payment.description}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                type="button"
                                onClick={() => handleDeletePayment(index)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td className="px-3 py-2 text-sm font-bold text-gray-900">
                            Total Abonado:
                          </td>
                          <td className="px-3 py-2 text-sm font-bold text-gray-900">
                            {formatCurrency(formData.deposit)}
                          </td>
                          <td colSpan="2"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-4 italic">
                    No hay pagos registrados.
                  </p>
                )}

                {/* Formulario para agregar nuevo pago */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-white p-3 rounded border">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={newPayment.date}
                      onChange={(e) =>
                        setNewPayment({ ...newPayment, date: e.target.value })
                      }
                      className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Monto
                    </label>
                    <input
                      type="number"
                      value={newPayment.amount}
                      onChange={(e) =>
                        setNewPayment({ ...newPayment, amount: e.target.value })
                      }
                      placeholder="0"
                      className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={newPayment.description}
                      onChange={(e) =>
                        setNewPayment({
                          ...newPayment,
                          description: e.target.value,
                        })
                      }
                      placeholder="Ej. Anticipo"
                      className="block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleAddPayment}
                      className="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <FaPlus className="mr-1" /> Agregar
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <label
                  htmlFor="pendingAmount"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Saldo Pendiente
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm"></span>
                  </div>
                  <input
                    type="text"
                    id="pendingAmount"
                    name="pendingAmount"
                    value={formatCurrency(formData.pendingAmount) || "0"}
                    onChange={handleMoneyChange}
                    className="pl-7 pr-12 block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="eventStatus"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Estado del Evento
                </label>
                <select
                  id="eventStatus"
                  name="eventStatus"
                  value={formData.eventStatus}
                  onChange={handleChange}
                  className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Seleccione un estado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Con Abono">Con Abono</option>
                  <option value="Pago Total">Pago Total</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            {/* Sección de archivos adjuntos */}
            <div className="col-span-2">
              <label
                htmlFor="attachments"
                className="block mb-2 text-sm font-medium text-gray-900 items-center"
              >
                <FaPaperclip className="mr-2" /> Archivos Adjuntos
              </label>

              {/* Lista de archivos adjuntos */}
              {formData.attachments && formData.attachments.length > 0 && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {formData.attachments.map((attachment, index) => (
                      <li
                        key={index}
                        className="py-3 flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          {attachment.type &&
                          attachment.type.includes("image") ? (
                            <FaFileImage className="text-blue-500 mr-2" />
                          ) : (
                            <FaFileAlt className="text-gray-500 mr-2" />
                          )}
                          <span
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            onClick={() =>
                              handleDownloadAttachment(
                                attachment.url,
                                attachment.name
                              )
                            }
                          >
                            {attachment.name}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleDownloadAttachment(
                                attachment.url,
                                attachment.name
                              )
                            }
                            className="text-blue-500 hover:text-blue-700"
                            title="Descargar archivo"
                          >
                            <FaFileDownload />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(index)}
                            className="text-red-500 hover:text-red-700"
                            title="Eliminar archivo"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Input para subir archivos */}
              <div className="mt-2">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition duration-150 ease-in-out text-sm"
                >
                  <FaPaperclip className="mr-2" />
                  {uploadingFiles
                    ? "Subiendo archivos..."
                    : "Adjuntar archivos"}
                </label>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadingFiles}
                />
                <span className="ml-2 text-xs text-gray-500">
                  Se permiten imágenes y documentos
                </span>
              </div>
            </div>

            {/* Mensajes de éxito o error */}
            {message && (
              <div
                className={`p-4 rounded-lg ${
                  messageType === "error"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {message}
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              {event && event.id && (
                <button
                  type="button"
                  onClick={handleShowModal}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out text-sm flex items-center"
                >
                  <FaFilePdf className="me-2" />
                  PDF
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out text-sm"
              >
                Guardar
              </button>
              {event && event.id && (
                <button
                  type="button"
                  onClick={() => {
                    console.log("[ModalEvent] Delete clicked, event:", event);
                    onDelete(event.id);
                  }}
                  className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-150 ease-in-out text-sm"
                >
                  Eliminar
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out text-sm"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de Compañía */}
      <ModalCompany
        isOpen={isCompanyModalOpen}
        onClose={() => setCompanyModalOpen(false)}
        onSave={handleCompanySave}
        companyData={fetchedCompanyData}
      />

      {/* Renderizar el modal de PDF en un portal */}
      {renderPDFModal()}
    </>
  );
}

ModalEvent.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  event: PropTypes.shape({
    id: PropTypes.string,
    start: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    end: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    companyName: PropTypes.string,
    peopleCount: PropTypes.string,
    contactName: PropTypes.string,
    foodPackage: PropTypes.arrayOf(PropTypes.string),
    contactPhone: PropTypes.string,
    email: PropTypes.string,
    eventLocation: PropTypes.string,
    eventDescription: PropTypes.string,
    deposit: PropTypes.string,
    pendingAmount: PropTypes.string,
    eventStatus: PropTypes.string,
    attachments: PropTypes.arrayOf(PropTypes.object),
    lastModified: PropTypes.string,
    lastModifiedBy: PropTypes.string,
  }),
};

export default ModalEvent;
