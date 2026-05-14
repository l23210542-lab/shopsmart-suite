# Despliegue en Raspberry Pi 4: Apache + Node + MariaDB

Esta aplicación es **TanStack Start** (Node.js): Apache no ejecuta PHP para el frontend, pero puede servir como **proxy inverso** hacia el proceso Node que sirve la app y las _server functions_ (incluida la conexión a MariaDB).

## 1. MariaDB

1. Instala MariaDB en la Pi (paquete `mariadb-server` en Debian/Raspberry Pi OS).
2. Crea base de datos y usuario (ajusta contraseñas):

```sql
CREATE DATABASE cenit_pi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cenit'@'localhost' IDENTIFIED BY 'TU_PASSWORD';
GRANT ALL PRIVILEGES ON cenit_pi.* TO 'cenit'@'localhost';
FLUSH PRIVILEGES;
```

3. Aplica el esquema del repositorio:

```bash
mysql -u cenit -p cenit_pi < database/migrations/001_initial.sql
```

4. (Opcional) Datos mínimos de prueba:

```bash
mysql -u cenit -p cenit_pi < database/seed.sql
```

Hasta que existan filas en `categories` y `products`, la app usará el **catálogo estático** en memoria.

## 2. Variables de entorno (Node)

En el mismo host donde corre `node` (o `pm2`), define las variables del archivo [`.env.example`](../.env.example) o unidad `systemd` con `Environment=`.

Ejemplo en `/etc/cenit-pi.env`:

```
DATABASE_URL=mysql://cenit:TU_PASSWORD@127.0.0.1:3306/cenit_pi
```

## 3. Build y proceso Node

En la Pi (con Node 22+ recomendado por dependencias de TanStack):

```bash
npm ci
npm run build
node .output/server/index.mjs
```

La ruta exacta del artefacto puede variar según la versión del preset de build; revisa la salida de `vite build` o la documentación de `@tanstack/react-start` para tu versión.

Con **pm2**:

```bash
pm2 start .output/server/index.mjs --name cenit-pi
```

## 4. Apache como proxy (ejemplo)

Habilita módulos `proxy`, `proxy_http` y un virtual host que apunte al puerto de Node (ej. 3000):

```apache
<VirtualHost *:80>
    ServerName pi.local
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/
</VirtualHost>
```

Recarga Apache: `sudo systemctl reload apache2`.

## 5. Comportamiento de la app

- Si `DATABASE_URL` o `DB_HOST` + `DB_USER` + `DB_NAME` están definidos y las tablas tienen datos, el **catálogo** se lee desde MariaDB (`getCatalogFromDb`).
- Si falla la conexión o las tablas están vacías, se mantiene el **mock** (sin caer la página).
- Carrito, auth y órdenes siguen en **localStorage** hasta que implementes persistencia en BD.

## 6. Cloudflare Workers

El driver `mysql2` **no** es compatible con el runtime Workers. Los despliegues a Cloudflare deben seguir sin variables de BD o con otro backend (D1, Hyperdrive, API externa).
