import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import CompanyAutocomplete from "../companies/CompanyAutocomplete";
import MultiSelectDropdown from "../MultiSelectDropdown";
import PaymentHistory, { formatCurrency } from "./PaymentHistory";
import AttachmentList from "./AttachmentList";
import { supabase } from "../../supabaseClient";
import { toast } from "sonner";
import { FaFilePdf } from "react-icons/fa";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

const formSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  startDate: z.string().min(1, "Fecha Inicio es requerida"),
  endDate: z.string().min(1, "Fecha Fin es requerida"),
  companyName: z.string().min(1, "Nombre Empresa/Grupo es requerido"),
  companyGroupId: z.any(), // Can be string or number or null
  peopleCount: z.union([
    z.string().length(0),
    z.coerce.number().min(1, "N° de personas es requerido"),
  ]),
  contact_id: z.string().optional(),
  contactName: z.string().min(1, "Nombre Responsable es requerido"),
  contactPhone: z.string().min(1, "Teléfono es requerido"),
  email: z.string().email("Email inválido").min(1, "Email es requerido"),
  eventLocation: z.string().optional(),
  foodPackage: z.array(z.string()).optional(),
  eventDescription: z.string().optional(),
  event_category: z.string().min(1, "Categoría es requerida"), // New
  event_type: z.string().min(1, "Tipo de evento es requerido"),
  lead_source: z.string().optional(),
  deposit: z.coerce.string().optional(),
  total_cost: z.coerce.string().optional(),
  pendingAmount: z.coerce.string().optional(),
  eventStatus: z.string().min(1, "Estado es requerido"),
  paymentHistory: z.array(z.any()).optional(),
  attachments: z.array(z.any()).optional(),
  createdAt: z.string().optional(),
  lastModified: z.string().optional(),
  lastModifiedBy: z.string().optional(),
});

const EVENT_CATEGORIES = {
  Empresarial: [
    "Evento fin de Año (Comida, cena, Integracion)",
    "Capacitacion",
    "Conferencias/Convenciones",
    "Integracion Trabajadores/Dia de la Familia",
    "Otros",
  ],
  Social: [
    "Integracion fin de año",
    "Cumpleaños/Aniversario",
    "Boda",
    "Grado",
    "Fiesta 15 Años",
    "Otros",
  ],
};

