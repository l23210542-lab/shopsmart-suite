import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Check, Coins, Copy, Loader2, Radio } from "lucide-react";
import { toast } from "sonner";

/** Cotización ficticia solo para la demo visual (no es un precio de mercado real). */
const DEMO_BTC_USD = 97_250;

export type BtcDemoProof = {
  address: string;
  amountBtc: string;
  invoiceId: string;
  txId: string;
};

type DemoPhase =
  | "idle"
  | "preparing"
  | "invoice"
  | "mempool"
  | "confirming"
  | "done";

function randomHex(n: number): string {
  const chars = "0123456789abcdef";
  let s = "";
  for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function makeDemoAddress(): string {
  return `bc1q${randomHex(38)}`;
}

function makeInvoiceId(): string {
  return `inv_${Date.now().toString(36)}_${randomHex(6)}`;
}

function makeTxId(): string {
  return randomHex(64);
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalUsd: number;
  onComplete: (proof: BtcDemoProof) => void;
};

export function BitcoinPaymentDemo({ open, onOpenChange, totalUsd, onComplete }: Props) {
  const labelId = useId();
  const [phase, setPhase] = useState<DemoPhase>("idle");
  const [invoiceId, setInvoiceId] = useState("");
  const [address, setAddress] = useState("");
  const [amountBtc, setAmountBtc] = useState("");
  const [txId, setTxId] = useState("");
  const [confirmations, setConfirmations] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const wasOpenRef = useRef(false);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setPhase("idle");
    setInvoiceId("");
    setAddress("");
    setAmountBtc("");
    setTxId("");
    setConfirmations(0);
  }, [clearTimers]);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      clearTimers();
      setPhase("idle");
      setInvoiceId("");
      setAddress("");
      setAmountBtc("");
      setTxId("");
      setConfirmations(0);
    }
    wasOpenRef.current = open;
  }, [open, clearTimers]);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
  }, []);

  const startDemo = () => {
    clearTimers();
    setPhase("preparing");
    const inv = makeInvoiceId();
    const addr = makeDemoAddress();
    const btc = Math.max(totalUsd / DEMO_BTC_USD, 0.000_000_01);
    const btcStr = btc.toFixed(8);

    schedule(() => {
      setInvoiceId(inv);
      setAddress(addr);
      setAmountBtc(btcStr);
      setPhase("invoice");
    }, 1200);
  };

  const simulateWalletSend = () => {
    clearTimers();
    setPhase("mempool");
    const tx = makeTxId();
    schedule(() => {
      setTxId(tx);
      setConfirmations(0);
      setPhase("confirming");
      let c = 0;
      const tick = () => {
        c += 1;
        setConfirmations(c);
        if (c < 3) {
          schedule(tick, 900);
        } else {
          schedule(() => setPhase("done"), 400);
        }
      };
      schedule(tick, 700);
    }, 1400);
  };

  const finish = () => {
    if (!address || !amountBtc || !invoiceId || !txId) return;
    onComplete({ address, amountBtc, invoiceId, txId });
    toast.success("Pago Bitcoin (demo) registrado. No se ha cobrado nada real.");
    handleOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      clearTimers();
      reset();
    }
    onOpenChange(next);
  };

  const qrSrc =
    address && amountBtc
      ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
          `bitcoin:${address}?amount=${amountBtc}`,
        )}`
      : "";

  const copy = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.message(msg);
    } catch {
      toast.error("No se pudo copiar al portapapeles.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md" aria-labelledby={labelId}>
        <DialogHeader>
          <DialogTitle id={labelId} className="flex items-center gap-2">
            <Coins className="size-5 text-amber-500" />
            Pago con Bitcoin (solo demo)
          </DialogTitle>
          <DialogDescription>
            Simulación completa: factura, dirección, “mempool” y confirmaciones en cadena.{" "}
            <strong className="text-foreground">No se conecta a la red Bitcoin ni se cobra ningún importe.</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {phase === "idle" && (
            <div className="rounded-lg border bg-muted/40 p-4 text-muted-foreground">
              <p className="mb-3">
                Total a cubrir en esta ficción: <span className="font-semibold text-foreground">${totalUsd.toFixed(2)} USD</span> (se convertirá a BTC
                con una tasa demo).
              </p>
              <Button type="button" className="w-full rounded-full" onClick={startDemo}>
                Comenzar flujo de pago (demo)
              </Button>
            </div>
          )}

          {phase === "preparing" && (
            <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
              <Loader2 className="size-10 animate-spin text-primary" />
              <p>Generando factura Lightning-compatible (simulada)…</p>
            </div>
          )}

          {phase === "invoice" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Factura <span className="font-mono text-foreground">{invoiceId}</span>
              </p>
              <div className="flex justify-center rounded-lg border bg-background p-3">
                {qrSrc ? <img src={qrSrc} alt="" className="size-[200px]" width={200} height={200} /> : null}
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Importe en BTC (demo)</span>
                <div className="flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2 font-mono text-sm font-semibold">
                  {amountBtc} BTC
                  <Button type="button" size="sm" variant="ghost" className="shrink-0" onClick={() => copy(amountBtc, "Importe copiado")}>
                    <Copy className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Dirección (ficticia)</span>
                <p className="break-all rounded-md bg-muted px-3 py-2 font-mono text-[11px] leading-relaxed">{address}</p>
                <Button type="button" size="sm" variant="outline" className="w-full rounded-full" onClick={() => copy(address, "Dirección copiada")}>
                  <Copy className="mr-2 size-4" />
                  Copiar dirección
                </Button>
              </div>
              <Button type="button" className="w-full rounded-full bg-amber-600 text-white hover:bg-amber-700" onClick={simulateWalletSend}>
                Simular envío desde mi wallet
              </Button>
            </div>
          )}

          {phase === "mempool" && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Radio className="size-10 animate-pulse text-primary" />
              <p className="text-center text-muted-foreground">Escuchando el mempool (simulado)…</p>
            </div>
          )}

          {phase === "confirming" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                TX (ficticia): <span className="break-all font-mono text-[10px] text-foreground">{txId}</span>
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>Confirmaciones en cadena</span>
                  <span>
                    {confirmations}/3
                  </span>
                </div>
                <Progress value={(confirmations / 3) * 100} className="h-2" />
              </div>
              <p className="text-xs text-muted-foreground">Cada bloque simulado refuerza el pago; en producción usarías tu nodo o un proveedor.</p>
            </div>
          )}

          {phase === "done" && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
              <Check className="mx-auto mb-2 size-10 text-emerald-600" />
              <p className="font-semibold text-foreground">Pago confirmado (demo)</p>
              <p className="mt-2 text-xs text-muted-foreground">
                No se ha movido criptomoneda real. Puedes cerrar y continuar al resumen del pedido.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          {phase === "done" ? (
            <Button type="button" className="w-full rounded-full sm:w-auto" onClick={finish}>
              Continuar al checkout
            </Button>
          ) : (
            <Button type="button" variant="ghost" className="w-full rounded-full sm:w-auto" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
