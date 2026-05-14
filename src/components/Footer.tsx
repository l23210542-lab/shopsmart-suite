import type { AppCatalogBundle } from "@/lib/catalog-types";

type FooterProps = {
  /** Si la app cargó el catálogo desde MariaDB o desde datos estáticos. */
  catalogSource: AppCatalogBundle["source"];
};

export function Footer({ catalogSource }: FooterProps) {
  return (
    <footer className="mt-16 bg-nav text-nav-foreground">
      <button type="button" onClick={()=>{window.scrollTo({ top: 0, behavior: "smooth"})}} className="block w-full bg-nav-accent py-3 text-center text-sm font-semibold hover:bg-nav-accent/80 cursor-pointer">
        Volver arriba
      </button>
      <div className="mx-auto grid max-w-[1400px] gap-8 px-6 py-10 grid-cols-2 md:grid-cols-4">
        <div>
          <h4 className="mb-3 font-bold">Conócenos</h4>
          <ul className="space-y-1.5 text-sm text-nav-foreground/80">
            <li>Sobre Cenít Pi</li><li>Carreras</li><li>Sostenibilidad</li>
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
          <h4 className="mb-3 font-bold">Cenít Pi sobre Raspberry Pi 4</h4>
          <p className="text-sm text-nav-foreground/80">
            Marketplace educativo desplegado sobre Raspberry Pi 4. PHP 8 + MariaDB + Apache.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-nav-foreground/60">
        <p>
          Catálogo:{" "}
          <span className={catalogSource === "mariadb" ? "font-semibold text-emerald-300" : "font-medium text-amber-200"}>
            {catalogSource === "mariadb" ? "MariaDB (conectado)" : "datos estáticos (sin BD o tablas vacías)"}
          </span>
        </p>
        <p className="mt-1">© {new Date().getFullYear()} Cenít Pi — Hackathon Edition</p>
      </div>
    </footer>
  );
}