export default function EventForm({
  event,
  onSave,
  onDelete,
  onGeneratePdf,
  onClose,
}) {
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      startDate: "",
      endDate: "",
      companyName: "",
      companyGroupId: null,
      contactName: "",
      contactPhone: "",
      email: "",
      peopleCount: "",
      eventLocation: "",
      foodPackage: [],
      eventDescription: "",
      event_category: "", // New
      event_type: "",
      lead_source: "",
      deposit: "0",
      total_cost: "0",
      pendingAmount: "0",
      eventStatus: "",
      paymentHistory: [],
      attachments: [],
    },
  });

  const [companyContacts, setCompanyContacts] = useState([]);

  // Watch category to update specific types
  const selectedCategory = form.watch("event_category");

  const [loadingContacts, setLoadingContacts] = useState(false);

  // Fetch contacts whenever companyGroupId changes
  const selectedGroupId = form.watch("companyGroupId");
  useEffect(() => {
    async function fetchContacts() {
      if (!selectedGroupId) {
        setCompanyContacts([]);
        return;
      }
      setLoadingContacts(true);
      const { data, error } = await supabase
        .from("CompanyContacts")
        .select("*")
        .eq("company_id", selectedGroupId);

      if (!error && data) {
        setCompanyContacts(data);
      } else {
        console.error("Error fetching contacts:", error);
      }
      setLoadingContacts(false);
    }
    fetchContacts();
  }, [selectedGroupId]);

  useEffect(() => {
    if (event) {
      form.reset({
        id: event.id,
        startDate: event.start
          ? format(new Date(event.start), "yyyy-MM-dd'T'HH:mm")
          : "",
        endDate: event.end
          ? format(new Date(event.end), "yyyy-MM-dd'T'HH:mm")
          : "",
        companyName: event.companyName || "",
        companyGroupId: event.companyGroupId || null,
        contactName: event.contactName || "",
        contactPhone: event.contactPhone || "",
        email: event.email || "",
        peopleCount: event.peopleCount || "",
        eventLocation: event.eventLocation || "",
        foodPackage: Array.isArray(event.foodPackage) ? event.foodPackage : [],
        eventDescription: event.eventDescription || "",
        event_category: event.event_category || "",
        event_type: event.event_type || "",
        lead_source: event.lead_source || "",
        deposit: event.deposit ? String(event.deposit) : "0",
        total_cost: event.total_cost ? String(event.total_cost) : "0",
        pendingAmount:
          event.pendingAmount !== null ? String(event.pendingAmount) : "0",
        // Note: For existing events, we might have contactName but no contact_id yet if simpler migration was run.
        // Ideally we prefer contact_id.
        contact_id: event.contact_id || "",
        eventStatus: event.eventStatus || "",
        paymentHistory: Array.isArray(event.paymentHistory)
          ? event.paymentHistory
          : [],
        attachments: Array.isArray(event.attachments) ? event.attachments : [],
        lastModified: event.lastModified || "",
        lastModifiedBy: event.lastModifiedBy || "",
      });
    }
  }, [event, form]);

  const handleStartDateChange = (e) => {
    const startDateVal = e.target.value;
    form.setValue("startDate", startDateVal);

    if (startDateVal) {
      const startDate = new Date(startDateVal);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1);
      const formattedEndDate = format(endDate, "yyyy-MM-dd'T'HH:mm");
      form.setValue("endDate", formattedEndDate);
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Require event to be saved before uploading files
    if (!event?.id) {
      toast.error("Por favor guarda el evento antes de adjuntar archivos");
      e.target.value = null;
      return;
    }

    setUploadingFiles(true);
    try {
      const currentAttachments = form.getValues("attachments") || [];
      const newAttachments = [...currentAttachments];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()
          .toString(36)
          .substring(2, 15)}_${Date.now()}.${fileExt}`;

        // Use event ID if it exists, otherwise generate a unique temporary ID
        // This ensures files are stored in a unique folder even for new events
        const eventFolder =
          event?.id ||
          `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const filePath = `${eventFolder}/${fileName}`;

        const { error } = await supabase.storage
          .from("event-images")
          .upload(filePath, file, { cacheControl: "3600", upsert: false });

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from("event-images")
          .getPublicUrl(filePath);

        newAttachments.push({
          name: file.name,
          url: urlData.publicUrl,
          path: filePath,
          type: file.type,
        });
      }
      form.setValue("attachments", newAttachments);
      toast.success("Archivos adjuntados correctamente");
    } catch (err) {
      console.error("Error upload:", err);
      toast.error(`Error al subir archivos: ${err.message}`);
    } finally {
      setUploadingFiles(false);
      e.target.value = null;
    }
  };

  const handleRemoveAttachment = async (index) => {
    const currentAttachments = form.getValues("attachments") || [];
    const attachmentToRemove = currentAttachments[index];

    if (attachmentToRemove.path) {
      try {
        await supabase.storage
          .from("event-images")
          .remove([attachmentToRemove.path]);
      } catch (err) {
        console.error("Error deleting from storage:", err);
      }
    }

    const newAttachments = currentAttachments.filter((_, i) => i !== index);
    form.setValue("attachments", newAttachments);
    toast.success("Archivo eliminado");
  };

  const handleAddPayment = (payment) => {
    const currentHistory = form.getValues("paymentHistory") || [];
    const updatedHistory = [...currentHistory, payment];

    const totalPaid = updatedHistory.reduce(
      (sum, p) => sum + (parseFloat(p.amount) || 0),
      0
    );

    form.setValue("paymentHistory", updatedHistory);
    form.setValue("deposit", String(totalPaid));
  };

  const handleDeletePayment = (index) => {
    const currentHistory = form.getValues("paymentHistory") || [];
    const updatedHistory = currentHistory.filter((_, i) => i !== index);

    const totalPaid = updatedHistory.reduce(
      (sum, p) => sum + (parseFloat(p.amount) || 0),
      0
    );

    form.setValue("paymentHistory", updatedHistory);
    form.setValue("deposit", String(totalPaid));
  };

  // Auto-calculate pending amount when total_cost or deposit changes
  const watchedTotalCost = form.watch("total_cost");
  const watchedDeposit = form.watch("deposit");

  useEffect(() => {
    const total = parseFloat(watchedTotalCost) || 0;
    const paid = parseFloat(watchedDeposit) || 0;
    const pending = Math.max(0, total - paid);
    form.setValue("pendingAmount", String(pending));
  }, [watchedTotalCost, watchedDeposit, form]);

  const onSubmit = async (data) => {
    if (!data.companyGroupId && !data.companyName) {
      toast.error("Debe seleccionar una empresa válida");
      return;
    }

    setUploadingFiles(true); // Reusing this loading state or adding a new one
    try {
      let finalContactId = data.contact_id;

      // Handle new contact creation
      if (data.contact_id === "NEW" || (!data.contact_id && data.contactName)) {
        if (!data.companyGroupId) {
          // If it's a new company too, it will be handled by the backend or we should wait?
          // Actually, Dashboard handleSaveEvent handles company identification.
          // But we need the ID here.
          // This case is tricky if both company and contact are new.
          // Let's assume for now the company exists (since Autocomplete creates it if needed).
          // Wait, CompanyAutocomplete doesn't create it in DB immediately, it just returns the name.
          // If companyGroupId is null, Dashboard will create the company first.
          // This makes creating a contact here difficult without the company ID.
        } else {
          const { data: newContact, error: contactError } = await supabase
            .from("CompanyContacts")
            .insert([
              {
                company_id: data.companyGroupId,
                full_name: data.contactName,
                phone: data.contactPhone,
                email: data.email,
                job_title: "Contacto", // Default
              },
            ])
            .select()
            .single();

          if (contactError) throw contactError;
          if (newContact) finalContactId = newContact.id;
        }
      }

      const submissionData = {
        ...data,
        contact_id: finalContactId === "NEW" ? null : finalContactId,
      };

      onSave(submissionData);
    } catch (err) {
      console.error("Error creating contact:", err);
      toast.error(`Error al procesar contacto: ${err.message}`);
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleDownloadAttachment = async (url, filename) => {
    try {
      // Extract the file path from the URL
      const urlParts = url.split("/");
      const bucketIndex = urlParts.findIndex((part) => part === "event-images");

      if (bucketIndex === -1) {
        // If we can't find the bucket in the URL, just open it directly
        window.open(url, "_blank");
        return;
      }

      // Get the path after the bucket name
      const filePath = urlParts.slice(bucketIndex + 1).join("/");

      // Create a signed URL that's valid for 60 seconds
      const { data, error } = await supabase.storage
        .from("event-images")
        .createSignedUrl(filePath, 60);

      if (error) {
        console.error("Error creating signed URL:", error);
        // Fallback to direct URL
        window.open(url, "_blank");
        return;
      }

      // Open the signed URL
      window.open(data.signedUrl, "_blank");
    } catch (err) {
      console.error("Error downloading file:", err);
      // Fallback to direct URL
      window.open(url, "_blank");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Fecha Inicio <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleStartDateChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Fecha Fin <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nombre Empresa/Grupo <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <CompanyAutocomplete
                    value={{
                      companyName: field.value,
                      companyGroupId: form.getValues("companyGroupId"),
                    }}
                    onChange={(val) => {
                      field.onChange(val.companyName);
                      form.setValue("companyGroupId", val.companyGroupId);
                      if (val.contactPerson)
                        form.setValue("contactName", val.contactPerson, {
                          shouldValidate: true,
                        });
                      if (val.phone)
                        form.setValue("contactPhone", val.phone, {
                          shouldValidate: true,
                        });
                      if (val.email)
                        form.setValue("email", val.email, {
                          shouldValidate: true,
                        });
                    }}
                    placeholder="Buscar o crear empresa..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg border">
            {/* Contact ID Selection - New Logic */}
            {selectedGroupId ? (
              <FormField
                control={form.control}
                name="contact_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seleccionar Contacto</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={field.value || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val);

                          if (val === "NEW") {
                            // Clear fields for manual entry
                            form.setValue("contactName", "");
                            form.setValue("contactPhone", "");
                            form.setValue("email", "");
                          } else {
                            // Auto-fill other fields based on selection
                            const selectedContact = companyContacts.find(
                              (c) => c.id === val
                            );
                            if (selectedContact) {
                              form.setValue(
                                "contactName",
                                selectedContact.full_name
                              );
                              form.setValue(
                                "contactPhone",
                                selectedContact.phone
                              );
                              form.setValue("email", selectedContact.email);
                            }
                          }
                        }}
                      >
                        <option value="">-- Seleccionar Contacto --</option>
                        {companyContacts.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.full_name} ({c.job_title || "Contacto"})
                          </option>
                        ))}
                        <option
                          value="NEW"
                          className="font-bold text-blue-600 italic"
                        >
                          ++ Crear Nuevo Contacto ++
                        </option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="col-span-2 text-sm text-amber-600 mb-2">
                Selecciona una empresa para ver sus contactos.
              </div>
            )}

            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nombre Responsable <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre Responsable" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Teléfono <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="Teléfono" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="event_category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría del Evento</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        form.setValue("event_type", ""); // Reset type on category change
                      }}
                    >
                      <option value="">Seleccionar Categoría...</option>
                      {Object.keys(EVENT_CATEGORIES).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="event_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Evento</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      {...field}
                      disabled={!selectedCategory}
                    >
                      <option value="">
                        {selectedCategory
                          ? "Seleccionar Tipo..."
                          : "Seleccione Categoría primero"}
                      </option>
                      {selectedCategory &&
                        EVENT_CATEGORIES[selectedCategory]?.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="lead_source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fuente (Lead)</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...field}
                  >
                    <option value="">Seleccionar por dónde llegó...</option>
                    <option value="Redes Sociales">
                      Redes Sociales (Instagram, Facebook, Linkedin, etc.)
                    </option>
                    <option value="Eventos Previos">Eventos Previos</option>
                    <option value="Recomendación">Recomendación</option>
                    <option value="Pagina Web">Pagina Web</option>
                    <option value="Otro">Otro</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="peopleCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  N° de personas <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="eventLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lugar del Evento</FormLabel>
                <FormControl>
                  <Input placeholder="Lugar" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="col-span-2">
            <FormField
              control={form.control}
              name="foodPackage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paquete de alimentación</FormLabel>
                  <FormControl>
                    <MultiSelectDropdown
                      options={[
                        { value: "Paquete 1", label: "Paquete 1" },
                        { value: "Paquete 2", label: "Paquete 2" },
                        { value: "Paquete 3", label: "Paquete 3" },
                        { value: "Menu Infantil", label: "Menu Infantil" },
                        { value: "Desayuno", label: "Desayuno" },
                        { value: "Refrigerio", label: "Refrigerio" },
                        { value: "Auditorio", label: "Auditorio" },
                      ]}
                      selectedValues={field.value || []}
                      onChange={field.onChange}
                      placeholder="Seleccionar paquetes..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="eventDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción del Evento</FormLabel>
              <FormControl>
                <Textarea placeholder="Detalles del evento..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <FormField
            control={form.control}
            name="total_cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Costo Total del Evento</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="$ 0"
                      {...field}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^\d]/g, "");
                        field.onChange(val);
                      }}
                      value={formatCurrency(field.value)}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="eventStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado del Evento</FormLabel>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                >
                  <option value="">Seleccione un estado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Con Abono">Con Abono</option>
                  <option value="Pago Total">Pago Total</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-6">
          <PaymentHistory
            paymentHistory={form.watch("paymentHistory")}
            deposit={form.watch("deposit")}
            pendingAmount={form.watch("pendingAmount")}
            onAddPayment={handleAddPayment}
            onDeletePayment={handleDeletePayment}
          />
        </div>

        <AttachmentList
          attachments={form.watch("attachments")}
          uploadingFiles={uploadingFiles}
          onUpload={handleFileUpload}
          onRemove={handleRemoveAttachment}
          onDownload={handleDownloadAttachment}
        />

        <div className="flex justify-end space-x-2 pt-4 border-t">
          {event && event.id && (
            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={onGeneratePdf}
            >
              <FaFilePdf className="mr-2" />
              PDF
            </Button>
          )}

          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
            Guardar
          </Button>

          {event && event.id && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive">
                  Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="z-[10001]">
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará permanentemente este evento. Esta
                    acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(event.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <Button
            type="button"
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-200"
            onClick={onClose}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
