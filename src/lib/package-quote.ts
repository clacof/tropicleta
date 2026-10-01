import type { QuoteService } from "./service-quote";
export const vehicleLabels = { bicicleta: "Bicicleta", electrica: "Bicicleta eléctrica", scooter: "Scooter" };
export type Vehicle = keyof typeof vehicleLabels;
export type Component = { slug: string; required: boolean };
export type PackageService = QuoteService & { kind: string; components: Component[]; vehicles: Vehicle[]; individuallySelectable: boolean; active: boolean; removed?: boolean; requiresDoubleSuspension?: boolean };
export type Selection = { manual: string[]; packages: string[]; excluded: string[] };
export const emptySelection: Selection = { manual: [], packages: [], excluded: [] };

export function validateHierarchy(catalog: PackageService[]) {
  const map = new Map(catalog.map(s => [s.slug, s]));
  const visiting = new Set<string>(); const done = new Set<string>();
  function visit(s: PackageService) {
    if (visiting.has(s.slug)) throw Error("La composición contiene una dependencia circular.");
    if (done.has(s.slug)) return;
    if (!s.vehicles.length) throw Error("Selecciona al menos un tipo de vehículo.");
    if (s.kind !== "package" && s.components.length) throw Error("Solo un paquete puede tener componentes.");
    if (new Set(s.components.map(c => c.slug)).size !== s.components.length) throw Error("Hay componentes duplicados.");
    visiting.add(s.slug);
    for (const c of s.components) {
      const child = map.get(c.slug);
      if (!child) throw Error("Un componente ya no existe.");
      if (child.removed) throw Error("Un componente fue quitado del catálogo.");
      if (child.requiresDoubleSuspension && !s.requiresDoubleSuspension) throw Error("El paquete debe limitarse a bicicletas de doble suspensión.");
      if (s.active && !child.active) throw Error("Un paquete activo contiene un componente desactivado.");
      if (s.vehicles.some(v => !child.vehicles.includes(v))) throw Error("Un componente no es compatible con todos los vehículos del paquete.");
      if (child.kind === "package" && !child.components.length) throw Error("Define la composición del paquete incluido antes de usarlo como componente.");
      visit(child);
    }
    if (s.components.length && !s.components.some(c => c.required)) throw Error("El paquete necesita al menos un componente obligatorio.");
    visiting.delete(s.slug); done.add(s.slug);
  }
  catalog.filter(s => !s.removed).forEach(visit);
}

export function packageLeaves(catalog: PackageService[], slug: string, requiredOnly = false): string[] {
  const map = new Map(catalog.map(s => [s.slug, s])); const result = new Set<string>();
  const path = new Set<string>();
  function visit(key: string) {
    if (path.has(key)) throw Error("Dependencia circular.");
    const s = map.get(key); if (!s) throw Error("Componente inexistente.");
    if (s.kind !== "package" || !s.components.length) { result.add(key); return; }
    path.add(key);
    s.components.filter(c => !requiredOnly || c.required).forEach(c => visit(c.slug));
    path.delete(key);
  }
  visit(slug); return [...result].sort();
}
export function selectedLeaves(catalog: PackageService[], selection: Selection) {
  return [...new Set([...selection.manual, ...selection.packages.flatMap(slug => packageLeaves(catalog, slug))])].filter(slug => !selection.excluded.includes(slug)).sort();
}
export function toggleSelection(catalog: PackageService[], selection: Selection, slug: string): Selection {
  const service = catalog.find(s => s.slug === slug); if (!service) return selection;
  if (service.kind === "package") {
    const all = packageLeaves(catalog, slug);
    if (selection.packages.includes(slug) && packageLeaves(catalog,slug,true).every(s=>selectedLeaves(catalog,selection).includes(s))) return { ...selection, packages: selection.packages.filter(p => p !== slug) };
    return { ...selection, packages: [...new Set([...selection.packages, slug])], excluded: selection.excluded.filter(p => !all.includes(p)) };
  }
  const checked = selectedLeaves(catalog, selection).includes(slug);
  return checked ? { ...selection, manual: selection.manual.filter(s => s !== slug), excluded: [...new Set([...selection.excluded, slug])] }
    : { ...selection, manual: [...new Set([...selection.manual, slug])], excluded: selection.excluded.filter(s => s !== slug) };
}

