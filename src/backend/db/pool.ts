import type { Pool } from "mysql2/promise";
import { getDatabaseEnv } from "./env";

let poolPromise: Promise<Pool | null> | undefined;

/**
 * Pool compartido (lazy). Solo se crea si las variables de entorno están definidas.
 * Importación dinámica de `mysql2` para no forzar el bundle del cliente.
 */
export async function getDbPool(): Promise<Pool | null> {
  const env = getDatabaseEnv();
  if (!env) return null;

  if (!poolPromise) {
    poolPromise = (async () => {
      try {
        const { createPool } = await import("mysql2/promise");
        return createPool({
          host: env.host,
          port: env.port,
          user: env.user,
          password: env.password,
          database: env.database,
          waitForConnections: true,
          connectionLimit: 10,
          namedPlaceholders: true,
          enableKeepAlive: true,
          keepAliveInitialDelay: 0,
        });
      } catch (e) {
        console.error(
          "[cenit-pi] No se pudo cargar mysql2. Instala dependencias: npm install mysql2",
          e,
        );
        return null;
      }
    })();
  }

  return poolPromise;
}

export async function closeDbPool(): Promise<void> {
  if (!poolPromise) return;
  const p = await poolPromise;
  poolPromise = undefined;
  if (p) await p.end().catch(() => undefined);
}
