# Cenít Pi — Documentación del Sistema

> **Documento vivo.** Cada cambio significativo debe registrarse en [Historial de Cambios](#historial-de-cambios). Las secciones deben reflejar el **estado real** del código.
>
> Visión de producto: [`docs/prd.md`](./prd.md). Despliegue Apache/MariaDB: [`docs/deploy-mariadb-apache.md`](./deploy-mariadb-apache.md).

---

## 1. Resumen ejecutivo

**Cenít Pi** es un marketplace e-commerce inspirado en Amazon. El repositorio contiene **dos implementaciones en paralelo**:

| Rama | Ubicación | Rol |
|---|---|---|
| **Producción objetivo (Raspberry Pi / hosting Apache)** | `www/` | PHP 8.x, HTML/CSS, JS mínimo, PDO + MariaDB, **sin Node.js en el servidor**. Es la pila alineada con el PRD original. |
| **SPA de referencia / desarrollo asistido** | `src/` + Vite | React 19 + TanStack Start/Router, Tailwind, catálogo opcional vía Node + `mysql2`. Útil como referencia de UX y para entornos Cloudflare. |

- **Identidad:** marca **Cenít Pi** (antes *PiCommerce*). Paleta **violeta/morado** en ambas líneas (tokens OKLCH en React; variables CSS en PHP).
- **Base de datos:** MariaDB. Los modelos PHP están pensados para el esquema **`db/schema.sql`** (base `shopsmart`, categorías por `slug` como clave foránea en `products`). No confundir con `database/migrations/001_initial.sql`, que define tablas con otra forma (ver §6).
- **Autenticación PHP:** sesiones `$_SESSION` + `password_verify()` sobre `users.password_hash`. El archivo `db/seed.sql` puede incluir hashes pensados para el stack Node; para login PHP hace falta **hash compatible con PHP** (`password_hash` / bcrypt u algoritmo soportado por `password_verify`).

---

## 2. Dos stacks tecnológicos

### 2.1 Stack PHP (`www/`) — producción Apache

| Capa | Tecnología | Notas |
|---|---|---|
| Runtime | PHP 8.x | `declare(strict_types=1)` en archivos nuevos |
| Servidor | Apache 2.4+ | `DocumentRoot` → contenido de `www/`; ver `www/.htaccess` |
| Base de datos | MariaDB / MySQL | PDO en `www/config/db.php` |
| Plantillas | PHP embebido + `include` | `components/`, `views/` |
| Estilos | CSS plano | `www/assets/css/app.css` (sin Tailwind en build) |
| JS | Vanilla | `www/assets/js/app.js` (p. ej. menú móvil) |
| Sesión | `session_start` en `bootstrap.php` | Cookie `HttpOnly`, `SameSite=Lax` |
| Autoload | `spl_autoload_register` | Clases en `models/` y `controllers/` |

Variables de entorno usadas por PHP (Apache `SetEnv`, systemd, o en desarrollo `php -S` con variables del shell):

| Variable | Uso | Valor por defecto en código |
|---|---|---|
| `DB_HOST` | Host MariaDB | `127.0.0.1` |
| `DB_NAME` | Nombre base de datos | `shopsmart` |
| `DB_USER` | Usuario | `root` |
| `DB_PASS` | Contraseña | cadena vacía |
| `APP_NAME` | Título marca | `Cenít Pi` |
| `BASE_URL` | URL pública sin barra final | vacío |

> **Nota:** `.env.example` en la raíz usa a veces `DB_PASSWORD` para el stack Node. PHP lee **`DB_PASS`** (`www/config/db.php`). Unifica nombres en tu entorno o exporta ambas.

### 2.2 Stack React (raíz del repo)

| Capa | Tecnología | Versión (orientativa) |
|---|---|---|
| Lenguaje | TypeScript | 5.8 |
| UI | React | 19.x |
| Routing / SSR | TanStack Router + TanStack Start | ver `package.json` |
| Datos | TanStack Query, *server functions* | Catálogo vía `src/backend/` |
| Estilos | Tailwind CSS 4 | `src/styles.css` |
| Build | Vite + `@lovable.dev/vite-tanstack-config` | `npm run dev` / `npm run build` |

⚠ No duplicar plugins en `vite.config.ts` (ver comentarios en el propio archivo y en versiones anteriores de esta doc).

---

## 3. Estructura del repositorio (actualizada)

```
shopsmart-suite/
├── cursor/                      # Reglas Cursor (.mdc)
├── db/                          # Esquema y seeds alineados con PHP / demo shopsmart
│   ├── schema.sql               # CREATE DATABASE shopsmart + tablas (slug PK en categories)
│   ├── seed.sql                 # Categorías + usuarios demo (revisar compatibilidad hashes PHP)
│   ├── seed-products-generated.sql
│   └── generate-seed-products.mjs   # Node: regenera productos (solo dev; no hace falta en Pi en runtime)
├── database/                    # Migración alternativa / histórico TanStack (forma de tablas distinta)
│   └── migrations/001_initial.sql
├── docs/
│   ├── prd.md
│   ├── system.md                # Este archivo
│   └── deploy-mariadb-apache.md
├── www/                         # ★ Aplicación PHP (copiar a /var/www/html/ o DocumentRoot)
│   ├── .htaccess
│   ├── bootstrap.php            # APP_ROOT, config, sesión, autoload
│   ├── index.php, login.php, logout.php, register.php
│   ├── products.php, product.php, cart.php, checkout.php, orders.php
│   ├── dashboard.php, seller.php, admin.php
│   ├── config/app.php, config/db.php
│   ├── controllers/             # HomeController, ProductsController, ProductDetailController
│   ├── models/                  # Category, Product, User
│   ├── components/header.php, footer.php
│   ├── views/                   # home, products_list, product_detail, login, partials/
│   └── assets/css/app.css, js/app.js
├── src/                         # SPA React + TanStack (referencia / Cloudflare)
│   ├── backend/                 # mysql2, catalog.server.ts (no imports bajo src/server/** salvo entry)
│   ├── components/, lib/, routes/, ...
│   ├── server.ts, start.ts, router.tsx
│   └── styles.css
├── package.json, vite.config.ts, wrangler.jsonc, tsconfig.json
└── .env.example
```

---

## 4. Aplicación PHP (`www/`)

### 4.1 Arranque y flujo de petición

1. Cada página pública es un **script de entrada** (`index.php`, `products.php`, …) que hace `require_once __DIR__ . '/bootstrap.php'`.
2. `bootstrap.php` define `APP_ROOT`, carga `config/app.php` y `config/db.php`, inicia sesión y registra autoload para `models/*` y `controllers/*`.
3. El script instancia el controlador adecuado y delega; las vistas en `views/` incluyen `components/header.php` y `footer.php`.

Función global **`e()`** (`config/app.php`): escape HTML para mitigar XSS.

### 4.2 Mapeo de rutas (URLs ≈ archivos)

| URL (ejemplo) | Archivo | Descripción |
|---|---|---|
| `/index.php` o `/` | `index.php` | Inicio: hero, categorías rápidas, carruseles por categoría, destacados |
| `/products.php` | `products.php` | Listado; filtros GET `q`, `cat` |
| `/product.php?id=` | `product.php` | Detalle + relacionados; 404 si no existe |
| `/cart.php` | `cart.php` | Carrito en **sesión** (`$_SESSION['cart']`, `cart_count`); POST add/remove |
| `/checkout.php` | `checkout.php` | Esqueleto: pendiente persistencia en `orders` / `order_items` |
| `/login.php` | `login.php` | POST → `User::attemptLogin()` |
| `/logout.php` | `logout.php` | Cierra sesión |
| `/register.php` | `register.php` | Esqueleto registro |
| `/dashboard.php` | `dashboard.php` | Requiere sesión; enlaces a admin/seller según rol |
| `/admin.php` | `admin.php` | Solo `role === admin'` (403 si no) |
| `/seller.php` | `seller.php` | Panel vendedor (placeholder) |
| `/orders.php` | `orders.php` | Esqueleto listado de pedidos |

No hay router SPA: la navegación es **enlaces y redirecciones HTTP** tradicionales.

### 4.3 Modelos (PDO)

- **`Category`**: listado desde `categories` (`slug`, `name`).
- **`Product`**: consultas a `products` con alias de columnas (`image_url` → `image`, etc.) alineadas a `db/schema.sql`.
- **`User`**: `findByEmail`, `attemptLogin` (comprueba `password_hash` con `password_verify`), `current()`, `logout()`.

Todas las consultas parametrizadas deben seguir en los modelos/controladores con **`prepare` / `execute`**.

### 4.4 Carrito (sesión)

- Estructura: array de líneas `{ id: product_id, qty: int }` en `$_SESSION['cart']`.
- **`cart_count`**: suma de cantidades (badge en header).
- No está sincronizado aún con la tabla `cart_items` de `db/schema.sql` (persistencia por usuario logueado = trabajo futuro).

### 4.5 Assets y UI

- **`assets/css/app.css`**: layout tipo SaaS (header sticky, hero, grids, tarjetas de producto, sidebar en listado, detalle, login, carrito).
- **`assets/js/app.js`**: toggle del menú móvil (`#navToggle`, `#mobile-nav`).
- Rutas de assets relativas al DocumentRoot (`href="assets/css/app.css"`).

### 4.6 Apache

- `www/.htaccess`: `DirectoryIndex index.php`, UTF-8, `-Indexes`, cabecera `X-Content-Type-Options`.
- En producción, configurar credenciales vía `SetEnv DB_HOST` … (no commitear secretos).

### 4.7 Desarrollo local sin Apache (similar a “dev server”)

Desde la carpeta `www/`:

```bash
export DB_HOST=127.0.0.1
export DB_NAME=shopsmart
export DB_USER=root
export DB_PASS=tu_clave
php -S localhost:8080
```

Abre `http://localhost:8080/`. No es Vite: no hay HMR; al guardar `.php` la siguiente recarga muestra el cambio.

En **Windows PowerShell**:

```powershell
cd ruta\al\repo\www
$env:DB_HOST="127.0.0.1"; $env:DB_NAME="shopsmart"; $env:DB_USER="root"; $env:DB_PASS="..."
php -S localhost:8080
```

---

## 5. Aplicación React (`src/`) — resumen

Sigue existiendo la **SPA con TanStack Start**: rutas en `src/routes/`, layout en `__root.tsx`, catálogo resuelto en `beforeLoad` (`src/lib/catalog-resolve.ts`) con datos MariaDB opcionales o mock (`catalog-static.ts`). Carrito, auth simulada y órdenes pueden seguir en **`localStorage`** (claves `picommerce.*` conservadas por compatibilidad).

Detalle de routing, validación Zod en `/products`, tokens Tailwind en `src/styles.css` y convenciones React: mantener coherencia con `cursor/*.mdc` y con el código en `src/`; esta documentación ya no duplica cada ruta React en profundidad porque el **camino de despliegue en Pi sin Node** es `www/`.

---

## 6. Base de datos MariaDB — dos fuentes de esquema

| Ruta archivo | Propósito | Uso recomendado |
|---|---|---|
| **`db/schema.sql`** | Base `shopsmart`, `categories.slug` como PK, `products.category_slug` FK | **Alineado con `www/models/*.php`** y seeds en `db/seed*.sql` |
| **`database/migrations/001_initial.sql`** | Script idempotente con `DROP TABLE`, categorías con `id` autoincrement y `slug` único | Evolución / otro consumidor (p. ej. experimentos); **no mezclar** con los modelos PHP actuales sin adaptar SQL y PHP |

Antes de desplegar PHP:

1. Aplicar `db/schema.sql` y seeds según comentarios al inicio de esos ficheros.
2. Opcional: regenerar productos con `node db/generate-seed-products.mjs` en máquina de desarrollo y volcar el SQL generado.

---

## 7. Sistema de diseño

### 7.1 React (`src/styles.css`)

Tokens **OKLCH** en `:root` / `.dark`, consumidos por Tailwind v4 (`@theme inline`). Regla: no hardcodear violetas sueltos; usar tokens semánticos (`bg-primary`, `bg-nav`, `text-price`, etc.).

### 7.2 PHP (`www/assets/css/app.css`)

Variables CSS (`--bg`, `--primary`, `--surface`, …), layout con flexbox/grid, misma línea estética **marketplace violeta** sin compilador Tailwind.

---

## 8. Scripts npm (solo stack React)

```bash
npm install
npm run dev          # Vite + SSR TanStack
npm run build
npm run lint
npm run format
```

**Producción solo PHP:** no hace falta `npm` en el servidor; basta copiar `www/` y tener PHP + Apache + MariaDB.

---

## 9. Brechas y trabajo futuro

| Área | Estado PHP (`www/`) | Estado React (`src/`) |
|---|---|---|
| Catálogo | MariaDB vía PDO | MariaDB opcional + mock |
| Login | Sesión + `password_verify` | Simulado / localStorage |
| Registro | Placeholder | UI completa |
| Carrito | Sesión PHP | localStorage |
| Checkout / órdenes | Placeholders | Flujo UI + localStorage |
| Admin CRUD | Placeholder | UI mock |
| Contraseñas seed `db/seed.sql` | Pueden no ser verificables por `password_verify` si son hashes no estándar de Node | N/A |

---

## 10. Operaciones comunes

### Añadir una página PHP

1. Crear `www/mi-pagina.php` con `require_once __DIR__ . '/bootstrap.php'`.
2. Incluir `components/header.php` tras definir `$title`.
3. Añadir enlace en `header.php` / `footer.php` si aplica.

### Añadir endpoint o lógica reutilizable

- Consultas nuevas → métodos estáticos en `models/` o clase dedicada.
- Orquestación → `controllers/` y un solo `require` de vista.

### Cambiar estilos globales PHP

Editar solo `www/assets/css/app.css`.

### Añadir ruta React

Crear `src/routes/...`; el plugin regenera `routeTree.gen.ts` en dev.

### Checklist despliegue Raspberry Pi (PHP)

| Paso | Descripción |
|---|---|
| 1 | Instalar Apache, PHP 8.x (ext `pdo_mysql`), MariaDB |
| 2 | Crear base y usuario; importar `db/schema.sql` + seeds |
| 3 | Copiar contenido de `www/` al DocumentRoot |
| 4 | Configurar `SetEnv` para `DB_*` (y `APP_NAME` si se desea) |
| 5 | Comprobar permisos y que `mod_rewrite` / `.htaccess` estén permitidos si se amplía reglas |

---

## Historial de Cambios

> Formato: `[YYYY-MM-DD] — Título · Descripción · Archivos / impacto`.

### [2026-05-13] — Documentación: dual stack PHP (`www/`) + React; esquemas `db/` vs `database/`

- **Descripción:** `docs/system.md` reescrito para reflejar el estado real: aplicación **PHP 8 + PDO + sesiones** en `www/` como destino Apache/Pi; SPA React como segunda línea. Detalle de rutas PHP, variables `DB_*` / `DB_PASS`, carrito en sesión, assets, `php -S` para desarrollo, advertencia sobre dos esquemas SQL y sobre hashes de `db/seed.sql` vs `password_verify`.
- **Archivos:** `docs/system.md`.

### [2026-05-13] — Integración MariaDB (catálogo) + guía Apache en Raspberry Pi (stack React/Node)

- **Descripción:** Pool `mysql2`, repositorio, *server functions*, resolución de catálogo en `beforeLoad`, hook `useAppCatalog()`, guía `deploy-mariadb-apache.md`, `.env.example`. Código servidor en `src/backend/` (no `src/server/**` salvo entry).
- **Archivos:** `src/backend/**`, `database/**`, `src/lib/catalog-*.ts`, `src/routes/__root.tsx`, etc.

### [2026-05-13] — Documento de sistema inicializado (versión solo-React)

- **Descripción:** Primera versión de `docs/system.md` centrada únicamente en TanStack + React.
- **Archivos:** `docs/system.md`.

### [2026-05-13] — Rebranding visual: `PiCommerce` → `Cenít Pi`

- **Descripción:** Marca y metadatos; avatar `C`; claves `localStorage` `picommerce.*` sin cambiar.
- **Archivos:** `src/components/Header.tsx`, `Footer.tsx`, rutas varias, `www/config/app.php` (`APP_NAME`).

### [2026-05-13] — Paleta violeta/morado (React)

- **Descripción:** Tokens OKLCH hue 295 en `src/styles.css`.
- **Archivos:** `src/styles.css`, `www/assets/css/app.css` (paridad visual aproximada en PHP).

### [2026-05-13] — Conflicto Zod resuelto (npm)

- **Descripción:** Fijación Zod v3 por peers.
- **Archivos:** `package.json`.

---

### Plantilla para nuevas entradas

```
### [YYYY-MM-DD] — Título corto
- **Descripción:** Qué cambió y por qué.
- **Archivos:** rutas clave.
- **Impacto / breaking:** si aplica.
```
