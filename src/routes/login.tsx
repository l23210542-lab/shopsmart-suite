import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { loginWithDatabase } from "@/backend/auth.server";
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
import { loginPageSchema, type LoginPageValues } from "@/lib/login-validation";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: Login });

const defaultValues: LoginPageValues = {
  email: "",
  password: "",
};

function Login() {
  const { setUser } = useAuth();
  const nav = useNavigate();

  const form = useForm<LoginPageValues>({
    resolver: zodResolver(loginPageSchema),
    defaultValues,
    mode: "onTouched",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const res = await loginWithDatabase({
        data: { email: values.email, password: values.password },
      });

      if (res.kind === "ok") {
        setUser(res.user);
        toast.success("Bienvenido a Cenít Pi");
        nav({ to: "/" });
        return;
      }

      if (res.kind === "invalid_credentials") {
        form.setError("password", {
          type: "server",
          message: "Acceso denegado: el correo o la contraseña no son correctos.",
        });
        form.setValue("password", "", { shouldValidate: false, shouldDirty: false });
        toast.error("Acceso denegado. Revisa el correo y la contraseña.");
        return;
      }

      if (res.kind === "no_database") {
        form.setError("root", {
          type: "server",
          message:
            "Faltan variables de entorno para MariaDB. Crea o edita .env con DATABASE_URL o DB_HOST, DB_USER y DB_NAME.",
        });
        toast.error("Acceso no disponible: base de datos no configurada en el servidor.");
        return;
      }
      if (res.kind === "database_unavailable") {
        form.setError("root", {
          type: "server",
          message:
            "No se pudo conectar con MariaDB (servicio detenido, puerto incorrecto o credenciales erróneas). Arranca MariaDB/MySQL y vuelve a intentarlo.",
        });
        toast.error("No hay conexión con la base de datos. Comprueba que MariaDB esté en ejecución.");
        return;
      }
    } catch {
      form.setError("root", {
        type: "server",
        message: "Error de conexión. Inténtalo de nuevo en unos segundos.",
      });
      toast.error("No se pudo contactar con el servidor.");
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
          <h1 className="text-2xl font-bold">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acceso solo con correo y contraseña registrados en MariaDB. Si fallan, el acceso se deniega.
          </p>
          {form.formState.errors.root?.message ? (
            <p className="mt-3 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          ) : null}
          <div className="mt-4 space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="tu@correo.com"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        form.clearErrors("password");
                        form.clearErrors("root");
                      }}
                    />
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
                    <Input
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        form.clearErrors("password");
                        form.clearErrors("root");
                      }}
                    />
                  </FormControl>
                  <FormDescription>Mínimo 8 caracteres.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full rounded-full bg-primary text-primary-foreground"
            >
              {form.formState.isSubmitting ? "Comprobando…" : "Continuar"}
            </Button>
          </div>
        </form>
      </Form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        ¿Eres nuevo?{" "}
        <Link to="/register" className="font-semibold text-price hover:underline">
          Crea tu cuenta
        </Link>
      </p>
    </div>
  );
}
