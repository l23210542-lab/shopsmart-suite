import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useAppCatalog } from "@/lib/use-app-catalog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Banknote,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  MapPin,
  Package,
  ShieldCheck,
  Store,
  Truck,
  Wallet,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/checkout")({ component: Checkout });

type Step = 1 | 2 | 3;

/** URL oficial de PayPal (inicio de sesión / flujo de pago). Sustituye por la URL de tu comercio cuando integres la API. */
const PAYPAL_WEB_URL = "https://www.paypal.com/signin";

type PaymentMethod = "card" | "paypal" | "cash";

/** Umbral (subtotal) para envío estándar gratis. */
const FREE_SHIPPING_THRESHOLD = 100;
/** Coste envío estándar si el subtotal no alcanza el umbral. */
const STANDARD_SHIPPING_FLAT = 9.9;
/** Recargo fijo del envío Plus (se suma al coste del envío estándar calculado). */
const PLUS_SHIPPING_SURCHARGE = 8.5;

type ShippingTier = "standard" | "plus";

function shippingAmountForTier(subtotal: number, tier: ShippingTier): number {
  const standardBase = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FLAT;
  const raw = tier === "standard" ? standardBase : standardBase + PLUS_SHIPPING_SURCHARGE;
  return Math.round(raw * 100) / 100;
}

function shippingTierLabel(tier: ShippingTier): string {
  return tier === "plus" ? "Plus" : "Estándar";
}

const STEPS: { step: Step; title: string; short: string }[] = [
  { step: 1, title: "Resumen de orden", short: "Resumen" },
  { step: 2, title: "Datos de envío y pago", short: "Envío" },
  { step: 3, title: "Confirmación", short: "Confirmar" },
];

