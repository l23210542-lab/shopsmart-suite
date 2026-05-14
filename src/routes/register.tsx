import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { registerWithDatabase } from "@/backend/auth.server";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { registerPageSchema, type RegisterPageValues } from "@/lib/register-validation";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({ component: Register });

const defaultValues: RegisterPageValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "customer",
};

function Register() {
  const { setUser } = useAuth();
  const nav = useNavigate();

  const form = useForm<RegisterPageValues>({
    resolver: zodResolver(registerPageSchema),
    defaultValues,
    mode: "onTouched",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const res = await registerWithDatabase({
        data: {
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role,
        },
      });

      if (res.kind === "ok") {
        setUser(res.user);
        toast.success("Cuenta creada. Ya puedes usar Cenít Pi.");
        nav({ to: "/" });
        return;
      }
      if (res.kind === "email_taken") {
        form.setError("email", { type: "server", message: "Este correo ya está registrado." });
        toast.error("Ese correo ya está en uso.");
        return;
      }
      if (res.kind === "no_database") {
        form.setError("root", {
          type: "server",
          message:
            "No se puede crear la cuenta sin MariaDB. Configura .env y asegúrate de que la base de datos esté en marcha.",
        });
        toast.error("Registro denegado: base de datos no configurada o no responde.");
        return;
      }
    } catch {
      form.setError("root", {
        type: "server",
        message: "Error de conexión con el servidor. Inténtalo de nuevo.",
      });
      toast.error("No se pudo completar el registro. Revisa la conexión e inténtalo de nuevo.");
    }
  });

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-10">
      <Link to="/" className="mb-6 flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">C</div>
        <span className="text-xl font-bold">
          Cenít <span className="text-primary">Pi</span>
        </span>
      </Link>
      <Form {...form}>
        <form
          onSubmit={onSubmit}
          className="w-full rounded-xl border bg-card p-6 shadow-card"
          noValidate
        >
          <h1 className="text-2xl font-bold">Crear cuenta</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tu cuenta se guarda en MariaDB. Los datos se validan aquí antes de enviarse al servidor.
          </p>
          {form.formState.errors.root?.message ? (
            <p className="mt-3 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          ) : null}
          <div className="mt-4 space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input autoComplete="name" placeholder="Tu nombre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" placeholder="tu@correo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres" {...field} />
                  </FormControl>
                  <FormDescription>Mínimo 8 caracteres.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" placeholder="Repite la contraseña" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quiero usar Cenít Pi como</FormLabel>
                  <select
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  >
                    <option value="customer">Comprador</option>
                    <option value="seller">Vendedor</option>
                  </select>
                  <FormDescription>
                    Las cuentas administrador no se crean aquí; usa los datos de prueba del seed si aplica.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full rounded-full bg-primary text-primary-foreground"
            >
              {form.formState.isSubmitting ? "Creando…" : "Crear cuenta"}
            </Button>
          </div>
        </form>
      </Form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="font-semibold text-price hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
