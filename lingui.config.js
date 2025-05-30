import { formatter } from "@lingui/format-json";

module.exports = {
  locales: ["es", "en"],
  sourceLocale: "es",
  catalogs: [
    {
      path: "src/locales/{locale}/messages",
      include: ["src"],
    },
  ],
  format: formatter({ style: "lingui" }),
};
