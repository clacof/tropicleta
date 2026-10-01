import { packageLeaves, type PackageService } from "./package-quote";

/** Suma los trabajos individuales únicos a sus precios vigentes, sin usar precios de packs. */
export function packageReference(catalog: PackageService[], service: PackageService) {
  if (service.kind !== "package" || !service.components.length) return null;
  const leaves = packageLeaves(catalog, service.slug).map(slug => catalog.find(s => s.slug === slug)!);
  if (leaves.some(s => s.price === null)) return null;
  const reference = leaves.reduce((total, s) => total + s.price!, 0);
  return { reference, savings: service.price === null ? null : reference - service.price, ...(service.priceFrom || leaves.some(s=>s.priceFrom)?{estimated:true}:{}) };
}
