# AGENTS.MD - Guía de Buenas Prácticas
## Proyecto: Landing Page CRM Inmobiliario (Astro + Supabase)

> **⚠️ INSTRUCCIÓN IMPORTANTE PARA EL AGENTE:**
> Este documento rige el desarrollo de la landing page pública del CRM inmobiliario. Antes de generar código, verifica los requisitos aquí descritos. El objetivo es captar clientes potenciales, mostrar propiedades y servicios disponibles, y generar solicitudes de contacto. Proyecta modernidad, confianza y profesionalismo inmobiliario.

---

## 📋 Índice
1. [Información del Proyecto](#información-del-proyecto)
2. [Paleta de Colores y Tipografía](#paleta-de-colores-y-tipografía)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Arquitectura de Componentes](#arquitectura-de-componentes)
6. [Gestión de Datos y API](#gestión-de-datos-y-api)
7. [Páginas y Secciones Requeridas](#páginas-y-secciones-requeridas)
8. [Principios de Diseño y UX](#principios-de-diseño-y-ux)
9. [Estrategia de Animaciones y Performance](#estrategia-de-animaciones-y-performance)
10. [Estrategia SEO y Posicionamiento](#estrategia-seo-y-posicionamiento)
11. [Estrategia de Testing y QA](#estrategia-de-testing-y-qa)
12. [Estándares de Calidad y Accesibilidad](#estándares-de-calidad-y-accesibilidad)
13. [Checklist de Entregables](#checklist-de-entregables)

---

## ℹ️ Información del Proyecto

**Tipo**: Landing page pública de un CRM inmobiliario.
**Alcance**: Presentación del negocio, listado de propiedades y servicios, detalle individual, y formulario de solicitudes de clientes.
**Base de datos**: Supabase (esquema definido — ver `schema.sql` en el repo).
**Audiencia objetivo**: Compradores, arrendatarios e interesados en servicios inmobiliarios.

---

## 🎨 Paleta de Colores y Tipografía

Identidad visual definida por el cliente. Paleta de azules navy con blanco roto. Tipografía con contraste serif/sans-serif de carácter editorial y corporativo.

### Colores

```css
:root {
  /* ── Paleta Principal ── */
  --color-deepest:  #0B2545;   /* Deep Navy — Fondo oscuro principal, Navbar, Footer */
  --color-primary:  #134074;   /* Royal Blue — Fondos de sección, Headers de cards */
  --color-dark:     #13315C;   /* Dark Blue — Variante complementaria, bordes, sombras */
  --color-mid:      #8DA9C4;   /* Steel Blue — Texto secundario, iconos, separadores */
  --color-light:    #EEF4ED;   /* Off-White / Ivory — Fondo de secciones claras, backgrounds */

  /* ── Semántica de uso ── */
  --background:     #FFFFFF;   /* Fondo base limpio */
  --surface:        #EEF4ED;   /* Fondo de secciones alternas (--color-light) */
  --surface-dark:   #134074;   /* Superficie oscura para secciones con contraste */
  --text-main:      #0B2545;   /* Texto principal sobre fondos claros */
  --text-on-dark:   #EEF4ED;   /* Texto sobre fondos oscuros */
  --text-muted:     #8DA9C4;   /* Texto secundario/descriptivo */
  --border:         #8DA9C4;   /* Bordes de inputs y cards */
  --success:        #2D9E6B;   /* Éxito en formularios */
  --error:          #D64045;   /* Error en formularios */

  /* ── Tipografía ── */
  --font-heading: 'Sansation', sans-serif;   /* Headers — Moderno, geométrico, bold */
  --font-body:    'Antic Didone', serif;     /* Contenido — Elegante, editorial, serif */
}
```

### Tipografía

| Rol | Fuente | Peso | Uso |
|:---|:---|:---|:---|
| Headers (H1–H3) | `Sansation` | Regular / Bold | Títulos de página, sección, navbar |
| Body / Content | `Antic Didone` | Regular | Párrafos, descripciones, cards |
| Datos numéricos | `Sansation` | Bold | Precios, estadísticas, badges |

> **⚠️ Fuentes**: `Sansation` no está disponible en Google Fonts ni Fontsource. Descargar los archivos `.woff2` y hacer **self-hosting local** en `public/fonts/`. Declarar con `@font-face` en un CSS global o en `Layout.astro`. `Antic Didone` sí está disponible en Google Fonts — self-hosting vía `@fontsource/antic-didone`.

```css
/* public/fonts/sansation — self-hosted */
@font-face {
  font-family: 'Sansation';
  src: url('/fonts/Sansation-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
@font-face {
  font-family: 'Sansation';
  src: url('/fonts/Sansation-Bold.woff2') format('woff2');
  font-weight: 700;
  font-display: swap;
}
```

### Guía de Uso de Color

| Elemento | Color de fondo | Color de texto | Notas |
|:---|:---|:---|:---|
| Navbar | `#0B2545` | `#EEF4ED` | Logo en blanco roto |
| Hero Section | `#0B2545` o `#134074` | `#EEF4ED` | Imagen con overlay oscuro |
| Sección clara | `#EEF4ED` | `#0B2545` | Alternar con secciones oscuras |
| Cards de propiedades | `#FFFFFF` | `#0B2545` | Borde `#8DA9C4` |
| Botón primario (CTA) | `#134074` | `#EEF4ED` | Hover: `#0B2545` |
| Botón outline | `transparent` | `#134074` | Borde `#134074`, hover fill |
| Badge "Activo" | `#2D9E6B` | `#FFFFFF` | — |
| Badge "Vendido" | `#D64045` | `#FFFFFF` | — |
| Badge "Pendiente" | `#8DA9C4` | `#0B2545` | — |
| Footer | `#0B2545` | `#8DA9C4` / `#EEF4ED` | — |

---

## 🛠 Stack Tecnológico

| Capa | Tecnología | Justificación |
|:---|:---|:---|
| Framework | **Astro 5.x** (última estable) | SSG por defecto, 0kb JS al cliente, ideal para SEO |
| Lenguaje | **TypeScript** | Type safety en toda la base de código |
| Estilos | **Tailwind CSS v4** | Desarrollo ágil, responsive, purge automático |
| Interactividad | **React 19** (solo Islas) | Formularios, filtros y componentes dinámicos |
| Base de datos | **Supabase** | PostgreSQL gestionado + Storage para imágenes |
| Iconos | **Lucide React** | Ligero, consistente, tree-shakeable |
| Animaciones | **Motion One** (`motion`) | < 5kb, scroll reveal y micro-interacciones |
| Validación | **Zod** | Validación de formularios en cliente y servidor |

---

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── common/
│   │   ├── Button.astro             # Botón reutilizable (variantes: primary, outline, ghost)
│   │   ├── SectionTitle.astro       # Título de sección con subtítulo opcional
│   │   ├── Badge.astro              # Estado de propiedad (Activo, Vendido, etc.)
│   │   ├── PriceTag.astro           # Formato de precio (CRC/USD)
│   │   └── EmptyState.astro         # Pantalla vacía para listados sin resultados
│   ├── layout/
│   │   ├── Navbar.astro             # Navbar estático con links
│   │   ├── NavbarMobile.tsx         # Menú móvil interactivo (Isla React)
│   │   └── Footer.astro             # Footer con info de contacto y links
│   ├── sections/
│   │   ├── home/
│   │   │   ├── Hero.astro                # Headline + CTA + imagen de fondo
│   │   │   ├── FeaturedProperties.astro  # Grid de propiedades destacadas
│   │   │   ├── ServicesSummary.astro     # Resumen de servicios ofrecidos
│   │   │   ├── Stats.astro              # Métricas del negocio (propiedades, años, etc.)
│   │   │   └── ContactCTA.astro         # Bloque de llamado a la acción final
│   │   ├── properties/
│   │   │   ├── PropertyGrid.astro        # Grid de tarjetas de propiedades
│   │   │   ├── PropertyCard.astro        # Tarjeta individual de propiedad
│   │   │   ├── PropertyFilters.tsx       # Filtros interactivos (Isla React)
│   │   │   └── PropertyGallery.tsx       # Galería de imágenes (Isla React)
│   │   ├── services/
│   │   │   ├── ServiceGrid.astro         # Grid de tarjetas de servicios
│   │   │   └── ServiceCard.astro         # Tarjeta individual de servicio
│   │   └── requests/
│   │       └── RequestForm.tsx           # Formulario de solicitud (Isla React)
├── layouts/
│   └── Layout.astro                      # Layout base con Head, SEO, ViewTransitions
├── pages/
│   ├── index.astro                       # Landing principal
│   ├── propiedades/
│   │   ├── index.astro                   # Listado de propiedades
│   │   └── [slug].astro                  # Detalle de propiedad (SSG dinámico)
│   ├── servicios/
│   │   ├── index.astro                   # Listado de servicios
│   │   └── [id].astro                    # Detalle de servicio
│   ├── solicitudes.astro                 # Formulario público de solicitudes
│   └── 404.astro                         # Página de error personalizada
├── lib/
│   ├── supabase.ts                       # Cliente Supabase (singleton)
│   ├── queries/
│   │   ├── properties.ts                 # Queries de propiedades
│   │   ├── services.ts                   # Queries de servicios
│   │   └── requests.ts                   # Mutations de solicitudes
│   └── validators/
│       └── requestSchema.ts              # Esquema Zod para el formulario
├── types/
│   ├── property.ts                       # Tipos TypeScript de propiedades
│   ├── service.ts                        # Tipos TypeScript de servicios
│   └── request.ts                        # Tipos TypeScript de solicitudes
└── utils/
    ├── formatPrice.ts                    # Formateo de moneda (CRC/USD)
    ├── formatDate.ts                     # Formateo de fechas
    └── slugify.ts                        # Generación de slugs para URLs
```

---

## 🧩 Arquitectura de Componentes (Islas & Hidratación)

### Regla de Oro: Astro por Defecto
El 90% de los componentes DEBEN ser `.astro`. Renderiza HTML puro en build → 0kb JS al cliente.

### Cuándo usar React (Islas)
Solo cuando se requiera interactividad real del lado del cliente.

| Componente | Tecnología | Directiva | Justificación |
|:---|:---|:---|:---|
| Navbar (links) | Astro | N/A | Estático puro |
| Navbar Mobile Menu | React | `client:load` | Toggle de estado interactivo |
| Hero Section | Astro | N/A | Estático puro |
| Property Grid | Astro | N/A | Renderizado en build |
| Property Filters | React | `client:load` | Estado de filtros activos |
| Property Gallery | React | `client:visible` | Slider/lightbox interactivo |
| Service Grid | Astro | N/A | Estático puro |
| Request Form | React | `client:visible` | Validación en tiempo real + submit |
| Footer | Astro | N/A | Estático puro |

> **EVITAR**: `client:only` salvo que sea estrictamente necesario — rompe SSR y daña SEO.

---

## 📊 Gestión de Datos y API

### Cliente Supabase (`src/lib/supabase.ts`)
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Variables de Entorno (`.env`)
```env
PUBLIC_SUPABASE_URL=https://<project>.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

### Tipos TypeScript (`src/types/property.ts`)
Los tipos deben derivarse fielmente del esquema SQL definido en `schema.sql`. Ejemplo:

```typescript
export type PropertyType = 'casa' | 'finca' | 'lote' | 'carro' | 'construccion_en_lote';
export type PropertyStatus = 'activo' | 'vendido' | 'inactivo' | 'pendiente_revision';
export type Currency = 'CRC' | 'USD';

export interface Property {
  id: string;
  type: PropertyType;
  title: string;
  description?: string;
  price?: number;
  currency: Currency;
  location?: string;
  status: PropertyStatus;
  images?: string[];
  is_featured: boolean;
  display_order: number;
  created_at: string;
  // Extensiones unidas via JOIN según tipo
  real_estate?: PropertyRealEstate;
  vehicle?: PropertyVehicle;
}
```

> **Regla**: No usar `any` en TypeScript. Toda estructura de datos debe tener su interfaz definida en `src/types/`.

### Queries de Propiedades (`src/lib/queries/properties.ts`)
```typescript
// Solo propiedades activas y destacadas para el Home
export async function getFeaturedProperties(limit = 6) {
  const { data } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'activo')
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .limit(limit);
  return data ?? [];
}

// Listado con paginación y filtros
export async function getProperties(filters?: PropertyFilters) {
  let query = supabase
    .from('properties')
    .select('*')
    .eq('status', 'activo')
    .order('display_order', { ascending: true });

  if (filters?.type) query = query.eq('type', filters.type);
  if (filters?.currency) query = query.eq('currency', filters.currency);

  const { data } = await query;
  return data ?? [];
}

// Propiedad individual para página de detalle
export async function getPropertyBySlug(id: string) {
  const { data } = await supabase
    .from('properties')
    .select(`*, property_real_estate(*), property_vehicles(*)`)
    .eq('id', id)
    .eq('status', 'activo')
    .single();
  return data;
}
```

---

## 📄 Páginas y Secciones Requeridas

### 1. Landing Page Principal (`/`)
Presentación del negocio, propuesta de valor y acceso rápido a propiedades y servicios.

**Secciones obligatorias:**
- **Hero**: Imagen/video de fondo, título principal con keyword SEO, subtítulo descriptivo, CTA primario ("Ver Propiedades") y CTA secundario ("Contactar").
- **Propiedades Destacadas**: Grid de hasta 6 propiedades con `is_featured = true`. Cada card muestra imagen, tipo, título, precio, ubicación y estado.
- **Servicios Disponibles**: Resumen visual de los servicios activos (máx. 4). Cada card con ícono, nombre y descripción corta.
- **Stats / Credenciales**: Bloque con métricas del negocio (ej: "50+ propiedades", "10 años de experiencia").
- **CTA Final**: Bloque de llamado a la acción con botón al formulario de solicitudes.

### 2. Listado de Propiedades (`/propiedades`)
Catálogo completo de bienes disponibles con filtros.

**Requerimientos:**
- Grid responsivo de `PropertyCard` (mínimo 2 columnas en móvil, 3 en desktop).
- Filtros por: tipo de propiedad, moneda y rango de precio (Isla React `client:load`).
- Cada `PropertyCard` muestra: imagen principal, badge de tipo, título, precio formateado, ubicación, estado.
- Paginación o carga incremental si hay más de 12 resultados.
- Estado vacío (`EmptyState.astro`) si no hay propiedades con los filtros aplicados.

### 3. Detalle de Propiedad (`/propiedades/[id]`)
Página individual con toda la información del bien.

**Requerimientos:**
- Galería de imágenes interactiva (Isla React `client:visible`) con lightbox.
- Información detallada según tipo (inmueble vs. vehículo):
  - **Inmuebles**: habitaciones, baños, parqueos, área m², hectáreas, amenidades, vereda, zonificación.
  - **Vehículos**: marca, modelo, año, kilometraje, cilindraje, transmisión, combustible, condición.
- Precio formateado con moneda (CRC en colones `₡`, USD en dólares `$`).
- Badge de estado (activo/vendido/pendiente).
- CTA para **agendar cita** o **solicitar información** que lleva al formulario de solicitudes con la propiedad prellenada.
- Breadcrumb de navegación.

### 4. Listado de Servicios (`/servicios`)
Catálogo de servicios adicionales del negocio.

**Requerimientos:**
- Grid de `ServiceCard` con ícono, nombre y descripción corta.
- Solo servicios con `is_active = true`.
- Enlace a la página de detalle de cada servicio.

### 5. Detalle de Servicio (`/servicios/[id]`)
Página individual con descripción completa del servicio.

**Requerimientos:**
- Título y descripción completa del servicio.
- CTA claro para solicitar información, vinculado al formulario de solicitudes con el servicio prellenado.
- Sección de otros servicios relacionados al final.

### 6. Formulario de Solicitudes (`/solicitudes`)
Registro público de solicitudes de clientes interesados.

**Requerimientos:**
- Formulario (Isla React `client:visible`) con los campos:
  - `full_name` (requerido)
  - `email` (requerido, formato válido)
  - `phone` (opcional)
  - `message` (requerido)
  - `property_id` (opcional, select prellenable por query param `?property=<id>`)
  - `service_id` (opcional, select prellenable por query param `?service=<id>`)
- Validación en tiempo real con **Zod**.
- Feedback visual inmediato: spinner durante envío, mensaje de éxito o error.
- Al enviar exitosamente, inserta un registro en la tabla `leads` de Supabase con `status = 'nuevo'` y `source = 'web'`.
- NO usar `alert()` del navegador. Todo el feedback es inline dentro del formulario.

---

## 🎯 Principios de Diseño y UX

1. **Confianza Inmobiliaria**: Diseño limpio, fotografía de calidad, tipografía serif para títulos que proyecte solidez.
2. **Jerarquía Visual**:
   - **H1**: Única por página. Propuesta de valor con keyword local.
   - **H2**: Títulos de sección.
   - **CTA**: Color `--accent` (Gold) para máxima visibilidad. En fondos oscuros usar `--accent` sólido; en fondos claros usar outline.
3. **Cards de Propiedades**: Imagen en proporción 4:3, hover con sutil elevación (`shadow-lg`), precio destacado en `--font-mono`.
4. **Mobile First**: El filtro de propiedades debe ser un drawer/panel deslizable en móvil, no un sidebar fijo.
5. **Precio Formateado**: Siempre mostrar `₡` para CRC y `$` para USD. Usar `Intl.NumberFormat` para separadores de miles.
6. **Estados de Propiedad**: Badge de color claro para `activo` (verde), `vendido` (rojo apagado), `pendiente_revision` (amarillo).
7. **Accesibilidad**: Contraste mínimo 4.5:1 para texto normal. Todos los inputs con `label` asociado.

---

## ⚡ Estrategia de Animaciones y Performance

### Navegación entre Páginas (View Transitions)
Usar la API nativa de Astro View Transitions (`ClientRouter` en Astro 5) para navegación fluida tipo SPA sin JS extra.

```astro
---
// src/layouts/Layout.astro
import { ClientRouter } from 'astro:transitions';
---
<head>
  <ClientRouter />
</head>
```

### Micro-interacciones (Tailwind CSS)
Para estados hover y transiciones:
```html
<!-- Ejemplo en PropertyCard -->
<div class="group overflow-hidden rounded-xl transition-shadow hover:shadow-xl">
  <img class="transition-transform duration-500 group-hover:scale-105" />
</div>
```

### Scroll Reveal (Motion One)
Para entradas de elementos al hacer scroll:
```typescript
// Ejemplo en PropertyGrid
import { animate, inView } from 'motion';

inView('.property-card', ({ target }) => {
  animate(target, { opacity: [0, 1], y: [24, 0] }, { duration: 0.4 });
});
```

> **Evitar**: Framer Motion o GSAP salvo necesidad justificada de timeline complejo.

---

## 🚀 Estrategia SEO y Posicionamiento

### Palabras Clave
- **Primarias**: "Propiedades en venta Costa Rica", "Fincas en Guanacaste", "Casas en Liberia".
- **Secundarias**: "Servicios inmobiliarios", "Administración de propiedades", "Compra venta de carros".
- **Long-tail**: "Lotes en venta Guanacaste baratos", "Finca con casa en Liberia Costa Rica".

### Meta Datos por Página
| Página | Title (máx. 60 chars) | Description (máx. 160 chars) |
|:---|:---|:---|
| Home | `Propiedades en Guanacaste \| [Nombre Negocio]` | "Casas, fincas y lotes en Costa Rica. Amplio catálogo disponible. Contáctanos hoy." |
| Propiedades | `Catálogo de Propiedades \| [Nombre Negocio]` | "Explora nuestro catálogo de bienes inmuebles y muebles disponibles en Costa Rica." |
| Detalle Propiedad | `[Título Propiedad] \| [Nombre Negocio]` | "[Descripción corta, tipo, ubicación y precio de la propiedad.]" |
| Servicios | `Servicios Inmobiliarios \| [Nombre Negocio]` | "Alojamiento, administración de propiedades y más servicios en Costa Rica." |
| Solicitudes | `Solicitar Información \| [Nombre Negocio]` | "Completa el formulario para recibir asesoría personalizada sobre propiedades o servicios." |

### SEO Técnico y Local (Schema.org)
Implementar JSON-LD en el `<head>` de `Layout.astro`:

```json
{
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "[Nombre del Negocio]",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Liberia",
    "addressRegion": "Guanacaste",
    "addressCountry": "CR"
  },
  "telephone": "+506XXXXXXXX",
  "url": "https://[dominio].com"
}
```

Para páginas de propiedades individuales, agregar Schema de tipo `Product` o `Accommodation` según corresponda.

### Optimización Técnica
- **`<Image />`** de Astro: Uso **obligatorio** para todas las imágenes. Genera WebP/AVIF automáticamente.
- **Lazy Loading**: Activo por defecto en imágenes "below the fold".
- **URL Amigables**: `/propiedades/[id]` y `/servicios/[id]` con slugs descriptivos cuando sea posible.
- **`canonical`**: Definir en cada página para evitar contenido duplicado.
- **Lighthouse Score**: Mantener > 95 en Performance, Accessibility y SEO.

---

## 🧪 Estrategia de Testing y QA

### Unit Testing (Vitest)
```typescript
// Pruebas para utilidades y validaciones
// src/utils/formatPrice.test.ts
// src/lib/validators/requestSchema.test.ts
// src/components/RequestForm.test.tsx
```

### End-to-End Testing (Playwright)
**Smoke Tests críticos:**
- [ ] ¿Carga la Home sin errores 404?
- [ ] ¿Se listan propiedades correctamente?
- [ ] ¿Funciona la navegación a detalle de propiedad?
- [ ] ¿Funcionan los filtros de propiedades?
- [ ] ¿Se envía el formulario de solicitudes y aparece mensaje de éxito?
- [ ] ¿Los query params `?property=<id>` prellenan correctamente el formulario?
- [ ] ¿El layout es correcto en viewport móvil (390px) y desktop (1280px)?

### Scripts (`package.json`)
```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest",
    "test:e2e": "playwright test",
    "lint": "eslint src --ext .ts,.tsx,.astro",
    "format": "prettier --write src"
  }
}
```

---

## 💎 Estándares de Calidad y Accesibilidad

### Accesibilidad (A11Y)
- **HTML Semántico**: `<main>`, `<nav>`, `<article>`, `<section>`, `<aside>` en lugar de `<div>` genéricos.
- **Imágenes de propiedades**: `alt` descriptivo obligatorio (ej: `alt="Casa de 3 habitaciones en Liberia, Guanacaste"`).
- **Navegación por teclado**: Todos los elementos interactivos accesibles vía `Tab`.
- **ARIA**: Solo cuando el HTML semántico no sea suficiente (ej: `aria-expanded` en filtros, `aria-live` en mensajes de formulario).
- **Contraste**: Verificar Gold (`#C9973A`) sobre blanco y sobre `--primary` con WebAIM Contrast Checker.

### Calidad de Código
- **No `any`** en TypeScript. Interfaces para todas las estructuras de datos.
- **Prettier** con plugin Astro para formato automático.
- **ESLint** con reglas `jsx-a11y` para detectar problemas de accesibilidad.
- **Commits semánticos**: `feat:`, `fix:`, `chore:`, `refactor:`.

### Manejo de Errores (UX)
- **Página 404** (`404.astro`): Personalizada con botón "Volver al inicio".
- **Formularios**: Mensajes inline claros. Nunca `alert()`. Usar estados del componente React.
- **Propiedades no encontradas**: Redirigir a `/propiedades` con mensaje descriptivo si `[id]` no existe.
- **Imágenes rotas**: Placeholder con el ícono del tipo de propiedad si `images` está vacío o la URL falla.

---

## ✅ Checklist de Entregables

### Landing Page (`/`)
- [ ] **Hero**: Imagen, H1 con keyword, subtítulo, CTA primario y secundario.
- [ ] **Propiedades Destacadas**: Grid de featured properties, enlace a `/propiedades`.
- [ ] **Servicios**: Resumen visual de servicios activos, enlace a `/servicios`.
- [ ] **Stats**: Bloque de métricas del negocio.
- [ ] **CTA Final**: Bloque con enlace a `/solicitudes`.

### Propiedades
- [ ] **`/propiedades`**: Grid responsivo, filtros funcionales, paginación, estado vacío.
- [ ] **`/propiedades/[id]`**: Galería, info detallada, precio formateado, CTA a solicitudes.

### Servicios
- [ ] **`/servicios`**: Grid de servicios activos.
- [ ] **`/servicios/[id]`**: Descripción completa, CTA a solicitudes, servicios relacionados.

### Solicitudes
- [ ] **`/solicitudes`**: Formulario validado, prellenado por query params, feedback de éxito/error, inserción en tabla `leads`.

### Global
- [ ] **Navbar**: Links de navegación, responsive, menú móvil funcional.
- [ ] **Footer**: Links, info de contacto, copyright.
- [ ] **404**: Página personalizada con botón de retorno.
- [ ] **SEO**: Meta tags, canonical, Open Graph, JSON-LD en todas las páginas.
- [ ] **Performance**: Lighthouse > 95 en las páginas principales.
- [ ] **Accesibilidad**: Sin errores críticos de a11y en axe-core o Lighthouse.