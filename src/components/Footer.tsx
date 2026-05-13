import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-16 bg-nav text-nav-foreground">
      <Link to="/" className="block bg-nav-accent py-3 text-center text-sm font-semibold hover:bg-nav-accent/80">
        Volver arriba
      </Link>
      <div className="mx-auto grid max-w-[1400px] gap-8 px-6 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <h4 className="mb-3 font-bold">Conócenos</h4>
          <ul className="space-y-1.5 text-sm text-nav-foreground/80">
            <li>Sobre PiCommerce</li><li>Carreras</li><li>Sostenibilidad</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-bold">Vende con nosotros</h4>
          <ul className="space-y-1.5 text-sm text-nav-foreground/80">
            <li>Vende productos</li><li>Programa afiliados</li><li>Publicidad</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-bold">Ayuda</h4>
          <ul className="space-y-1.5 text-sm text-nav-foreground/80">
            <li>Tu cuenta</li><li>Devoluciones</li><li>Centro de ayuda</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-bold">PiCommerce sobre Pi 4</h4>
          <p className="text-sm text-nav-foreground/80">
            Marketplace educativo desplegado sobre Raspberry Pi 4. PHP 8 + MariaDB + Apache.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-nav-foreground/60">
        © {new Date().getFullYear()} PiCommerce — Hackathon Edition
      </div>
    </footer>
  );
}
