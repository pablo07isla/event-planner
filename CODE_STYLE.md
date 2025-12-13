# Guía de Estilo de Código (Code Style Guide) - Event Planner

Este documento define los estándares de codificación para el proyecto **Event Planner**. El objetivo es mantener un código limpio, consistente y fácil de mantener.

## 1. Tecnologías Base

- **Framework**: React 18+
- **Lenguaje**: JavaScript (ES6+)
- **Estilos**: Tailwind CSS
- **Componentes UI**: Shadcn/ui (Radix UI + Tailwind)
- **Iconos**: Lucide React
- **Formularios**: React Hook Form + Zod
- **Manejo de Fechas**: date-fns

## 2. Convenciones de Nombres (Naming Conventions)

### 2.1 Archivos y Directorios

- **Directorios**:
  - Usa `kebab-case` para nombres de carpetas.
  - Ejemplo: `src/components/event-search`, `src/utils`.
- **Componentes**:
  - Usa `PascalCase` para archivos de componentes.
  - Ejemplo: `SearchEvents.js` (o `.jsx`), `EventCard.js`.
  - _Nota_: Para este proyecto, se recomienda estandarizar a `.jsx` si contiene JSX.
  - _Excepción_: Los componentes base de UI (Shadcn) usan `kebab-case` (ej. `button.jsx`, `dialog.jsx`). Mantener este estándar dentro de `src/components/ui`.
- **Hooks**:
  - Usa `camelCase` con el prefijo `use`.
  - Ejemplo: `useEventSearch.js`, `useCompanySearch.js`.
- **Utilidades y Funciones**:
  - Usa `camelCase` para archivos de lógica pura.
  - Ejemplo: `dateUtils.js`.

### 2.2 Código (JavaScript)

- **Variables y Funciones**: `camelCase`.
  - `const searchTerm = ...`
  - `const handleSearch = () => ...`
- **Componentes React**: `PascalCase`.
  - `const EventResultsTable = ...`
- **Constantes**: `UPPER_SNAKE_CASE` para valores fijos globales.
  - `const API_TIMEOUT = 5000;`
- **Booleanos**: Prefijos `is`, `has`, `should`.
  - `isOpen`, `isLoading`, `hasError`.

## 3. Estructura de Proyecto Recomendada

```
src/
├── components/           # Componentes reutilizables
│   ├── ui/               # Componentes base (Shadcn) - kebab-case.jsx
│   ├── search/           # Componentes específicos de búsqueda
│   ├── events/           # Componentes de eventos
│   ├── sidebar/          # Componentes de navegación
│   └── ...
├── hooks/                # Custom Hooks reutilizables
├── pages/                # Componentes de Página (Vistas completas)
├── lib/                  # Utilidades y configuración de librerías
├── utils/                # Funciones de utilidad pura
└── services/             # Servicios de API (opcional)
```

## 4. Reglas de Formato (Formatting)

- **Identación**: 2 espacios.
- **Strings**: Comillas dobles `"` (según patrón predominante).
- **Punto y coma**: Siempre al final de las sentencias.
- **Largo de línea**: ~80-100 caracteres.

### 4.1 Importaciones

Orden recomendado:

1.  Librerías externas (React, hooks, date-fns, etc.)
2.  Componentes UI Base (`../components/ui/...`)
3.  Iconos (`lucide-react`)
4.  Componentes locales (`../components/...`)
5.  Hooks y Utilidades (`../hooks/...`, `../utils/...`)
6.  Estilos / Assets

## 5. Prácticas Recomendadas (Best Practices)

### 5.1 React

- **Componentes Funcionales**: Usar siempre componentes funcionales con Hooks.
- **Fragmentos**: Usar `<>...</>` en lugar de `<div>` innecesarios.
- **Hooks Personalizados**: Seguir extrayendo lógica compleja a hooks en `src/hooks/`.
- **Renderizado Condicional**: Usar ternarios `cond ? true : false` o `&&` (con cuidado de no renderizar 0).

### 5.2 Estilos (Tailwind CSS)

- **Utilidades primero**: Evitar CSS custom.
- **Combinación de Clases**: Usar `cn(...)` (extraído de `lib/utils`) para mezclar clases condicionalmente.
  - Ejemplo: `className={cn("text-sm", isActive && "font-bold")}`

## 6. Inconsistencias a Resolver

1.  **Extensiones de Archivo**: Se observa mezcla de `.js` y `.jsx`.
    - _Regla_: Usar `.jsx` para componentes React.
2.  **Nombres en Sidebar**: `src/components/sidebar` tiene `ShadSidebar.js` y `app-sidebar.js`.
    - _Regla_: Renombrar componentes custom a PascalCase (`AppSidebar.jsx`, `SiteHeader.jsx`) y mantener componentes de librería en kebab-case si son generados.

## 7. Ejemplos

### Mal Código ❌

```javascript
// event_card.js
import React from "react";

function event_card(props) {
  // Clases manuales
  return (
    <div className={"card " + props.active ? "active" : ""}>{props.name}</div>
  );
}
```

### Buen Código ✅

```javascript
// EventCard.jsx
import React from "react";
import { cn } from "@/lib/utils";

const EventCard = ({ name, isActive, className }) => {
  return (
    <div
      className={cn(
        "p-4 rounded border",
        isActive && "border-primary",
        className
      )}
    >
      <span className="font-semibold">{name}</span>
    </div>
  );
};

export default EventCard;
```
