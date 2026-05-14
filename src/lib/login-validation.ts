import { z } from "zod";

export const loginPageSchema = z.object({
  email: z.string().trim().min(1, "Indica tu correo").email("Correo no válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type LoginPageValues = z.infer<typeof loginPageSchema>;
