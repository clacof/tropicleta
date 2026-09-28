import { isAdmin } from "@/lib/auth";
import { getAccounting } from "@/lib/accounting";
import { csvCell } from "@/lib/accounting-validation";
export async function GET(request: Request) {
  if (!(await isAdmin())) return new Response("No autorizado", { status: 401 });
  const data = await getAccounting(new URL(request.url).searchParams.get("mes") ?? undefined);
  const lines = [["Fecha", "Tipo", "Categoría", "Descripción", "Monto CLP", "Medio", "Referencia", "Estado", "Motivo"], ...data.rows.map(r => [r.date, r.type, r.category, r.description, r.amount, r.method, r.reference, r.voided ? "Anulado" : "Vigente", r.reason])];
  return new Response("\uFEFF" + lines.map(row => row.map(csvCell).join(";")).join("\r\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="contabilidad-${data.month}.csv"`, "Cache-Control": "private, no-store" } });
}
