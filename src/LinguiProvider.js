import { messages as enMessages } from "./locales/en/messages.js";
import { messages as esMessages } from "./locales/es/messages.js";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import * as React from "react";

const catalogs = {
  es: esMessages,
  en: enMessages,
};

export const LocaleContext = React.createContext({
  locale: "es",
  setLocale: () => {},
});

export function LinguiProvider({ children }) {
  const [locale, setLocale] = React.useState(
    localStorage.getItem("locale") || navigator.language.split("-")[0] || "es"
  );

  React.useEffect(() => {
    i18n.load(locale, catalogs[locale] || catalogs["es"]);
    i18n.activate(locale);
    localStorage.setItem("locale", locale);
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <I18nProvider i18n={i18n} key={locale}>
        {children}
      </I18nProvider>
    </LocaleContext.Provider>
  );
}
