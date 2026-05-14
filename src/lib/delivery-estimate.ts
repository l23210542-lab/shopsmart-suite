import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Order } from "./cart";

/** Suma días hábiles (lun–vie) a partir de una fecha (hora local). */
export function addBusinessDays(start: Date, businessDays: number): Date {
  const d = new Date(start);
  d.setHours(12, 0, 0, 0);
  let added = 0;
  while (added < businessDays) {
    d.setDate(d.getDate() + 1);
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) added += 1;
  }
  return d;
}

export function resolveShippingTier(order: Order): "standard" | "plus" {
  if (order.shippingTier === "plus" || order.shippingTier === "standard") {
    return order.shippingTier;
  }
  if (order.address.includes("Envío: Plus") || order.address.includes("Plus (prioridad")) {
    return "plus";
  }
  return "standard";
}

export type DeliveryEstimate = {
  tier: "standard" | "plus";
  tierLabel: string;
  windowStart: Date;
  windowEnd: Date;
  /** Texto listo para UI, p. ej. "entre el 22 y el 27 de mayo de 2026". */
  rangeLabel: string;
  /** Leyenda de plazo, p. ej. "5 a 7 días hábiles desde la compra". */
  leadTimeLabel: string;
};

export function getDeliveryEstimate(order: Order): DeliveryEstimate {
  const tier = resolveShippingTier(order);
  const minBd = tier === "plus" ? 1 : 5;
  const maxBd = tier === "plus" ? 3 : 7;
  const placed = new Date(order.date);
  const windowStart = addBusinessDays(placed, minBd);
  const windowEnd = addBusinessDays(placed, maxBd);

  const d1 = format(windowStart, "d 'de' MMMM yyyy", { locale: es });
  const d2 = format(windowEnd, "d 'de' MMMM yyyy", { locale: es });
  const sameMonthYear =
    windowStart.getMonth() === windowEnd.getMonth() && windowStart.getFullYear() === windowEnd.getFullYear();
  const rangeLabel = sameMonthYear
    ? `entre el ${format(windowStart, "d", { locale: es })} y el ${format(windowEnd, "d 'de' MMMM yyyy", { locale: es })}`
    : `entre el ${d1} y el ${d2}`;

  const tierLabel = tier === "plus" ? "Envío Plus" : "Envío estándar";
  const leadTimeLabel =
    tier === "plus"
      ? "1 a 3 días hábiles desde la compra (prioridad)"
      : "5 a 7 días hábiles desde la compra";

  return { tier, tierLabel, windowStart, windowEnd, rangeLabel, leadTimeLabel };
}
