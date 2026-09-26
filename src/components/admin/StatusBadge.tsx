const tone: Record<string, string> = {
  nueva: "tp-badge-orange",
  pendiente: "",
  confirmada: "tp-badge-orange",
  en_taller: "tp-badge-orange",
  pagada: "tp-badge-green",
  lista: "tp-badge-green",
  entregada: "",
  rechazada: "tp-badge-red",
  anulada: "tp-badge-red",
  cancelada: "tp-badge-red",
};

export const statusLabel: Record<string, string> = {
  nueva: "Nueva",
  confirmada: "Confirmada",
  en_taller: "En taller",
  lista: "Lista",
  entregada: "Entregada",
  cancelada: "Cancelada",
  pendiente: "Pendiente de pago",
  pagada: "Pagada",
  rechazada: "Rechazada",
  anulada: "Anulada",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={`tp-badge ${tone[status] ?? ""}`}>{statusLabel[status] ?? status}</span>;
}
