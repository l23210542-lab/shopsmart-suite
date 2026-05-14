/**
 * Variables de entorno para MariaDB (solo servidor Node).
 * No usar prefijo VITE_* — no deben exponerse al cliente.
 *
 * Opción A — URL única:
 *   DATABASE_URL=mysql://usuario:contraseña@127.0.0.1:3306/cenit_pi
 *
 * Opción B — variables sueltas:
 *   DB_HOST=127.0.0.1
 *   DB_PORT=3306
 *   DB_USER=cenit
 *   DB_PASSWORD=secreto
 *   DB_NAME=cenit_pi
 */

function readEnv(key: string): string | undefined {
  if (typeof process === "undefined" || !process.env) return undefined;
  const v = process.env[key];
  return v === "" || v === undefined ? undefined : v;
}

export interface DatabaseEnv {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

function parseDatabaseUrl(url: string): DatabaseEnv | null {
  try {
    const u = new URL(url);
    if (u.protocol !== "mysql:" && u.protocol !== "mariadb:") return null;
    const database = u.pathname.replace(/^\//, "");
    if (!database) return null;
    const port = u.port ? Number(u.port) : 3306;
    const user = decodeURIComponent(u.username);
    const password = decodeURIComponent(u.password);
    const host = u.hostname;
    if (!host || !user) return null;
    return { host, port, user, password, database };
  } catch {
    return null;
  }
}

export function getDatabaseEnv(): DatabaseEnv | null {
  const url = readEnv("DATABASE_URL");
  if (url) {
    const parsed = parseDatabaseUrl(url);
    if (parsed) return parsed;
  }

  const host = readEnv("DB_HOST");
  const user = readEnv("DB_USER");
  const database = readEnv("DB_NAME");
  if (!host || !user || !database) return null;

  const portRaw = readEnv("DB_PORT");
  const port = portRaw ? Number(portRaw) : 3306;
  if (!Number.isFinite(port)) return null;

  return {
    host,
    port,
    user,
    password: readEnv("DB_PASSWORD") ?? "",
    database,
  };
}

export function isDatabaseConfigured(): boolean {
  return getDatabaseEnv() !== null;
}
