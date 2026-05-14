import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { Role } from "@/lib/auth";
import { getDbPool } from "./pool";

export interface DbUserRow {
  id: number;
  email: string;
  name: string;
  role: Role;
  password_hash: string | null;
}

interface UserSelectRow extends RowDataPacket {
  id: number;
  email: string;
  name: string;
  role: Role;
  password_hash: string | null;
}

function mapRow(r: UserSelectRow): DbUserRow {
  return {
    id: r.id,
    email: r.email,
    name: r.name,
    role: r.role,
    password_hash: r.password_hash,
  };
}

export async function findUserByEmail(email: string): Promise<DbUserRow | null> {
  const pool = await getDbPool();
  if (!pool) return null;

  const normalized = email.trim().toLowerCase();
  const [rows] = await pool.query<UserSelectRow[]>(
    "SELECT id, email, name, role, password_hash FROM users WHERE email = :email LIMIT 1",
    { email: normalized },
  );
  const row = rows[0];
  return row ? mapRow(row) : null;
}

export async function insertUser(params: {
  email: string;
  name: string;
  role: Role;
  passwordHash: string;
}): Promise<DbUserRow | null> {
  const pool = await getDbPool();
  if (!pool) return null;

  const email = params.email.trim().toLowerCase();
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO users (email, name, role, password_hash) VALUES (:email, :name, :role, :password_hash)",
    {
      email,
      name: params.name.trim(),
      role: params.role,
      password_hash: params.passwordHash,
    },
  );

  const rawId = result.insertId;
  const insertId = Number(rawId);
  if (!Number.isFinite(insertId) || insertId <= 0) return null;

  return {
    id: insertId,
    email,
    name: params.name.trim(),
    role: params.role,
    password_hash: params.passwordHash,
  };
}
