export function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();
}

export function matchesSearch(query: string, ...fields: (string | null | undefined)[]) {
  const text = normalizeSearch(fields.filter(Boolean).join(" "));
  return normalizeSearch(query).split(/\s+/).every((word) => text.includes(word));
}
