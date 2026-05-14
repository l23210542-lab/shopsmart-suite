import { z } from "zod";

/** Campos que se envían a `registerWithDatabase` (servidor). */
export const registerUserPayloadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(255, "El nombre no puede superar 255 caracteres"),
  email: z.string().trim().min(1, "El correo es obligatorio").email("Introduce un correo válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(200, "La contraseña es demasiado larga"),
  role: z.enum(["customer", "seller"], {
    required_error: "Elige un tipo de cuenta",
  }),
});

/** Formulario completo en la página (incluye confirmación de contraseña). */
export const registerPageSchema = registerUserPayloadSchema
  .extend({
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterPageValues = z.infer<typeof registerPageSchema>;
