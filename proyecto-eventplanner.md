# Descripción Técnica del Proyecto Event Planner

## Funcionalidades Principales

- **Gestión de eventos:** Permite crear, editar, eliminar y visualizar eventos en un calendario interactivo.
- **Dashboard analítico:** Visualización de métricas y tendencias de eventos mediante gráficos interactivos.
- **Búsqueda y filtrado:** Búsqueda avanzada y filtrado de eventos por diferentes criterios.
- **Exportación a PDF:** Generación y descarga de reportes de eventos en formato PDF.
- **Autenticación de usuarios:** Inicio de sesión y control de acceso utilizando Supabase Auth.
- **Soporte multiempresa:** Gestión de eventos asociados a diferentes empresas.
- **Carga y gestión de archivos adjuntos:** Permite adjuntar y visualizar archivos en los eventos.
- **Interfaz moderna y responsiva:** Uso de Tailwind CSS y Bootstrap para una experiencia de usuario atractiva y adaptable.
- **Internacionalización:** Soporte para múltiples idiomas mediante LinguiJS.
- **Notificaciones y feedback:** Uso de la librería Sonner para mostrar mensajes y alertas al usuario.

## Tecnologías y Frameworks Utilizados

- **React:** Biblioteca principal para la construcción de la interfaz de usuario.
- **Supabase:** Backend como servicio para autenticación, base de datos y almacenamiento de archivos.
- **FullCalendar:** Componente de calendario avanzado para la visualización y gestión de eventos.
- **Tailwind CSS:** Framework de utilidades CSS para el diseño responsivo y moderno.
- **Bootstrap:** Complemento de estilos y componentes UI.
- **LinguiJS:** Internacionalización y traducción de la interfaz.
- **@tanstack/react-table:** Renderizado y manipulación avanzada de tablas de datos.
- **@dnd-kit:** Drag & drop para reordenar elementos en tablas y listas.
- **React Icons:** Iconografía moderna y variada.
- **Sonner:** Notificaciones y mensajes toast.
- **React PDF:** Generación de documentos PDF desde componentes React.
- **Testing Library + Jest:** Pruebas unitarias e integración de componentes.

## Estructura del Proyecto

- `src/components/` — Componentes reutilizables (auth, companies, dashboard, events, etc.)
- `src/pages/` — Vistas principales (Dashboard, EventCalendar, SearchEvents)
- `src/assets/` — Recursos estáticos (imágenes, SVG, etc.)
- `src/utils/` — Funciones utilitarias
- `src/hooks/` — Custom hooks
- `src/locales/` — Archivos de internacionalización

## Notas

- El proyecto sigue buenas prácticas de nombrado y manejo de errores.
- El diseño es mobile-first y accesible.
- La autenticación y la gestión de datos se realizan completamente con Supabase.
- El código está modularizado y preparado para escalabilidad.