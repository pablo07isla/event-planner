# Event Planner

Aplicación de gestión de eventos desarrollada con React y Supabase.

## Scripts disponibles

En el directorio del proyecto puedes ejecutar:

### `npm start`

Inicia la app en modo desarrollo.\
Abre [http://localhost:3000](http://localhost:3000) para verla en tu navegador.

La página se recargará cuando hagas cambios.\
También puedes ver cualquier error de lint en la consola.

### `npm test`

Lanza el test runner en modo interactivo.\
Consulta la sección sobre [ejecución de pruebas](https://facebook.github.io/create-react-app/docs/running-tests) para más información.

### `npm run build`

Construye la app para producción en la carpeta `build`.\
Agrupa correctamente React en modo producción y optimiza la construcción para el mejor rendimiento.

La construcción está minificada y los nombres de archivo incluyen los hashes.\
¡Tu app está lista para ser desplegada!

Consulta la sección sobre [despliegue](https://facebook.github.io/create-react-app/docs/deployment) para más información.

### `npm run eject`

**¡Advertencia! Esta acción es irreversible.**

Si no estás satisfecho con la herramienta de construcción y las opciones de configuración, puedes `eject` en cualquier momento. Este comando eliminará la única dependencia de construcción de tu proyecto.

En su lugar, copiará todos los archivos de configuración y las dependencias transitivas (webpack, Babel, ESLint, etc.) directamente a tu proyecto para que tengas control total sobre ellos. Todos los comandos excepto `eject` seguirán funcionando, pero apuntarán a los scripts copiados para que puedas ajustarlos. En este punto, estás por tu cuenta.

Nunca tienes que usar `eject`. El conjunto de características curadas es adecuado para implementaciones pequeñas y medianas, y no deberías sentirte obligado a usar esta característica. Sin embargo, entendemos que esta herramienta no sería útil si no pudieras personalizarla cuando estés listo para hacerlo.

---

## Estructura del proyecto

- `src/components/` — Componentes reutilizables (auth, companies, dashboard, events, etc.)
- `src/pages/` — Vistas principales (Dashboard, EventCalendar, SearchEvents)
- `src/assets/` — Recursos estáticos (imágenes, SVG, etc.)
- `src/utils/` — Funciones utilitarias
- `src/hooks/` — Custom hooks
- `src/locales/` — Archivos de internacionalización

## Características principales

- Gestión de eventos con calendario y dashboard
- Búsqueda y filtrado de eventos
- Exportación de eventos a PDF
- Autenticación de usuarios (Supabase)
- Soporte para múltiples empresas
- Interfaz moderna con Tailwind CSS y Bootstrap

## Notas de desarrollo

- El archivo `src/assets/tailwindcss.svg` es utilizado como logo en la autenticación.
- Para estilos personalizados de calendario, ver `src/components/events/EventCalendar.css`.
- Las rutas protegidas requieren autenticación.

## Documentación adicional

- [Documentación oficial de React](https://reactjs.org/)
- [Documentación de Supabase](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Bootstrap](https://getbootstrap.com/)

---

Para dudas o contribuciones, contacta al equipo de desarrollo.
