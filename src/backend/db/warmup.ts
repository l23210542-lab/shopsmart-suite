import { pingDatabase } from "./catalog-repository";
import { isDatabaseConfigured } from "./env";

let scheduled = false;

/**
 * Inicializa el pool de MariaDB y comprueba conectividad en cuanto carga el servidor Node (SSR / dev).
 * Así la base queda “caliente” desde el arranque y fallos de conexión se ven en consola de inmediato.
 */
export function scheduleDatabaseWarmup(): void {
  if (scheduled) return;
  scheduled = true;

  void (async () => {
    if (!isDatabaseConfigured()) {
      console.warn(
        "[cenit-pi] MariaDB: faltan variables en .env (DATABASE_URL o DB_HOST, DB_USER, DB_NAME). Login y registro requieren la base de datos.",
      );
      return;
    }

    const result = await pingDatabase();
    if (result.ok) {
      console.log(`[cenit-pi] MariaDB conectada al arranque: ${result.message}`);
    } else {
      console.error(`[cenit-pi] MariaDB no accesible al arranque: ${result.message}`);
    }
  })();
}
