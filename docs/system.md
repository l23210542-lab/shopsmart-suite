# Cenít Pi — Documentación del Sistema

> **Documento vivo.** Cada cambio que se implemente en la aplicación debe registrarse en la sección [Historial de Cambios](#historial-de-cambios) al final de este archivo, e idealmente debe propagarse a las secciones afectadas (rutas, paleta, dependencias, etc.).
>
> Este documento describe el **estado real** del código en el repositorio. Para la visión de producto original (que difiere en stack) consulta [`docs/prd.md`](./prd.md).

---

## 1. Resumen ejecutivo

**Cenít Pi** (anteriormente *PiCommerce*) es un marketplace e-commerce inspirado en Amazon. El PRD lo concibió como una aplicación PHP 8 + MariaDB desplegable sobre una Raspberry Pi 4, pero la implementación actual en este repositorio es una **SPA / SSR con React + TanStack Start**, pensada para desplegarse sobre **Cloudflare Workers** y desarrollarse de forma asistida por IA en Cursor IDE.

La interfaz cubre las funcionalidades del MVP del PRD (catálogo, carrito, checkout, órdenes, paneles de vendedor y admin, autenticación con roles). El **catálogo** puede servirse desde **MariaDB** (variables `DATABASE_URL` / `DB_*` en el servidor Node) o, si no hay conexión o tablas vacías, desde **datos estáticos** en memoria. Carrito, auth y órdenes siguen en `localStorage` hasta que se implemente persistencia en BD.

Identidad visual actual: **paleta violeta/morado** (hue OKLCH 295) con magenta-rosa (hue 340) para precios y ámbar para estrellas de calificación.

---

## 2. Stack tecnológico

| Capa | Tecnología | Versión | Notas |
|---|---|---|---|
| Lenguaje | TypeScript | 5.8 | `strict` activo vía `tsconfig.json` |
| UI | React | 19.2 | Modo concurrente |
| Routing | `@tanstack/react-router` | 1.168 | Rutas basadas en archivos (`src/routes/**`) |
| Framework SSR | `@tanstack/react-start` | 1.167 | Entry de servidor: `src/server.ts` |
| Datos / cache | `@tanstack/react-query` | 5.83 | Cliente creado por request en `src/router.tsx` |
| Validación | `zod` | 3.25.x | Search params en `/products` (`validateSearch`) |
| Base de datos (opcional) | `mysql2` | 3.14.x | Solo en **Node**; conexión MariaDB/MySQL vía pool |
| Estilos | Tailwind CSS | 4.2 | Plugin de Vite, sin `tailwind.config.*` |
| Animaciones | `tw-animate-css` | 1.3 | Importado desde `styles.css` |
| Primitivos UI | Radix UI + shadcn/ui | varias | Generados en `src/components/ui/**` |
| Iconografía | `lucide-react` | 0.575 | |
| Formularios | `react-hook-form` + `@hookform/resolvers` | 7 / 5 | |
| Notificaciones | `sonner` | 2.0 | `<Toaster>` montado en `__root.tsx` |
| Build / dev | Vite + `@lovable.dev/vite-tanstack-config` | 7.3 / 1.7 | Wrapper que incluye los plugins de TanStack Start, Tailwind, Cloudflare, etc. |
| Deploy | Cloudflare Workers (`wrangler.jsonc`) | — | El plugin `@cloudflare/vite-plugin` corre solo en build |
| Linter / formato | ESLint 9 + Prettier 3 | — | `eslint.config.js` flat config |
| Gestor de paquetes | npm (también `bun.lock` presente) | — | El error histórico de `npm install` se resolvió bajando Zod a v3 |

> ⚠ **No editar `vite.config.ts` para añadir plugins de TanStack Start, Tailwind o Cloudflare** — ya los incluye `@lovable.dev/vite-tanstack-config` y se romperán por duplicado.

---

## 3. Estructura del repositorio

```
shopsmart-suite/
├── cursor/                 # Reglas .mdc consumidas por Cursor IDE
│   ├── React.mdc
│   ├── Tailwind.mdc
│   └── Typescript.mdc
├── database/
│   ├── migrations/         # SQL idempotente (MariaDB)
│   └── seed.sql            # Datos mínimos opcionales
├── docs/
│   ├── prd.md
│   ├── system.md
│   └── deploy-mariadb-apache.md  # Guía Pi + Apache + Node + MariaDB
├── src/
│   ├── backend/            # Lógica de servidor y MariaDB (no usar carpeta src/server/** en imports cliente — lo bloquea TanStack)
│   │   ├── catalog.server.ts   # createServerFn: catálogo, producto, ping
│   │   └── db/
│   │       ├── env.ts
│   │       ├── pool.ts
│   │       └── catalog-repository.ts
│   ├── components/
│   │   ├── ui/             # shadcn/ui (Radix wrappers) generados — no editar a mano
│   │   ├── CategoryRow.tsx # Carrusel horizontal de productos por categoría
│   │   ├── Footer.tsx      # Footer global con branding Cenít Pi
│   │   ├── Header.tsx      # Header sticky, search, dropdowns, sub-nav
│   │   └── ProductCard.tsx # Tarjeta reutilizable de producto
│   ├── hooks/
│   │   └── use-mobile.tsx  # Hook de breakpoint mobile
│   ├── lib/
│   │   ├── auth.tsx
│   │   ├── cart.tsx
│   │   ├── catalog.ts           # Re-export de tipos + datos estáticos
│   │   ├── catalog-types.ts
│   │   ├── catalog-static.ts    # Mock cuando no hay MariaDB
│   │   ├── catalog-helpers.ts
│   │   ├── catalog-resolve.ts   # beforeLoad: MariaDB o estático
│   │   ├── use-app-catalog.ts   # Hook: contexto raíz `catalog`
│   │   ├── error-capture.ts
│   │   ├── error-page.ts
│   │   └── utils.ts        # cn() helper (clsx + tailwind-merge)
│   ├── routes/             # Rutas file-based de TanStack Router
│   │   ├── __root.tsx      # Layout raíz (providers, head, error/404)
│   │   ├── index.tsx       # Home
│   │   ├── products.tsx    # Listado + filtros (search validada con Zod)
│   │   ├── product.$id.tsx # Detalle de producto (con loader + notFound)
│   │   ├── cart.tsx
│   │   ├── checkout.tsx
│   │   ├── orders.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── seller.tsx      # Panel vendedor (requiere role !== "customer")
│   │   └── admin.tsx       # Panel admin (requiere role === "admin")
│   ├── routeTree.gen.ts    # Generado automáticamente — no editar
│   ├── router.tsx          # Factory del router + QueryClient por request
│   ├── server.ts           # Entry SSR (envuelve errores)
│   ├── start.ts            # Entry del cliente
│   └── styles.css          # Tokens CSS (paleta) + utilidades Tailwind
├── package.json
├── tsconfig.json
├── vite.config.ts          # ⚠ thin wrapper sobre @lovable.dev/vite-tanstack-config
└── wrangler.jsonc          # Configuración Cloudflare Workers
```

---

## 4. Arquitectura de la aplicación

### 4.1 Routing

- Routing **file-based** vía `@tanstack/react-router`. Cada archivo en `src/routes/` exporta `Route = createFileRoute(...)`. El árbol final se compila a `routeTree.gen.ts` (generado, no editar).
- El router se construye en `src/router.tsx` con `scrollRestoration: true` y un `QueryClient` por request, lo cual es crítico para SSR (evita compartir cache entre usuarios).
- El layout raíz vive en `src/routes/__root.tsx` y define:
  - `<HeadContent />` con metadatos OG y `<title>Cenít Pi — Marketplace sobre Raspberry Pi</title>`.
  - El shell HTML completo (`<html><head><body>`) en `RootShell`.
  - `beforeLoad` en la raíz: resuelve `catalog` vía `resolveCatalogForApp()` (MariaDB si está configurado y hay datos; si no, mock estático). El objeto se expone en el **contexto del router** (`catalog: AppCatalogBundle`).
  - Providers globales: `QueryClientProvider → AuthProvider → CartProvider` (este último recibe `resolveProduct` basado en `catalog.products` para precios/stock coherentes con la BD).
  - `<Header />`, `<main><Outlet/></main>`, `<Footer />`, `<Toaster />`.
  - `NotFoundComponent` y `ErrorComponent` con CTA para reintentar / volver al home.

### 4.2 Capa de datos

1. **Catálogo (MariaDB opcional + mock)**
   - Esquema SQL: `database/migrations/001_initial.sql` (tablas `users`, `categories`, `products`, `carts`, `cart_items`, `orders`, `order_items` alineadas al PRD).
   - Conexión: `mysql2/promise` con pool lazy en `src/backend/db/pool.ts`. Variables **solo servidor**: `DATABASE_URL` o `DB_HOST` + `DB_USER` + `DB_NAME` (+ `DB_PORT`, `DB_PASSWORD`). Ver [`.env.example`](../.env.example).
   - Consultas: `src/backend/db/catalog-repository.ts`.
   - API interna (TanStack `createServerFn`): `src/backend/catalog.server.ts` — `getCatalogFromDb`, `getProductByIdFromDb`, `pingMariaDb`.
   - Resolución en arranque de ruta: `src/lib/catalog-resolve.ts` llamada desde `beforeLoad` en `__root.tsx`. Las pantallas usan `useAppCatalog()` (`src/lib/use-app-catalog.ts`) para leer `products`, `categories`, `findProduct`, `productsByCategory` y el flag `source: 'mariadb' | 'static'`.
   - **Importante:** no coloques código importable por el cliente bajo `src/server/**` (distinto de `src/server.ts`); el plugin de TanStack **bloquea** esos imports en el bundle cliente. Por eso la capa BD vive en `src/backend/`.

2. **Contextos React**
   - `AuthProvider` (`src/lib/auth.tsx`): roles + `localStorage` (`picommerce.user`).
   - `CartProvider` (`src/lib/cart.tsx`): carrito y órdenes en `localStorage` (`picommerce.cart`, `picommerce.orders`); precios y stock se resuelven con `resolveProduct` inyectado desde la raíz.

#### Nota: claves de localStorage

Las claves se llaman aún `picommerce.*` pese al rebrand a Cenít Pi. **Se mantienen intencionalmente** para no invalidar sesiones existentes de usuarios; un futuro cambio debería incluir una pequeña migración (`migrateLocalStorage()` que lea de las claves viejas y escriba en las nuevas).

### 4.3 Validación de search params

La ruta `/products` valida el query string con un schema **Zod** pasado directamente a `validateSearch`:

```6:15:src/routes/products.tsx
const productSearchSchema = z.object({
  q: z.string().optional(),
  cat: z.string().optional(),
  sort: z.enum(["relevant", "price-asc", "price-desc", "rating"]).optional(),
});

export const Route = createFileRoute("/products")({
  validateSearch: productSearchSchema,
  component: Products,
});
```

### 4.4 SSR y despliegue

- `src/server.ts` es el entry de Cloudflare Worker (referenciado desde `vite.config.ts` → `tanstackStart.server.entry`).
- `src/start.ts` es el entry del cliente que hidrata el árbol.
- El `wrangler.jsonc` declara los binds para deploy en Workers; `@cloudflare/vite-plugin` solo participa en `vite build`.

---

## 5. Sistema de diseño

### 5.1 Filosofía

Toda la paleta se expresa como **variables CSS en `:root`** (modo claro) y `.dark` (modo oscuro) en `src/styles.css`, en espacio de color **OKLCH** para coherencia perceptual. Tailwind v4 las consume vía el bloque `@theme inline` que las expone como `--color-*`, generando utilidades como `bg-primary`, `text-nav-foreground`, `ring-primary`, etc.

**Regla operativa:** ningún componente debe usar valores HEX/RGB hardcodeados ni clases de color crudas como `bg-purple-600`. Siempre tokens semánticos.

### 5.2 Tokens (modo claro)

| Token | Valor OKLCH | Uso |
|---|---|---|
| `--background` | `0.985 0.006 295` | Fondo de página |
| `--foreground` | `0.18 0.03 295` | Texto principal |
| `--card` / `--popover` | `1 0 0` | Tarjetas y popovers |
| `--primary` | `0.58 0.22 295` | **Violeta principal** — CTAs, badges |
| `--primary-foreground` | `0.985 0 0` | Texto sobre primary (blanco) |
| `--secondary` / `--muted` | `0.96 0.012 295` | Bloques neutros tintados |
| `--accent` | `0.94 0.045 295` | Hover lavanda |
| `--destructive` | `0.6 0.22 25` | Rojo de error |
| `--border` / `--input` | `0.9 0.015 295` | Bordes / inputs |
| `--ring` | `0.58 0.22 295` | Focus ring (= primary) |
| `--nav` | `0.22 0.07 295` | **Violeta profundo** — header sticky / footer |
| `--nav-accent` | `0.30 0.09 295` | Sub-nav del header |
| `--nav-foreground` | `0.98 0 0` | Texto sobre nav |
| `--price` | `0.55 0.22 340` | **Magenta-rosa** — precios y links contextuales |
| `--success` | `0.6 0.15 150` | Verde de estado |
| `--rating` | `0.80 0.16 80` | Ámbar para estrellas (convención UX) |
| `--gradient-hero` | `linear-gradient(180deg, oklch(0.22 0.07 295), oklch(0.40 0.18 295))` | Fondo del hero en home |

### 5.3 Tokens (modo oscuro)

El modo oscuro se activa con la clase `.dark` en un ancestro. Hereda la hue 295 y oscurece base, manteniendo `--primary` más claro (`0.68`) para preservar contraste sobre fondos oscuros.

### 5.4 Logo y branding

- **Wordmark:** `Cenít <span class="text-primary">Pi</span>` — la sílaba **Pi** queda resaltada en `text-primary` violeta. Conserva la conexión simbólica con Raspberry Pi descrita en el PRD.
- **Avatar:** círculo `bg-primary` con la letra `C` en blanco.
- Aparece en `Header`, `Footer`, `login`, `register`.

---

## 6. Catálogo de rutas

| Ruta | Archivo | Componente | Acceso | Funcionalidad |
|---|---|---|---|---|
| `/` | `routes/index.tsx` | `Index` | público | Home: hero, 4 categorías destacadas, trust bar, filas por categoría |
| `/products` | `routes/products.tsx` | `Products` | público | Listado con sidebar de categorías, búsqueda (`?q=`), filtro por categoría (`?cat=`) y orden (`?sort=`); search params validados con Zod |
| `/product/$id` | `routes/product.$id.tsx` | `Detail` | público | Detalle con `loader`, `notFound` y `errorComponent`, productos relacionados |
| `/cart` | `routes/cart.tsx` | `Cart` | público (estado local) | Lista de items, +/-, eliminar, subtotal, CTA checkout |
| `/checkout` | `routes/checkout.tsx` | `Checkout` | público | Formulario en 3 pasos, calcula envío (gratis sobre S/ 100), crea orden |
| `/orders` | `routes/orders.tsx` | `Orders` | público (lee localStorage) | Historial de órdenes del usuario actual |
| `/login` | `routes/login.tsx` | `Login` | público | Login simulado (no valida password real) — toast "Bienvenido a Cenít Pi" |
| `/register` | `routes/register.tsx` | `Register` | público | Crea cuenta con rol (customer/seller/admin) |
| `/seller` | `routes/seller.tsx` | `Seller` | requiere `user.role !== "customer"` | Estadísticas de productos, ventas, tabla CRUD (mock) |
| `/admin` | `routes/admin.tsx` | `Admin` | requiere `user.role === "admin"` | Dashboard con stats, órdenes recientes y resumen de categorías |

### Componentes compartidos

- `Header.tsx` — sticky, branding, search global, dropdown de categorías, dropdown de cuenta, contador del carrito.
- `Footer.tsx` — 4 columnas + copyright.
- `ProductCard.tsx` — tarjeta con imagen, rating, precio, CTA "Añadir al carrito". Variante `compact` para carruseles.
- `CategoryRow.tsx` — carrusel horizontal con flechas de scroll programático.

---

## 7. Convenciones de código

Resumen aplicado a este proyecto, derivado de `cursor/React.mdc`, `cursor/Tailwind.mdc` y `cursor/Typescript.mdc`:

1. **TypeScript estricto.** Evitar `any`, `as`, `!`. Preferir `interface` sobre `type` para shapes nominales (en este repo se usa `type` para uniones / aliases — no es estricto, pero la regla aplica para nuevos contratos).
2. **Componentes funcionales puros**, sin clases.
3. **Named exports** para componentes y utilidades.
4. **Estilos con Tailwind utilitarios + tokens semánticos.** No usar CSS plano salvo en `styles.css`. No usar paletas crudas (`bg-purple-700`); usar tokens (`bg-primary`, `bg-nav`, `text-price`).
5. **Handlers con prefijo `handle`** (ej. `handleSubmit`, `handleClick`).
6. **Early returns** para legibilidad. Ejemplo: estados vacíos en `/cart` y `/orders` retornan antes del JSX principal.
7. **Accesibilidad:** botones de scroll y de cantidad llevan `aria-label`. Mantener este patrón en componentes nuevos.
8. **Comentarios:** solo cuando expliquen intención no obvia. Evitar narrar el código.
9. **No editar `src/components/ui/**` a mano** — son generados por shadcn/ui CLI.
10. **No editar `src/routeTree.gen.ts`** — lo regenera el plugin de TanStack Router en dev/build.

---

## 8. Scripts y desarrollo

Definidos en `package.json`:

```bash
npm install            # Instala dependencias (Zod debe quedar en v3.x)
npm run dev            # Vite dev server (HMR + SSR de TanStack Start)
npm run build          # Build de producción (Cloudflare-compatible)
npm run build:dev      # Build en modo desarrollo
npm run preview        # Previsualiza el build
npm run lint           # ESLint sobre todo el repo
npm run format         # Prettier --write
```

Variables de entorno: cualquier prefijada con `VITE_*` es inyectada automáticamente por `@lovable.dev/vite-tanstack-config`.

---

## 9. Brechas conocidas vs PRD

| Aspecto | PRD | Implementación actual |
|---|---|---|
| Backend | PHP 8 + MVC | **Node** (TanStack Start SSR + *server functions*); sin PHP en este repo |
| Base de datos | MariaDB + PDO | **Catálogo** opcional vía `mysql2` + SQL en `database/`; carrito/auth/órdenes aún en `localStorage` |
| Servidor | Apache2 sobre Raspberry Pi 4 | Ver [deploy-mariadb-apache.md](./deploy-mariadb-apache.md): Apache como proxy a **Node** (TanStack Start). Cloudflare Workers sigue soportado sin variables de BD. |
| Auth | Sesiones PHP, password hashing | Login simulado sin validar password, persistencia en `localStorage` |
| API REST | `/api/auth/*`, `/api/products/*`, etc. | Parcial: *server functions* (`createServerFn`) para catálogo y ping BD; sin REST clásico para auth/carrito aún |
| Imágenes | Upload local en `/public/uploads` | URLs externas de Unsplash |
| CSRF / XSS | Tokens, sanitización | React escapa por defecto; no hay CSRF porque no hay backend |
| Roles | admin / seller / customer | ✅ Implementados con gating en `/seller` y `/admin` |
| Funcionalidades MVP UI | Catálogo, carrito, checkout, órdenes, dashboards | ✅ Todas presentes (lado cliente) |

> Si en algún momento se decide migrar a PHP + MariaDB según el PRD, la capa de presentación de este repo puede servir como **referencia visual y de UX**, pero la arquitectura completa cambiaría.

---

## 10. Operaciones comunes

### Añadir una ruta nueva

1. Crear archivo en `src/routes/mi-ruta.tsx`.
2. Exportar `Route = createFileRoute("/mi-ruta")({ component: MiRuta })`.
3. El plugin de TanStack Router regenera `routeTree.gen.ts` en dev.
4. Si requiere autorización, añadir guard al inicio del componente (patrón usado en `seller.tsx` y `admin.tsx`).

### Añadir un producto / categoría

- **Con MariaDB:** insertar en tablas `categories` y `products` (ver `database/migrations/001_initial.sql`) o extender `database/seed.sql`.
- **Sin MariaDB (mock):** editar `src/lib/catalog-static.ts`.

### Ajustar la paleta

Editar exclusivamente los tokens en `:root` y `.dark` de `src/styles.css`. No tocar componentes individuales: el cambio se propaga vía clases utilitarias.

### Añadir un componente shadcn/ui

Usar la CLI oficial de shadcn apuntando a `components.json`. Se generará en `src/components/ui/`.

### Checklist: Raspberry Pi + MariaDB + Apache

Lo que ya está en código y documentación:

| Listo | Descripción |
|---|---|
| ✅ | Esquema inicial: `database/migrations/001_initial.sql` |
| ✅ | Semilla opcional: `database/seed.sql` |
| ✅ | Variables de entorno documentadas: `.env.example` |
| ✅ | Pool y consultas: `src/backend/db/*`, funciones servidor `src/backend/catalog.server.ts` |
| ✅ | UI del catálogo lee BD si hay datos; si no, mock (`catalog-static`) |
| ✅ | Guía de despliegue: [deploy-mariadb-apache.md](./deploy-mariadb-apache.md) (Apache → proxy a Node) |

Lo que **cada** entorno (local, Pi, staging) debe configurar fuera del repo:

- Archivo `.env` o variables del sistema con `DATABASE_URL` o `DB_*` (nunca commitear secretos).
- Ejecutar migraciones SQL en MariaDB después de `git pull` si añadís nuevas migraciones en `database/migrations/`.
- Node en la Pi (versión compatible con el proyecto; revisad `engines` en dependencias de TanStack si añadís restricciones).

Lo que **aún no** está en BD (sigue `localStorage`): sesión simulada, carrito, órdenes. Eso es trabajo futuro si el MVP debe ser 100 % MariaDB.

### Trabajo en equipo (convenciones)

1. **No editar a mano** `src/routeTree.gen.ts` — se regenera al arrancar `npm run dev` o al hacer `build`. Si hay conflictos de merge, resolvedlos regenerando tras fusionar rutas.
2. **Código solo servidor / MariaDB** va bajo `src/backend/`, no bajo `src/server/` (excepto el entry `src/server.ts`), para no romper el bundle cliente (TanStack).
3. **Cambios en SQL:** nuevos archivos `database/migrations/00X_nombre.sql` con nombre incremental; documentad en el [Historial de Cambios](#historial-de-cambios) y en descripciones de PR.
4. **Catálogo en UI:** preferir `useAppCatalog()` y el contexto de raíz; no reintroducir imports directos de arrays estáticos salvo en `catalog-static` / `catalog-resolve`.
5. Tras cambios relevantes, actualizar este archivo (`docs/system.md`) según la regla del documento vivo.

Recomendación para el equipo: como mínimo `npm run lint` y `npm run build` antes de fusionar ramas; si más adelante tenéis CI, automatizad esos pasos allí.

---

## Historial de Cambios

> **Regla:** cada PR / cambio significativo añade una entrada aquí, en orden cronológico inverso (más reciente arriba). Formato: `[YYYY-MM-DD] — Título · Descripción · Archivos clave`.

### [2026-05-13] — Integración MariaDB (catálogo) + guía Apache en Raspberry Pi
- **Descripción:** Añadidos esquema SQL (`database/migrations`), pool `mysql2`, repositorio de consultas, *server functions* (`getCatalogFromDb`, `getProductByIdFromDb`, `pingMariaDb`), resolución del catálogo en `beforeLoad` de la raíz y hook `useAppCatalog()`. `CartProvider` acepta `resolveProduct` para alinear precios/stock con la BD. Dependencia `mysql2`. Documentación `docs/deploy-mariadb-apache.md` y `.env.example`. La carpeta de código se llama `src/backend/` (no `src/server/`) porque TanStack bloquea imports cliente desde `**/server/**`.
- **Archivos:** `src/backend/**`, `database/**`, `src/lib/catalog-*.ts`, `src/lib/use-app-catalog.ts`, `src/lib/catalog-resolve.ts`, `src/routes/__root.tsx`, `src/router.tsx`, `src/lib/cart.tsx`, rutas que consumían `@/lib/catalog`, `package.json`, `docs/system.md`, `docs/deploy-mariadb-apache.md`, `.env.example`.
- **Impacto:** en Raspberry Pi con Node, define variables de entorno y ejecuta la migración; hasta que haya filas en `products`/`categories`, la app sigue usando el mock.

### [2026-05-13] — Documento de sistema inicializado
- **Descripción:** Se crea `docs/system.md` como documento vivo que refleja el estado real del repositorio y se mantendrá actualizado por cambio.
- **Archivos:** `docs/system.md` (nuevo).

### [2026-05-13] — Rebranding visual: `PiCommerce` → `Cenít Pi`
- **Descripción:** Cambio de nombre de marca en todos los componentes visibles, head metadata y textos legales. Se actualizó la letra del avatar circular (P → C) y se reorganizó el wordmark a `Cenít` + `Pi` (con la sílaba "Pi" en `text-primary`).
- **Archivos:** `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/routes/__root.tsx`, `src/routes/index.tsx`, `src/routes/admin.tsx`, `src/routes/login.tsx`, `src/routes/register.tsx`, `src/routes/checkout.tsx`.
- **Nota técnica:** las claves de `localStorage` siguen siendo `picommerce.*` para no invalidar sesiones existentes.

### [2026-05-13] — Paleta migrada a violeta/morado
- **Descripción:** Se sustituyó el esquema naranja-Amazon (hue 65) + azul-oscuro nav (hue 260) por una paleta unificada en hue **295 (violeta)** con magenta-rosa (340) para precios y ámbar (80) para ratings. Se rearmonizaron también las sombras y el `--gradient-hero`. Modo claro y oscuro coordinados.
- **Archivos:** `src/styles.css`.
- **Impacto:** todos los componentes que consumen tokens (`bg-primary`, `bg-nav`, `text-price`, `ring-primary`, etc.) se repintan automáticamente.

### [2026-05-13] — Conflicto de peer dependency Zod resuelto
- **Descripción:** `npm install` fallaba con `ERESOLVE` cuando el proyecto usaba `zod@^4.x` junto a dependencias que esperan Zod v3. Se fijó Zod en `^3.25.x` (compatible con validación en rutas y *server functions*).
- **Archivos:** `package.json`.

---

### Plantilla para nuevas entradas

```
### [YYYY-MM-DD] — Título corto del cambio
- **Descripción:** Qué cambió y por qué (1–3 frases).
- **Archivos:** lista de archivos clave.
- **Impacto / breaking:** notas de migración si aplica.
```
