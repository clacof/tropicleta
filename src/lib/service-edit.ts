import type { PackageService } from "./package-quote";

/** Keep pack references attached when an administrator changes a service URL. */
export function renameServiceReferences<T extends PackageService>(catalog:T[],previousSlug:string,nextSlug:string):T[] {
  if(previousSlug===nextSlug)return catalog;
  return catalog.map(service=>service.components.some(component=>component.slug===previousSlug)?{
    ...service,components:service.components.map(component=>component.slug===previousSlug?{...component,slug:nextSlug}:component),
  }:service);
}