function formatShippingBlock(p: {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  district: string;
  city: string;
  reference: string;
  postal?: string;
}) {
  return [
    `Destinatario: ${p.fullName.trim()}`,
    `Teléfono: ${p.phone.trim()}`,
    `Dirección: ${p.line1.trim()}`,
    p.line2.trim() && `Dpto./ interior: ${p.line2.trim()}`,
    `${p.district.trim()}, ${p.city.trim()}`,
    p.postal?.trim() && `Código postal: ${p.postal.trim()}`,
    p.reference.trim() && `Referencia: ${p.reference.trim()}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function Checkout() {
  const { items, subtotal, placeOrder } = useCart();
  const { user } = useAuth();
  const { findProduct } = useAppCatalog();
  const nav = useNavigate();

  const [step, setStep] = useState<Step>(1);

  const [fullName, setFullName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("Lima");
  const [reference, setReference] = useState("");

  const [shippingTier, setShippingTier] = useState<ShippingTier>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cashReference, setCashReference] = useState<string | null>(null);

  const [cardNumber, setCardNumber] = useState("4242424242424242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("123");
  const [postal, setPostal] = useState("");

  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    if (paymentMethod === "cash" && cashReference === null) {
      setCashReference(
        `SS${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      );
    }
  }, [paymentMethod, cashReference]);

  useEffect(() => {
    if (user?.name && !fullName) setFullName(user.name);
  }, [user?.name, fullName]);

  const shipping = useMemo(() => shippingAmountForTier(subtotal, shippingTier), [subtotal, shippingTier]);
  const standardShippingPreview = useMemo(() => shippingAmountForTier(subtotal, "standard"), [subtotal]);
  const plusShippingPreview = useMemo(() => shippingAmountForTier(subtotal, "plus"), [subtotal]);
  const total = useMemo(
    () => Math.round((subtotal + shipping) * 100) / 100,
    [subtotal, shipping],
  );

  /** En el paso 1 el resumen lateral asume envío Estándar hasta que elijas en el paso 2. */
  const sidebarShipping = step === 1 ? standardShippingPreview : shipping;
  const sidebarTotal = useMemo(
    () => Math.round((subtotal + sidebarShipping) * 100) / 100,
    [subtotal, sidebarShipping],
  );

  const cardLast4 = useMemo(() => {
    const d = cardNumber.replace(/\D/g, "");
    return d.length >= 4 ? d.slice(-4) : "0000";
  }, [cardNumber]);

  const goStep = (s: Step) => setStep(s);

  const validateStep2 = (): boolean => {
    if (!fullName.trim() || fullName.trim().length < 3) {
      toast.error("Indica un nombre completo válido.");
      return false;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 6) {
      toast.error("Indica un teléfono de contacto.");
      return false;
    }
    if (!line1.trim() || line1.trim().length < 5) {
      toast.error("Indica la dirección (calle y número).");
      return false;
    }
    if (!district.trim()) {
      toast.error("Indica el distrito o zona.");
      return false;
    }
    if (!city.trim()) {
      toast.error("Indica la ciudad.");
      return false;
    }
    if (paymentMethod === "card") {
      const digits = cardNumber.replace(/\D/g, "");
      if (digits.length < 15) {
        toast.error("Revisa el número de tarjeta.");
        return false;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry.trim())) {
        toast.error("Vencimiento en formato MM/AA.");
        return false;
      }
      if (cardCvv.replace(/\D/g, "").length < 3) {
        toast.error("Indica el CVV.");
        return false;
      }
    }
    return true;
  };

  const confirmOrder = () => {
    if (items.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }
    if (!acceptTerms) {
      toast.error("Debes aceptar los términos para continuar.");
      return;
    }
    const shippingLine =
      shippingTier === "plus"
        ? `Envío: Plus (prioridad, entrega acelerada) — ${shipping === 0 ? "Gratis" : `$${shipping.toFixed(2)}`}`
        : `Envío: Estándar — ${shipping === 0 ? "Gratis" : `$${shipping.toFixed(2)}`}`;
    const address = `${formatShippingBlock({
      fullName,
      phone,
      line1,
      line2,
      district,
      city,
      reference,
      postal,
    })}\n${shippingLine}`;
    const order = placeOrder({ address, subtotal, shipping });
    toast.success(`Pedido ${order.id} confirmado`);
    nav({ to: "/orders" });
  };

  return (
    <div className="mx-auto max-w-[1100px] px-3 py-6 sm:px-4">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/cart" className="font-medium text-price hover:underline">
          Carrito
        </Link>
        <span>/</span>
        <span className="text-foreground">Checkout</span>
      </div>
      <h1 className="mb-2 text-3xl font-bold">Checkout</h1>
      <p className="mb-8 max-w-2xl text-sm text-muted-foreground">
        Completa los pasos: revisa tu pedido, elige envío Estándar o Plus, método de pago y confirma. Los cobros reales requieren integración con pasarelas.
      </p>

      <StepIndicator current={step} onSelect={(s) => s < step && goStep(s)} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          {step === 1 && (
            <SectionCard title="Resumen de orden" description="Productos y montos de esta compra." icon={<Package className="size-5" />}>
              {items.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-muted/30 p-8 text-center">
                  <p className="text-sm text-muted-foreground">No hay artículos en el carrito.</p>
                  <Button asChild className="mt-4 rounded-full" variant="secondary">
                    <Link to="/products" search={{}}>
                      Ver productos
                    </Link>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full min-w-[520px] text-sm">
                      <thead className="bg-muted/60 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3">Producto</th>
                          <th className="px-4 py-3 text-center">Cant.</th>
                          <th className="px-4 py-3 text-right">P. unit.</th>
                          <th className="px-4 py-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {items.map((i) => {
                          const p = findProduct(i.productId);
                          if (!p) return null;
                          const line = p.price * i.quantity;
                          return (
                            <tr key={i.productId}>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <img src={p.image} alt="" className="size-12 shrink-0 rounded object-cover" />
                                  <div>
                                    <div className="font-medium">{p.name}</div>
                                    <div className="text-xs text-muted-foreground">{p.seller}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center tabular-nums">{i.quantity}</td>
                              <td className="px-4 py-3 text-right tabular-nums">${p.price.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right font-semibold tabular-nums">${line.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Envío estándar gratis si el subtotal supera ${FREE_SHIPPING_THRESHOLD}. En el siguiente paso podrás elegir{" "}
                    <strong className="text-foreground">Plus</strong> con entrega prioritaria por un recargo adicional. Revisa totales en el panel lateral.
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" className="rounded-full">
                      <Link to="/cart">Volver al carrito</Link>
                    </Button>
                    <Button
                      type="button"
                      className="rounded-full bg-primary text-primary-foreground"
                      disabled={items.length === 0}
                      onClick={() => {
                        if (items.length === 0) return;
                        goStep(2);
                      }}
                    >
                      Continuar a envío
                      <ChevronRight className="ml-1 size-4" />
                    </Button>
                  </div>
                </>
              )}
            </SectionCard>
          )}

          {step === 2 && (
            <>
              <SectionCard
                title="Datos de envío"
                description="Indica dónde recibirás el pedido y cómo contactarte."
                icon={<MapPin className="size-5" />}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="co-fullname">Nombre completo</Label>
                    <Input id="co-fullname" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="co-phone">Teléfono</Label>
                    <Input id="co-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+51 999 888 777" inputMode="tel" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Label htmlFor="co-line1">Dirección (calle, número, urbanización)</Label>
                  <Input id="co-line1" value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="Av. Larco 123, Urb. Los Jardines" />
                </div>
                <div className="mt-4 space-y-2">
                  <Label htmlFor="co-line2">Dpto., interior o referencia interna (opcional)</Label>
                  <Input id="co-line2" value={line2} onChange={(e) => setLine2(e.target.value)} placeholder="Dpto. 402" />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="co-district">Distrito / zona</Label>
                    <Input id="co-district" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Miraflores" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="co-city">Ciudad</Label>
                    <Input id="co-city" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Label htmlFor="co-ref">Referencias para el reparto (opcional)</Label>
                  <Input
                    id="co-ref"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Portón azul, timbre 402"
                  />
                </div>
              </SectionCard>

              <SectionCard
                title="Método de envío"
                description="Estándar es la opción económica; Plus añade velocidad, seguimiento prioritario y protección extra por un recargo fijo."
                icon={<Truck className="size-5" />}
              >
                <RadioGroup
                  value={shippingTier}
                  onValueChange={(v) => setShippingTier(v as ShippingTier)}
                  className="grid gap-3 md:grid-cols-2"
                >
                  <label
                    htmlFor="ship-standard"
                    className={cn(
                      "flex cursor-pointer flex-col gap-3 rounded-lg border p-4 transition-colors",
                      shippingTier === "standard" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted/40",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="standard" id="ship-standard" />
                        <Truck className="size-4 shrink-0 text-muted-foreground" />
                        <span className="text-sm font-semibold">Estándar</span>
                      </div>
                      <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">
                        {standardShippingPreview === 0 ? "Gratis" : `$${standardShippingPreview.toFixed(2)}`}
                      </span>
                    </div>
                    <ul className="list-disc space-y-1 pl-6 text-xs text-muted-foreground">
                      <li>Entrega en 5–7 días hábiles (según zona)</li>
                      <li>Seguimiento estándar por correo y en tu cuenta</li>
                      <li>Embalaje convencional</li>
                      <li>
                        Gratis si el subtotal supera ${FREE_SHIPPING_THRESHOLD}; si no, ${STANDARD_SHIPPING_FLAT.toFixed(2)}
                      </li>
                    </ul>
                  </label>
                  <label
                    htmlFor="ship-plus"
                    className={cn(
                      "flex cursor-pointer flex-col gap-3 rounded-lg border p-4 transition-colors",
                      shippingTier === "plus" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted/40",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="plus" id="ship-plus" />
                        <Zap className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        <span className="text-sm font-semibold">Plus</span>
                      </div>
                      <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">${plusShippingPreview.toFixed(2)}</span>
                    </div>
                    <ul className="list-disc space-y-1 pl-6 text-xs text-muted-foreground">
                      <li>Salida prioritaria del almacén y ruta acelerada (24–72 h hábiles típicas)</li>
                      <li>Seguimiento detallado y notificaciones push prioritarias</li>
                      <li>Seguro de envío incluido hasta $200 del valor declarado (demo)</li>
                      <li>Embalaje reforzado y canal de soporte preferente</li>
                      <li>
                        Incluye el coste del envío estándar + <strong className="text-foreground">${PLUS_SHIPPING_SURCHARGE.toFixed(2)}</strong> de
                        servicio Plus
                      </li>
                    </ul>
                  </label>
                </RadioGroup>
              </SectionCard>

              <SectionCard
                title="Método de pago"
                description="Elige cómo quieres pagar. Tarjeta y efectivo son simulación en esta demo; PayPal abre el sitio oficial para que completes el pago con tu cuenta."
                icon={<CreditCard className="size-5" />}
              >
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                  className="grid gap-3 sm:grid-cols-3"
                >
                  <label
                    htmlFor="pay-card"
                    className={cn(
                      "flex cursor-pointer flex-col gap-2 rounded-lg border p-4 transition-colors",
                      paymentMethod === "card" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted/40",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="card" id="pay-card" />
                      <CreditCard className="size-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">Tarjeta</span>
                    </div>
                    <span className="pl-6 text-xs text-muted-foreground">Crédito o débito</span>
                  </label>
                  <label
                    htmlFor="pay-paypal"
                    className={cn(
                      "flex cursor-pointer flex-col gap-2 rounded-lg border p-4 transition-colors",
                      paymentMethod === "paypal" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted/40",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="paypal" id="pay-paypal" />
                      <Wallet className="size-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">PayPal</span>
                    </div>
                    <span className="pl-6 text-xs text-muted-foreground">Cuenta PayPal</span>
                  </label>
                  <label
                    htmlFor="pay-cash"
                    className={cn(
                      "flex cursor-pointer flex-col gap-2 rounded-lg border p-4 transition-colors",
                      paymentMethod === "cash" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted/40",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="cash" id="pay-cash" />
                      <Banknote className="size-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">Efectivo</span>
                    </div>
                    <span className="pl-6 text-xs text-muted-foreground">Tiendas de conveniencia</span>
                  </label>
                </RadioGroup>

                {paymentMethod === "card" && (
                  <div className="mt-6 space-y-4 border-t pt-6">
                    <p className="text-xs text-muted-foreground">Datos de tarjeta solo para demostración; no se envían a ningún procesador.</p>
                    <div className="space-y-2">
                      <Label htmlFor="co-card">Número de tarjeta</Label>
                      <Input
                        id="co-card"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        inputMode="numeric"
                        autoComplete="cc-number"
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="co-exp">Vencimiento (MM/AA)</Label>
                        <Input id="co-exp" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="12/28" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="co-cvv">CVV</Label>
                        <Input id="co-cvv" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} inputMode="numeric" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="co-postal">Código postal</Label>
                        <Input id="co-postal" value={postal} onChange={(e) => setPostal(e.target.value)} placeholder="15074" autoComplete="postal-code" />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "paypal" && (
                  <div className="mt-6 space-y-4 border-t pt-6">
                    <p className="text-sm text-muted-foreground">
                      Al continuar al siguiente paso se abrirá <strong className="text-foreground">PayPal</strong> en una nueva pestaña para que inicies
                      sesión y completes el pago con tu cuenta.
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      className="rounded-full"
                      onClick={() => window.open(PAYPAL_WEB_URL, "_blank", "noopener,noreferrer")}
                    >
                      Abrir PayPal ahora
                    </Button>
                  </div>
                )}

                {paymentMethod === "cash" && cashReference && (
                  <div className="mt-6 space-y-4 border-t pt-6">
                    <div className="flex gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-4">
                      <Store className="mt-0.5 size-5 shrink-0 text-emerald-700 dark:text-emerald-400" />
                      <div className="text-sm">
                        <p className="font-semibold text-foreground">Paga en efectivo en tienda</p>
                        <p className="mt-1 text-muted-foreground">
                          Presenta el código de barras o la referencia en cajas de <strong className="text-foreground">OXXO</strong>,{" "}
                          <strong className="text-foreground">7-Eleven</strong> u otras tiendas afiliadas. Indica que pagas la referencia mostrada abajo
                          por un monto de <strong className="text-foreground">${total.toFixed(2)}</strong> (total del pedido, incluye envío si aplica).
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Código de referencia</p>
                      <code className="block rounded-md bg-muted px-3 py-2 font-mono text-sm">{cashReference}</code>
                    </div>
                    <PaymentBarcode value={cashReference} />
                    <p className="text-xs text-muted-foreground">
                      Referencia de demostración; en producción la generaría tu proveedor de pagos en tienda (p. ej. OXXO Pay).
                    </p>
                  </div>
                )}
              </SectionCard>

              <div className="flex flex-wrap justify-between gap-2">
                <Button type="button" variant="outline" className="rounded-full" onClick={() => goStep(1)}>
                  <ChevronLeft className="mr-1 size-4" />
                  Anterior
                </Button>
                <Button
                  type="button"
                  className="rounded-full bg-primary text-primary-foreground"
                  onClick={() => {
                    if (!validateStep2()) return;
                    if (paymentMethod === "paypal") {
                      window.open(PAYPAL_WEB_URL, "_blank", "noopener,noreferrer");
                    }
                    goStep(3);
                  }}
                >
                  Revisar y confirmar
                  <ChevronRight className="ml-1 size-4" />
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <SectionCard
              title="Confirmación del pedido"
              description="Verifica que todo sea correcto antes de confirmar."
              icon={<ShieldCheck className="size-5" />}
            >
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="mb-2 font-semibold text-foreground">Entrega</h3>
                  <pre className="whitespace-pre-wrap rounded-lg border bg-muted/40 p-4 font-sans text-muted-foreground">
                    {formatShippingBlock({ fullName, phone, line1, line2, district, city, reference, postal })}
                  </pre>
                  <div className="mt-3 rounded-lg border border-dashed bg-muted/30 p-3 text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground">
                      Envío {shippingTierLabel(shippingTier)} — {shipping === 0 ? "Gratis" : `$${shipping.toFixed(2)}`}
                    </p>
                    {shippingTier === "plus" ? (
                      <p className="mt-1 text-xs">
                        Incluye prioridad en almacén, entrega acelerada, seguimiento preferente, seguro demo y embalaje reforzado.
                      </p>
                    ) : (
                      <p className="mt-1 text-xs">Entrega estándar con seguimiento básico. Gratis si el subtotal supera ${FREE_SHIPPING_THRESHOLD}.</p>
                    )}
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="mb-2 font-semibold text-foreground">Pago</h3>
                  {paymentMethod === "card" && (
                    <p className="text-muted-foreground">
                      Tarjeta de crédito o débito terminada en <span className="font-mono font-semibold text-foreground">{cardLast4}</span> · Vence{" "}
                      <span className="font-mono">{cardExpiry.trim()}</span>
                    </p>
                  )}
                  {paymentMethod === "paypal" && (
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">PayPal</strong> — completa el pago en la pestaña de PayPal si aún no lo hiciste. Esta demo no
                      verifica el estado del cobro.
                    </p>
                  )}
                  {paymentMethod === "cash" && cashReference && (
                    <div className="space-y-2 text-muted-foreground">
                      <p>
                        <strong className="text-foreground">Efectivo en tienda</strong> (OXXO, 7-Eleven, etc.) con referencia{" "}
                        <span className="font-mono font-semibold text-foreground">{cashReference}</span>.
                      </p>
                      <div className="max-w-sm">
                        <PaymentBarcode value={cashReference} />
                      </div>
                    </div>
                  )}
                </div>
                <Separator />
                <div>
                  <h3 className="mb-2 font-semibold text-foreground">Artículos ({items.length})</h3>
                  <ul className="space-y-2">
                    {items.map((i) => {
                      const p = findProduct(i.productId);
                      if (!p) return null;
                      return (
                        <li key={i.productId} className="flex justify-between gap-4 border-b border-dashed py-2 last:border-0">
                          <span>
                            {p.name} <span className="text-muted-foreground">×{i.quantity}</span>
                          </span>
                          <span className="shrink-0 font-medium tabular-nums">${(p.price * i.quantity).toFixed(2)}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                <Checkbox id="co-terms" checked={acceptTerms} onCheckedChange={(v) => setAcceptTerms(v === true)} className="mt-0.5" />
                <label htmlFor="co-terms" className="cursor-pointer text-sm leading-snug text-muted-foreground">
                  Acepto los términos y condiciones de Cenít Pi y confirmo que los datos de envío y el método de pago elegido son correctos.
                </label>
              </div>

              <div className="mt-6 flex flex-wrap justify-between gap-2">
                <Button type="button" variant="outline" className="rounded-full" onClick={() => goStep(2)}>
                  <ChevronLeft className="mr-1 size-4" />
                  Anterior
                </Button>
                <Button
                  type="button"
                  className="rounded-full bg-primary px-8 text-primary-foreground"
                  onClick={confirmOrder}
                  disabled={items.length === 0}
                >
                  <Check className="mr-2 size-4" />
                  Confirmar pedido
                </Button>
              </div>
            </SectionCard>
          )}
        </div>

        <aside className="h-fit space-y-4 lg:sticky lg:top-28">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <h3 className="mb-1 text-lg font-bold">Resumen</h3>
            <p className="mb-4 text-xs text-muted-foreground">Paso {step} de 3 · {STEPS[step - 1].title}</p>
            <Separator className="mb-4" />
            <div className="max-h-[220px] space-y-2 overflow-y-auto text-sm">
              {items.length === 0 ? (
                <p className="text-muted-foreground">Sin artículos</p>
              ) : (
                items.map((i) => {
                  const p = findProduct(i.productId);
                  if (!p) return null;
                  return (
                    <div key={i.productId} className="flex justify-between gap-2 text-xs">
                      <span className="line-clamp-2">{p.name}</span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">×{i.quantity}</span>
                    </div>
                  );
                })
              )}
            </div>
            <Separator className="my-4" />
            <SummaryRow label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
            <SummaryRow
              label={step === 1 ? "Envío (estimado)" : `Envío (${shippingTierLabel(shippingTier)})`}
              value={sidebarShipping === 0 ? "Gratis" : `$${sidebarShipping.toFixed(2)}`}
            />
            {step === 1 && (
              <p className="text-[11px] leading-snug text-muted-foreground">
                Estimación con envío Estándar. Plus (+${PLUS_SHIPPING_SURCHARGE.toFixed(2)}) en el paso 2.
              </p>
            )}
            <Separator className="my-3" />
            <SummaryRow label="Total estimado" value={`$${sidebarTotal.toFixed(2)}`} bold />
          </div>

          {step === 1 && items.length > 0 && (
            <Button className="w-full rounded-full bg-primary text-primary-foreground lg:hidden" type="button" onClick={() => goStep(2)}>
              Continuar a envío
            </Button>
          )}
        </aside>
      </div>
    </div>
  );
}

function PaymentBarcode({ value }: { value: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = svgRef.current;
    if (!el || !value) return;
    el.replaceChildren();
    try {
      JsBarcode(el, value, {
        format: "CODE128",
        width: 2,
        height: 56,
        displayValue: true,
        fontSize: 13,
        margin: 10,
        background: "transparent",
      });
    } catch {
      // valor no válido para el formato
    }
  }, [value]);

  return (
    <div className="flex justify-center overflow-x-auto rounded-lg border bg-background p-3">
      <svg ref={svgRef} className="max-h-[120px] max-w-full" aria-label={`Código de barras de referencia ${value}`} role="img" />
    </div>
  );
}

function StepIndicator({ current, onSelect }: { current: Step; onSelect: (s: Step) => void }) {
  return (
    <ol className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
      {STEPS.map(({ step, short }, idx) => {
        const done = current > step;
        const active = current === step;
        return (
          <li key={step} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              disabled={!done}
              onClick={() => done && onSelect(step)}
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors",
                done && "bg-success text-success-foreground",
                active && "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2",
                !done && !active && "bg-muted text-muted-foreground",
                done && "cursor-pointer hover:opacity-90",
              )}
            >
              {done ? <Check className="size-4" /> : step}
            </button>
            <div className="min-w-0 flex-1 sm:pr-2">
              <div className={cn("text-xs font-semibold uppercase tracking-wide", active ? "text-primary" : "text-muted-foreground")}>
                Paso {step}
              </div>
              <div className="truncate text-sm font-medium">{short}</div>
            </div>
            {idx < STEPS.length - 1 && <div className="hidden h-px flex-1 bg-border sm:block" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

function SectionCard({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-card sm:p-6">
      <div className="mb-5 flex gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
        <div>
          <h2 className="text-lg font-bold leading-tight">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={cn("flex justify-between text-sm", bold && "text-base font-bold")}>
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
