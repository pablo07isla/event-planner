import React from "react";
import {
  FaPaperclip,
  FaFileImage,
  FaFileAlt,
  FaFileDownload,
  FaTrash,
} from "react-icons/fa";
import { Button } from "../ui/button";

export default function AttachmentList({
  attachments = [],
  uploadingFiles,
  onUpload,
  onRemove,
  onDownload,
}) {
  return (
    <div className="col-span-2">
      <label className="block mb-2 text-sm font-medium text-gray-900 flex items-center">
        <FaPaperclip className="mr-2" /> Archivos Adjuntos
      </label>

      {attachments.length > 0 && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {attachments.map((attachment, index) => (
              <li
                key={index}
                className="py-3 flex items-center justify-between"
              >
                <div className="flex items-center">
                  {attachment.type && attachment.type.includes("image") ? (
                    <FaFileImage className="text-blue-500 mr-2" />
                  ) : (
                    <FaFileAlt className="text-gray-500 mr-2" />
                  )}
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left bg-transparent border-0 p-0"
                    onClick={() => onDownload(attachment.url, attachment.name)}
                  >
                    {attachment.name}
                  </button>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDownload(attachment.url, attachment.name)}
                    title="Descargar archivo"
                    type="button"
                  >
                    <FaFileDownload className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(index)}
                    title="Eliminar archivo"
                    type="button"
                  >
                    <FaTrash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-2">
        <label
          htmlFor="file-upload"
          className={`cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 ${
            uploadingFiles ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FaPaperclip className="mr-2" />
          {uploadingFiles ? "Subiendo archivos..." : "Adjuntar archivos"}
        </label>
        <input
          id="file-upload"
          type="file"
          multiple
          onChange={onUpload}
          className="hidden"
          disabled={uploadingFiles}
        />
        <span className="ml-2 text-xs text-gray-500">
          Se permiten imágenes y documentos
        </span>
      </div>
    </div>
  );
}
