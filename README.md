# Event Planner

Aplicación integral para la gestión y planificación de eventos, impulsada por React y Supabase. Esta plataforma permite administrar eventos, clientes y análisis de datos con herramientas modernas de IA e integración con mensajería.

## 🚀 Características Principales

- **Dashboard Interactivo**: Visualización de métricas clave y próximos eventos.
- **Gestión de Calendario**: Vista completa de eventos con `@fullcalendar/react`.
- **Análisis con IA**: Integración de inteligencia artificial para análisis de catering y eventos.
- **Reportes y Exportación**: Generación de PDFs detallados de eventos y listados.
- **Integraciones**:
  - **WhatsApp**: Envío de reportes y mensajes directos.
  - **Slack**: Notificaciones y envío de documentos.
- **Multi-idioma**: Soporte i18n con LinguiJS.
- **UI Moderna**: Interfaz construida con Shadcn/ui, Tailwind CSS y Bootstrap.

## 🛠 Tech Stack

### Frontend

- **Framework**: [React](https://reactjs.org/) (v18)
- **Build Tool**: Create React App
- **Lenguaje**: JavaScript / JSX
- **Estado & Datos**: React Hooks, Axios

### UI & Estilos

- **Framework CSS**: [Tailwind CSS](https://tailwindcss.com/) & [Bootstrap 5](https://getbootstrap.com/)
- **Componentes**: [Shadcn/ui](https://ui.shadcn.com/) (@radix-ui primitives)
- **Iconos**: Lucide React, FontAwesome, React Icons
- **Visualización de Datos**: Recharts

### Backend & Servicios

- **BaaS**: [Supabase](https://supabase.com/) (Base de datos, Autenticación, Edge Functions)
- **Email**: Integración para notificaciones.

### Utilidades

- **Manejo de Fechas**: date-fns
- **Formularios**: React Hook Form + Zod
- **PDF**: jsPDF, html2canvas, @react-pdf/renderer
- **Internacionalización**: @lingui/core

## 📂 Estructura del Proyecto

```
src/
├── assets/           # Imágenes y recursos estáticos
├── components/       # Componentes de la aplicación
│   ├── auth/         # Componentes de autenticación
│   ├── dashboard/    # Widgets y secciones del dashboard
│   ├── events/       # Listados, calendario y detalles de eventos
│   ├── ui/           # Componentes base (Shadcn/ui)
│   └── ...
├── hooks/            # Custom hooks (e.g., useEventSearch)
├── lib/              # Configuraciones de librerías (utils, axios)
├── locales/          # Archivos de traducción (i18n)
├── pages/            # Vistas principales (Rutas)
├── utils/            # Funciones auxiliares generales
└── ...
```

## 🚦 Scripts Disponibles

En el directorio del proyecto puedes ejecutar:

### `npm start`

Inicia la aplicación en modo desarrollo.\
Abre [http://localhost:3000](http://localhost:3000) para verla en tu navegador.

### `npm test`

Lanza el runner de pruebas en modo interactivo.

### `npm run build`

Construye la aplicación para producción en la carpeta `build`.
Optimiza React para el mejor rendimiento.

## ⚙️ Configuración

Para ejecutar este proyecto, necesitarás configurar las variables de entorno para Supabase.
Crea un archivo `.env` en la raíz del proyecto (basado en `.env.example` si existe) con:

```env
REACT_APP_SUPABASE_URL=tu_url_de_supabase
REACT_APP_SUPABASE_ANON_KEY=tu_clave_anonima
```

> **Nota**: Asegúrate de tener configuradas las Edge Functions necesarias para las integraciones de IA y mensajería.

## 📝 Guía de Estilo

El proyecto sigue una guía de estilo estricta para mantener la consistencia:

- Componentes en `PascalCase`.
- Hooks en `camelCase` con prefijo `use`.
- Estilos con Tailwind CSS y utilidades `cn()`.
- Preferencia por componentes funcionales y Hooks.

---

Desarrollado con ❤️ por el equipo de Event Planner.
