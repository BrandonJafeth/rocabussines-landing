# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server at localhost:4321
npm run build     # Production build to ./dist/
npm run preview   # Preview production build
```

No test or lint scripts configured.

## Architecture

Astro 5 + React 19 + Tailwind CSS + Supabase (SSR via Vercel). Real estate landing page for Costa Rican market.

**Rendering model**: `output: "server"` — all pages SSR by default. Pages opt-out individually with `export const prerender = true`.

**Component split**:
- `src/components/layout/` — Navbar, Footer (Astro, zero JS)
- `src/components/sections/home/` — Homepage sections (Astro, SSR)
- `src/components/react/` — Interactive islands only: ContactForm, NavbarMobile, PropertyFilters

React islands use `client:load` for above-fold interactive components. Minimize React usage — Astro components preferred.

## Data Layer

`src/lib/supabase.ts` — singleton Supabase client.

`src/lib/queries/` — all DB queries:
- `properties.ts`: `getFeaturedProperties()`, `getCatalogProperties(filters)`, `getPropertyById(id)`
- `services.ts`: `getActiveServicesForHome()`, `getAllActiveServices()`

Properties join `property_real_estate` OR `property_vehicles` depending on type. Use `getFirstRelation()` helper when mapping array-or-single relations from Supabase.

## API Routes

`src/pages/api/send-request-email.ts` — POST endpoint. Receives contact form data, inserts lead into Supabase `leads` table, sends two emails via Resend (confirmation to client, alert to admins fetched from `auth.users` with service role key).

## Environment Variables

```
PUBLIC_SUPABASE_URL        # Client-safe
PUBLIC_SUPABASE_ANON_KEY   # Client-safe
SUPABASE_SERVICE_ROLE_KEY  # Server-only (admin ops, email fetch)
RESEND_API_KEY             # Server-only
RESEND_FROM_DOMAIN         # Server-only
```

`PUBLIC_*` vars available in React islands. Non-prefixed vars server-side only (API routes, Astro frontmatter).

## Design System

Tailwind custom colors (defined in `tailwind.config.mjs`):

| Token | Hex | Use |
|---|---|---|
| `deepest` | `#0B2545` | Navbar, footer, dark section backgrounds |
| `primary` | `#134074` | Section backgrounds, card headers |
| `dark` | `#13315C` | Borders, shadows |
| `mid` | `#8DA9C4` | Secondary text, icons, borders |
| `light` | `#EEF4ED` | Light section backgrounds, text on dark |

Fonts:
- `Sansation` (self-hosted in `public/fonts/`) — headings via `@font-face`
- `Antic Didone` (via `@fontsource/antic-didone`) — body text

Alternate dark/light sections throughout pages. Cards use white bg, `mid` border.

## Routing

File-based Astro routing:
- `/` → `src/pages/index.astro`
- `/contacto` → contact form, pre-fills from `?property=<id>` or `?service=<id>` query params
- `/servicios` → services listing
- `/propiedades` → catalog with filters (`?tipo`, `?provincia`, `?canton`, `?distrito`)
- `/propiedades/[id]` → dynamic property detail
- `POST /api/send-request-email` → lead capture + email

## Images

Use Astro `<Image />` component — never plain `<img>`. Remote images from Cloudinary (configured in `astro.config.mjs` as allowed remote source). Fallback images required for missing property photos.

`formatPrice(amount, currency)` in `src/utils/formatPrice.ts` handles CRC (₡) and USD ($) via `Intl.NumberFormat`.

## Key Constraints (from AGENTS.md)

- Target audience: Costa Rica real estate buyers/renters — Spanish-language UI
- Sections alternate dark (`deepest`/`primary`) and light (`light`) backgrounds
- JSON-LD structured data required on property detail pages
- View Transitions enabled globally in `Layout.astro` — avoid breaking navigation animations
- GSAP for scroll-triggered animations, Motion for micro-animations
