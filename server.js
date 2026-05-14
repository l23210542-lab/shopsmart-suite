/**
 * API Express + MariaDB (mysql2) para validar inicio de sesión.
 * Credenciales incorrectas → 401, sin datos de sesión.
 * Credenciales correctas → 200 con datos públicos del usuario (sin contraseña).
 *
 * Variables (mismas que el resto del proyecto): DATABASE_URL o DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
 * Puerto: PORT (por defecto 3001)
 *
 * Ejecutar: npm run server:express
 */

import "dotenv/config";
import { timingSafeEqual, scryptSync } from "node:crypto";
import express from "express";
import cors from "cors";
import { createPool } from "mysql2/promise";

const PREFIX = "scrypt";
const SALT_BYTES = 16;
const KEY_BYTES = 32;

function verifyPassword(plain, stored) {
  if (!stored || !stored.startsWith(`${PREFIX}$`)) return false;
  const parts = stored.split("$");
  if (parts.length !== 3) return false;
  const [, saltHex, hashHex] = parts;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  if (salt.length !== SALT_BYTES || expected.length !== KEY_BYTES) return false;
  const actual = scryptSync(plain, salt, expected.length);
  try {
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function readEnv(key) {
  const v = process.env[key];
  if (v === "" || v === undefined) return undefined;
  return String(v).trim().replace(/^\uFEFF/, "");
}

function parseDatabaseUrl(url) {
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

function getDatabaseEnv() {
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

const dbEnv = getDatabaseEnv();
if (!dbEnv) {
  console.error(
    "[server.js] Falta configuración de MariaDB. Define DATABASE_URL o DB_HOST, DB_USER, DB_NAME (y DB_PASSWORD si aplica) en .env",
  );
  process.exit(1);
}

const pool = createPool({
  host: dbEnv.host,
  port: dbEnv.port,
  user: dbEnv.user,
  password: dbEnv.password,
  database: dbEnv.database,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
});

const app = express();
const port = Number(readEnv("PORT")) || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "shopsmart-login-api" });
});

/**
 * POST /api/login
 * Body JSON: { "email": "...", "password": "..." }
 * - 401: correo inexistente o contraseña incorrecta (mismo mensaje genérico)
 * - 200: { ok: true, user: { id, name, email, role } }
 */
app.post("/api/login", async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!email || !email.includes("@")) {
    return res.status(400).json({ ok: false, message: "Indica un correo válido." });
  }
  if (password.length < 8) {
    return res.status(400).json({ ok: false, message: "La contraseña debe tener al menos 8 caracteres." });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id, email, name, role, password_hash FROM users WHERE email = :email LIMIT 1",
      { email },
    );

    const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
    const okAuth = row && verifyPassword(password, row.password_hash);

    if (!okAuth) {
      return res.status(401).json({
        ok: false,
        message: "Correo o contraseña incorrectos. Acceso denegado.",
      });
    }

    return res.status(200).json({
      ok: true,
      user: {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
      },
    });
  } catch (err) {
    console.error("[server.js] Error en /api/login:", err);
    return res.status(500).json({ ok: false, message: "Error interno al consultar la base de datos." });
  }
});

app.use((_req, res) => {
  res.status(404).json({ ok: false, message: "Ruta no encontrada." });
});

app.listen(port, () => {
  console.log(`[server.js] Express escuchando en http://127.0.0.1:${port}`);
  console.log(`[server.js] MariaDB: ${dbEnv.user}@${dbEnv.host}:${dbEnv.port}/${dbEnv.database}`);
  console.log(`[server.js] POST /api/login — validación de credenciales`);
});
