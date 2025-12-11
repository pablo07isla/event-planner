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
  contactName: z.string().min(1, "Nombre Responsable es requerido"),
  contactPhone: z.string().min(1, "Teléfono es requerido"),
  email: z.string().email("Email inválido").min(1, "Email es requerido"),
  eventLocation: z.string().optional(),
  foodPackage: z.array(z.string()).optional(),
  eventDescription: z.string().optional(),
  deposit: z.coerce.string().optional(),
  pendingAmount: z.coerce.string().optional(),
  eventStatus: z.string().min(1, "Estado es requerido"),
  paymentHistory: z.array(z.any()).optional(),
  attachments: z.array(z.any()).optional(),
  createdAt: z.string().optional(),
  lastModified: z.string().optional(),
  lastModifiedBy: z.string().optional(),
});

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
      deposit: "0",
      pendingAmount: "0",
      eventStatus: "",
      paymentHistory: [],
      attachments: [],
    },
  });

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
        deposit: event.deposit ? String(event.deposit) : "0",
        pendingAmount:
          event.pendingAmount !== null ? String(event.pendingAmount) : "0",
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
        const filePath = `${event?.id || "new-event"}/${fileName}`;

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

  const onSubmit = (data) => {
    if (!data.companyGroupId && !data.companyName) {
      toast.error("Debe seleccionar una empresa válida");
      return;
    }
    onSave(data);
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <PaymentHistory
              paymentHistory={form.watch("paymentHistory")}
              deposit={form.watch("deposit")}
              onAddPayment={handleAddPayment}
              onDeletePayment={handleDeletePayment}
            />
          </div>

          <FormField
            control={form.control}
            name="pendingAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Saldo Pendiente</FormLabel>
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
              <AlertDialogContent>
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
