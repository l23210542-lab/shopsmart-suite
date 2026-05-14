import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppCatalog } from "@/lib/use-app-catalog";
import { CategoryRow } from "@/components/CategoryRow";
import { HeroBannerCarousel } from "@/components/HeroBannerCarousel";
import { ArrowRight, Truck, ShieldCheck, Cpu, Coins, Leaf, UsersRound, Scale, Shield, Sprout } from "lucide-react";
import logoUrl from "@/imgs/logo.png";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  const { categories, products, productsByCategory } = useAppCatalog();
  return (
    <div className="mx-auto max-w-[1400px] px-3 sm:px-4">
      {/* Hero */}
      <section className="relative mt-3 overflow-hidden rounded-2xl bg-hero-gradient pb-10 pt-4 text-nav-foreground sm:pb-14 sm:pt-6">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px, 60px 60px",
          }}
        />
        <div className="relative z-10 px-3 sm:px-4">
          <HeroBannerCarousel />
        </div>
        <div className="relative z-30 max-w-2xl px-6 pt-8 sm:px-12 sm:pt-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">
            <Cpu className="size-3.5" /> Corre 100% sobre Raspberry Pi 4
          </div>
          <h1 className="text-4xl font-bold leading-tight sm:text-6xl">
            Compra todo. <span className="text-primary">En cualquier lugar.</span>
          </h1>
          <p className="z-50 mt-4 max-w-xl text-base text-nav-foreground/80 sm:text-lg">
            Marketplace ligero estilo Amazon construido con PHP 8, MariaDB y un toque de Raspberry.
            Miles de productos, vendedores locales, envío rápido.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/products"
              search={{ cat: undefined, q: undefined } as any}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-pop transition hover:brightness-95"
            >
              Explorar catálogo <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/seller"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-6 py-3 text-sm font-bold backdrop-blur hover:bg-white/10"
            >
              Vender en Cenít Pi
            </Link>
          </div>
        </div>
        <img
          src={logoUrl}
          alt=""
          className="fadein-anim pointer-events-none absolute -bottom-30 -right-20 z-0 w-xs opacity-30 sm:w-sm md:w-md"
        />
      </section>

      {/* Quick categories */}
      <section className="mt-6 grid gap-3 grid-cols-2 lg:grid-cols-4">
        {categories.slice(0, 4).map((c) => {
          const sample = productsByCategory(c.slug)[0];
          return (
            <Link
              key={c.slug}
              to="/products"
              search={{ cat: c.slug, q: undefined } as any}
              className="group flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-card transition hover:shadow-pop"
            >
              <h3 className="text-lg font-bold">{c.name}</h3>
              <div className="aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                {sample && (
                  <img
                    src={sample.image}
                    alt={c.name}
                    className="size-full object-cover transition group-hover:scale-105"
                  />
                )}
              </div>
              <span className="text-xs font-semibold text-price">Comprar ahora →</span>
            </Link>
          );
        })}
      </section>

      {/* Trust bar */}
      <section className="mt-6 grid gap-3 rounded-xl border bg-card p-4 shadow-card sm:grid-cols-3">
        <Trust
          icon={<Truck className="size-5" />}
          title="Envío local rápido"
          desc="Despachos desde tu Raspberry Pi"
        />
        <Trust
          icon={<ShieldCheck className="size-5" />}
          title="Compra protegida"
          desc="Devoluciones gratis 30 días"
        />
        <Trust
          icon={<Cpu className="size-5" />}
          title="Hecho con Pi"
          desc="PHP + MariaDB + Tailwind"
        />
      </section>

      {/* Diferenciadores (propuesta de valor vs. marketplaces genéricos) */}
      <section className="mt-10">
        <h2 className="mb-2 text-2xl font-bold">Lo que no copian Amazon ni Mercado Libre</h2>
        <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
          Funciones pensadas para transparencia, comunidad y soberanía técnica. Parte es demo o roadmap; la idea es mostrar hacia dónde puede crecer tu
          marketplace.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InnovationCard
            icon={<Coins className="size-5 text-amber-500" />}
            title="Checkout con Bitcoin (demo)"
            desc="Flujo completo simulado: factura, QR, mempool y confirmaciones. Sin custodia bancaria tradicional; en producción enlazarías BTCPay, OpenNode o Lightning."
          />
          <InnovationCard
            icon={<Shield className="size-5 text-rose-500" />}
            title="Escrow social transparente"
            desc="Fondos retenidos hasta que confirmes la entrega; historial de disputas visible para la comunidad (modelo de confianza, no caja negra)."
          />
          <InnovationCard
            icon={<UsersRound className="size-5 text-sky-500" />}
            title="Compra colectiva por código postal"
            desc="Agrupa pedidos con vecinos del mismo CP: menos envíos sueltos, menos emisiones y precio de envío compartido (próximamente en ruta)."
          />
          <InnovationCard
            icon={<Leaf className="size-5 text-emerald-600" />}
            title="Huella CO₂ por pedido"
            desc="Cada checkout estima kg CO₂ del envío; con envío Plus puedes compensar o priorizar rutas bajas en carbono (datos demo educativos)."
          />
          <InnovationCard
            icon={<Sprout className="size-5 text-lime-600" />}
            title="Ruta del productor"
            desc="En supermercado muestra un % orientativo que vuelve al productor o cooperativa; trazabilidad simple que los gigantes raramente exponen."
          />
          <InnovationCard
            icon={<Scale className="size-5 text-violet-500" />}
            title="Motor en tu Raspberry Pi"
            desc="Catálogo y pedidos pueden vivir en tu propio hardware: comisiones y reglas las defines tú, sin depender solo del cloud del marketplace."
          />
        </div>
      </section>

      {/* Category rows */}
      {categories.map((c) => (
        <CategoryRow key={c.slug} title={c.name} slug={c.slug} items={productsByCategory(c.slug)} />
      ))}

      <div className="h-8" />
      <CategoryRow title="Productos destacados" slug="" items={products.slice(0, 12)} />
    </div>
  );
}

function InnovationCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-card transition hover:shadow-pop">
      <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-muted">{icon}</div>
      <h3 className="text-base font-bold leading-snug">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}

function Trust({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-price">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}
