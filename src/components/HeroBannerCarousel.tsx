import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type HeroBanner = {
  id: number;
  /** Ruta pública (`public/banners/foto.png` → `"/banners/foto.png"`) o URL absoluta. Cadena vacía = slide solo con degradado y texto. */
  image: string;
  link: string;
  alt: string;
  /** Texto superpuesto sobre la imagen (esquina inferior izquierda). */
  overlay?: string;
};

/**
 * Edita este arreglo con tus anuncios. En Vite no uses rutas de Windows; copia las imágenes a `public/banners/`
 * y referencia `"/banners/mi-archivo.png"` para que funcione en local y por LAN.
 */
const heroBanners: HeroBanner[] = [
  {
    id: 1,
    image: "/banners/racerloop.png",
    link: "https://blinkgalaxy.com/racing/racerloop",
    alt: "RACERLOOP — póster promocional",
    overlay: "Prueba ahora RacerLoop",
  },
  {
    id: 2,
    image: "/banners/outer-ring.png",
    link: "https://blinkgalaxy.com/mmo/outer-ring",
    alt: "Outer Ring — póster promocional",
    overlay: "Outer ring ¡Juegalo ya!",
  },
];

const AUTOPLAY_MS = 4500;

function isExternalUrl(href: string) {
  return /^https?:\/\//i.test(href);
}

type HeroBannerCarouselProps = {
  className?: string;
};

export function HeroBannerCarousel({ className }: HeroBannerCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: heroBanners.length > 1,
    align: "start",
    duration: 22,
  });
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || heroBanners.length < 2 || paused) return;
    const id = window.setInterval(() => {
      emblaApi.scrollNext();
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [emblaApi, paused]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  const showChrome = heroBanners.length > 1;

  return (
    <div
      className={cn("group/banner relative", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div ref={emblaRef} className="overflow-hidden rounded-xl ring-1 ring-white/10">
        <div className="flex touch-pan-y">
          {heroBanners.map((banner) => {
            const inner = (
              <>
                <div className="relative aspect-[16/9] min-h-[140px] w-full sm:min-h-[180px] md:aspect-[21/9] md:min-h-[200px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/50 via-purple-900/70 to-background/90" />
                  {banner.image ? (
                    <img
                      src={banner.image}
                      alt={banner.alt}
                      className="absolute inset-0 size-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                      <span className="text-lg font-bold tracking-tight text-white drop-shadow-md sm:text-2xl">
                        {banner.alt}
                      </span>
                    </div>
                  )}
                  {banner.overlay ? (
                    <p className="pointer-events-none absolute bottom-3 left-3 z-10 max-w-[min(90%,20rem)] text-pretty text-sm font-bold leading-snug text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] sm:bottom-5 sm:left-5 sm:max-w-md sm:text-lg md:text-xl">
                      {banner.overlay}
                    </p>
                  ) : null}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
              </>
            );

            const sharedClass =
              "block w-full shrink-0 grow-0 basis-full cursor-pointer outline-none transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

            return (
              <div key={banner.id} className="min-w-0 flex-[0_0_100%]">
                {isExternalUrl(banner.link) ? (
                  <a
                    href={banner.link}
                    className={sharedClass}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {inner}
                  </a>
                ) : (
                  <Link to={banner.link} className={sharedClass}>
                    {inner}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showChrome && (
        <>
          <button
            type="button"
            aria-label="Anuncio anterior"
            onClick={scrollPrev}
            className="absolute left-1.5 top-1/2 z-20 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white shadow-lg backdrop-blur-md transition hover:bg-black/50 focus-visible:ring-2 focus-visible:ring-primary sm:left-3 sm:size-10"
          >
            <ChevronLeft className="size-5 opacity-90" strokeWidth={2.25} />
          </button>
          <button
            type="button"
            aria-label="Siguiente anuncio"
            onClick={scrollNext}
            className="absolute right-1.5 top-1/2 z-20 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white shadow-lg backdrop-blur-md transition hover:bg-black/50 focus-visible:ring-2 focus-visible:ring-primary sm:right-3 sm:size-10"
          >
            <ChevronRight className="size-5 opacity-90" strokeWidth={2.25} />
          </button>

          <div
            className="pointer-events-auto absolute bottom-2.5 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-3"
            role="tablist"
            aria-label="Seleccionar anuncio"
          >
            {heroBanners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                role="tab"
                aria-selected={i === selected}
                aria-label={`Ir al anuncio ${i + 1}`}
                onClick={() => scrollTo(i)}
                className={cn(
                  "size-2 rounded-full border border-white/20 transition sm:size-2.5",
                  i === selected
                    ? "scale-110 bg-primary ring-2 ring-white/50"
                    : "bg-white/35 hover:bg-white/55",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
