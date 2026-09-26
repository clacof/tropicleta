"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span className="tp-hint">Ordenar</span>
      <select
        className="tp-select"
        value={value}
        onChange={(e) => {
          const p = new URLSearchParams(params.toString());
          if (e.target.value === "recientes") p.delete("orden");
          else p.set("orden", e.target.value);
          router.push(`${pathname}${p.size ? "?" + p : ""}`);
        }}
      >
        <option value="recientes">Más recientes</option>
        <option value="precio-asc">Menor precio</option>
        <option value="precio-desc">Mayor precio</option>
      </select>
    </label>
  );
}