/** Exact cover: each selected work belongs to precisely one charged line. */
export function packageQuote(catalog: PackageService[], selection: Selection, vehicle: Vehicle, doubleSuspension = false) {
  validateHierarchy(catalog);
  const map = new Map(catalog.map(s => [s.slug, s]));
  const allowed = catalog.filter(s => s.active && !s.removed && s.vehicles.includes(vehicle) && (!s.requiresDoubleSuspension || (doubleSuspension && vehicle !== "scooter")));
  for (const slug of [...selection.manual, ...selection.packages, ...selection.excluded]) {
    const s = map.get(slug);
    if (!s || !s.active || s.removed || !s.vehicles.includes(vehicle) || (s.requiresDoubleSuspension && (!doubleSuspension || vehicle === "scooter"))) throw Error("La selección contiene un servicio no disponible para este vehículo.");
  }
  if (selection.manual.some(slug => map.get(slug)!.kind === "package" || !map.get(slug)!.individuallySelectable)) throw Error("Este trabajo solo se puede seleccionar dentro de un paquete.");
  if (selection.packages.some(slug => !map.get(slug)!.individuallySelectable)) throw Error("Este paquete solo se puede contratar dentro de otro paquete.");
  if (selection.packages.some(slug => map.get(slug)!.kind !== "package")) throw Error("La selección de paquetes no es válida.");
  const leaves = selectedLeaves(catalog, selection);
  if (leaves.length > 40) throw Error("Selecciona hasta 40 trabajos por cotización.");
  const opaque = leaves.filter(slug => map.get(slug)!.kind === "package");
  if (opaque.length && leaves.length > 1) throw Error("Este paquete tiene su composición pendiente. Cotízalo por separado para evitar cobros duplicados.");
  const recognized = allowed.filter(s => s.kind === "package" && s.components.length && packageLeaves(catalog, s.slug, true).every(slug => leaves.includes(slug)));
  const bit = new Map(leaves.map((slug,i) => [slug, 1n << BigInt(i)]));
  const candidates = [...leaves.map(slug => ({ service: map.get(slug)!, included: [slug] })), ...recognized.map(service => ({ service, included: packageLeaves(catalog, service.slug).filter(slug => leaves.includes(slug)) }))]
    .map(c => ({ ...c, mask: c.included.reduce((mask, slug) => mask | bit.get(slug)!, 0n) }))
    .sort((a,b) => a.service.slug.localeCompare(b.service.slug));
  type Plan = { cost: number; pending: number; lines: typeof candidates };
  const memo = new Map<bigint, Plan | null>(); let states = 0;
  function solve(remaining: bigint): Plan | null {
    if (!remaining) return { cost: 0, pending: 0, lines: [] };
    if (memo.has(remaining)) return memo.get(remaining)!;
    if (++states > 100000) throw Error("Esta composición tiene demasiadas combinaciones. Simplifica los paquetes.");
    const first = remaining & -remaining; let best: Plan | null = null;
    for (const c of candidates) {
      if (!(c.mask & first) || (c.mask & remaining) !== c.mask) continue;
      const next = solve(remaining ^ c.mask); if (!next) continue;
      const plan = { cost: next.cost + (c.service.price ?? 0), pending: next.pending + (c.service.price === null ? 1 : 0), lines: [c, ...next.lines] };
      if (!best || plan.pending < best.pending || (plan.pending === best.pending && (plan.cost < best.cost || (plan.cost === best.cost && plan.lines.length < best.lines.length)))) best = plan;
    }
    memo.set(remaining, best); return best;
  }
  const result = solve((1n << BigInt(leaves.length)) - 1n);
  if (!result) throw Error("No se puede calcular esta combinación sin duplicar trabajos.");
  return { leaves, recognized: recognized.map(s => s.slug), lines: result.lines.map(c => ({ ...c.service, included: c.service.kind === "package" ? c.included.filter(s => s !== c.service.slug) : [], automatic: c.service.kind === "package" && !selection.packages.includes(c.service.slug) })) };
}
