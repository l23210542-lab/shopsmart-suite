import { Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  ShoppingCart,
  MapPin,
  ChevronDown,
  User,
  Menu,
  Package,
  LayoutGrid,
} from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { categories } from "@/lib/catalog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const mobileNavLinkClass =
  "flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent";

function MobileNavAccount({ onClose }: { onClose: () => void }) {
  const { user, logout } = useAuth();

  if (user) {
    return (
      <div className="flex flex-col gap-1">
        <p className="px-3 text-xs text-muted-foreground">
          {user.email} · {user.role}
        </p>
        <Link to="/orders" className={mobileNavLinkClass} onClick={onClose}>
          Mis órdenes
        </Link>
        {user.role !== "customer" && (
          <Link to="/seller" className={mobileNavLinkClass} onClick={onClose}>
            Panel vendedor
          </Link>
        )}
        {user.role === "admin" && (
          <Link to="/admin" className={mobileNavLinkClass} onClick={onClose}>
            Panel admin
          </Link>
        )}
        <button
          type="button"
          className={cn(mobileNavLinkClass, "text-left")}
          onClick={() => {
            logout();
            onClose();
          }}
        >
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Link to="/login" className={mobileNavLinkClass} onClick={onClose}>
        Iniciar sesión
      </Link>
      <Link to="/register" className={mobileNavLinkClass} onClick={onClose}>
        Crear cuenta
      </Link>
    </div>
  );
}

export function Header() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/products", search: { q: q || undefined, cat: undefined } as any });
  };

  const closeMobile = () => setMobileNavOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-nav text-nav-foreground shadow-pop">
      {/* Main bar */}
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-3 py-2 sm:px-4">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 rounded-md border border-transparent px-2 py-1.5 hover:border-white/40"
        >
          <div className="flex size-8 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
            C
          </div>
          <div className="hidden text-lg font-bold tracking-tight sm:block">
            Cenít <span className="text-primary">Pi</span>
          </div>
        </Link>

        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex shrink-0 items-center justify-center rounded-md border border-transparent p-2 hover:border-white/40 md:hidden"
              aria-label="Abrir menú de cuenta y opciones"
            >
              <Menu className="size-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="flex w-full flex-col gap-0 sm:max-w-sm">
            <SheetHeader className="text-left">
              <SheetTitle>Menú</SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-6 overflow-y-auto pr-1">
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Ubicación
                </h3>
                <div className="mt-2 flex items-start gap-2 rounded-md border border-border bg-muted/40 px-3 py-2.5 text-foreground">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div className="text-left leading-tight">
                    <div className="text-xs text-muted-foreground">Enviar a</div>
                    <div className="font-semibold">Lima 15001</div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Cuenta
                </h3>
                <div className="mt-2">
                  <MobileNavAccount onClose={closeMobile} />
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Pedidos
                </h3>
                <Link
                  to="/orders"
                  className={cn(mobileNavLinkClass, "mt-2")}
                  onClick={closeMobile}
                >
                  <Package className="size-4 shrink-0" />
                  Devoluciones y órdenes
                </Link>
              </section>
            </div>
          </SheetContent>
        </Sheet>

        <button className="hidden items-center gap-1 rounded-md border border-transparent px-2 py-1.5 text-xs hover:border-white/40 md:flex">
          <MapPin className="size-4" />
          <div className="text-left leading-tight">
            <div className="text-[10px] text-nav-foreground/70">Enviar a</div>
            <div className="font-semibold">Lima 15001</div>
          </div>
        </button>

        {/* Search */}
        <form
          onSubmit={submit}
          className="flex flex-1 items-stretch overflow-hidden rounded-full bg-white text-foreground ring-2 ring-transparent focus-within:ring-primary"
        >
          <DropdownMenu>
            <DropdownMenuTrigger className="hidden items-center gap-1 rounded-l-full bg-muted px-3 text-xs font-medium text-foreground/80 hover:bg-accent sm:flex">
              Categorías <ChevronDown className="size-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Categorías</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate({ to: "/products", search: { cat: undefined, q: undefined } as any })}
              >
                Todas
              </DropdownMenuItem>
              {categories.map((c) => (
                <DropdownMenuItem
                  key={c.slug}
                  onClick={() => navigate({ to: "/products", search: { cat: c.slug, q: undefined } as any })}
                >
                  {c.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Busca productos, marcas y más"
            className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="flex items-center justify-center bg-primary px-4 text-primary-foreground hover:brightness-95"
            aria-label="Buscar"
          >
            <Search className="size-5" />
          </button>
        </form>

        {/* Account */}
        <DropdownMenu>
          <DropdownMenuTrigger className="hidden rounded-md border border-transparent px-2 py-1.5 text-left text-xs hover:border-white/40 md:block">
            <div className="text-[10px] text-nav-foreground/70">Hola, {user?.name ?? "Inicia sesión"}</div>
            <div className="flex items-center gap-1 font-semibold">
              <User className="size-3.5" /> Cuenta y listas
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {user ? (
              <>
                <DropdownMenuLabel>
                  {user.email} · {user.role}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/orders" })}>Mis órdenes</DropdownMenuItem>
                {user.role !== "customer" && (
                  <DropdownMenuItem onClick={() => navigate({ to: "/seller" })}>Panel vendedor</DropdownMenuItem>
                )}
                {user.role === "admin" && (
                  <DropdownMenuItem onClick={() => navigate({ to: "/admin" })}>Panel admin</DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Cerrar sesión</DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={() => navigate({ to: "/login" })}>Iniciar sesión</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/register" })}>Crear cuenta</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Link
          to="/orders"
          className="hidden rounded-md border border-transparent px-2 py-1.5 text-xs hover:border-white/40 lg:block"
        >
          <div className="text-[10px] text-nav-foreground/70">Devoluciones</div>
          <div className="flex items-center gap-1 font-semibold">
            <Package className="size-3.5" /> Y órdenes
          </div>
        </Link>

        <Link
          to="/cart"
          className="relative flex shrink-0 items-center gap-1 rounded-md border border-transparent px-2 py-1.5 hover:border-white/40"
        >
          <div className="relative">
            <ShoppingCart className="size-7" />
            <span className="absolute -right-2 -top-1 min-w-5 rounded-full bg-primary px-1 text-center text-xs font-bold text-primary-foreground">
              {count}
            </span>
          </div>
          <span className="hidden text-sm font-semibold sm:inline">Carrito</span>
        </Link>
      </div>

      {/* Sub nav */}
      <div className="bg-nav-accent text-nav-foreground">
        <div className="mx-auto flex max-w-[1400px] items-center gap-1 overflow-x-auto px-3 py-1.5 text-sm scrollbar-hide sm:px-4">
          <Link
            to="/products"
            search={{ cat: undefined, q: undefined } as any}
            className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded px-2 py-1 font-semibold hover:bg-white/10"
          >
            <LayoutGrid className="size-4" aria-hidden />
            Todo
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/products"
              search={{ cat: c.slug, q: undefined } as any}
              className="shrink-0 whitespace-nowrap rounded px-2 py-1 hover:bg-white/10"
            >
              {c.name}
            </Link>
          ))}
          <Link
            to="/seller"
            title="Vender en Cenít Pi"
            className="ml-auto max-w-[42%] shrink-0 truncate rounded px-2 py-1 font-semibold text-primary hover:bg-white/10 sm:max-w-none"
          >
            <span className="sm:hidden">Vender</span>
            <span className="hidden sm:inline">Vender en Cenít Pi</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
