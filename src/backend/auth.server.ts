import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { hashPassword, verifyPassword } from "@/backend/auth/password";
import { isDatabaseConfigured } from "@/backend/db/env";
import { findUserByEmail, insertUser } from "@/backend/db/user-repository";
import type { Role } from "@/lib/auth";
import { loginPageSchema } from "@/lib/login-validation";
import { registerUserPayloadSchema } from "@/lib/register-validation";

export type AuthDbUser = { id: number; name: string; email: string; role: Role };

export type LoginWithDatabaseResult =
  | { kind: "ok"; user: AuthDbUser }
  | { kind: "invalid_credentials" }
  | { kind: "no_database" }
  | { kind: "database_unavailable" };

export type RegisterWithDatabaseResult =
  | { kind: "ok"; user: AuthDbUser }
  | { kind: "email_taken" }
  | { kind: "no_database" }
  | { kind: "database_unavailable" };

const roleSchema = z.enum(["customer", "seller", "admin"]);

export const loginWithDatabase = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => loginPageSchema.parse(raw))
  .handler(async ({ data }): Promise<LoginWithDatabaseResult> => {
    if (!isDatabaseConfigured()) {
      return { kind: "no_database" };
    }

    try {
      const row = await findUserByEmail(data.email);
      if (!row || !verifyPassword(data.password, row.password_hash)) {
        return { kind: "invalid_credentials" };
      }

      return {
        kind: "ok",
        user: {
          id: row.id,
          name: row.name,
          email: row.email,
          role: row.role,
        },
      };
    } catch (e) {
      console.error("[auth] loginWithDatabase:", e);
      return { kind: "database_unavailable" };
    }
  });

export const registerWithDatabase = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) =>
    registerUserPayloadSchema
      .extend({ role: roleSchema })
      .parse(raw),
  )
  .handler(async ({ data }): Promise<RegisterWithDatabaseResult> => {
    if (!isDatabaseConfigured()) {
      return { kind: "no_database" };
    }

    try {
      let role: Role = data.role;
      if (role === "admin") {
        role = "customer";
      }

      const existing = await findUserByEmail(data.email);
      if (existing) {
        return { kind: "email_taken" };
      }

      const passwordHash = hashPassword(data.password);
      const inserted = await insertUser({
        email: data.email,
        name: data.name,
        role,
        passwordHash,
      });
      if (!inserted) {
        return { kind: "database_unavailable" };
      }

      return {
        kind: "ok",
        user: {
          id: inserted.id,
          name: inserted.name,
          email: inserted.email,
          role: inserted.role,
        },
      };
    } catch (e) {
      const code = typeof e === "object" && e !== null && "code" in e ? String((e as { code: string }).code) : "";
      if (code === "ER_DUP_ENTRY") {
        return { kind: "email_taken" };
      }
      console.error("[auth] registerWithDatabase:", e);
      return { kind: "database_unavailable" };
    }
  });
