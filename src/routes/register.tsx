import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth, type Role } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({ component: Register });

function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [role, setRole] = useState<Role>("customer");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email.includes("@") || pwd.length < 8) return toast.error("Verifica los datos (contraseña ≥ 8)");
    register(name, email, role);
    toast.success("Cuenta creada");
    nav({ to: "/" });
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-10">
      <Link to="/" className="mb-6 flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">C</div>
        <span className="text-xl font-bold">Cenít <span className="text-primary">Pi</span></span>
      </Link>
      <form onSubmit={submit} className="w-full rounded-xl border bg-card p-6 shadow-card">
        <h1 className="text-2xl font-bold">Crear cuenta</h1>
        <div className="mt-4 space-y-3">
          <div><Label>Nombre</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><Label>Contraseña (mín. 8)</Label><Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} /></div>
          <div>
            <Label>Quiero usar Cenít Pi como</Label>
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="mt-1 w-full rounded-md border bg-card px-3 py-2 text-sm">
              <option value="customer">Comprador</option>
              <option value="seller">Vendedor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <Button type="submit" className="w-full rounded-full bg-primary text-primary-foreground">Crear cuenta</Button>
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta? <Link to="/login" className="font-semibold text-price hover:underline">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}
