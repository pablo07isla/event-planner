// src/components/LanguageSwitcher.js

import { LocaleContext } from "../LinguiProvider";
import { Globe } from "lucide-react";
import React, { useContext } from "react";

const LanguageSwitcher = () => {
  const { locale, setLocale } = useContext(LocaleContext);

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-slate-500" />
        <div className="flex border rounded-md overflow-hidden">
          <button
            onClick={() => setLocale("es")}
            className={`px-3 py-1 text-xs font-medium ${
              locale === "es"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            aria-label="Español"
          >
            ES
          </button>
          <button
            onClick={() => setLocale("en")}
            className={`px-3 py-1 text-xs font-medium ${
              locale === "en"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            aria-label="English"
          >
            EN
          </button>
        </div>
      </div>
      <div className="h-4"></div>{" "}
      {/* Espacio adicional debajo de los botones */}
    </div>
  );
};

export default LanguageSwitcher;
