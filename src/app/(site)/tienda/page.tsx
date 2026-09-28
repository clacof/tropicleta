import type { Metadata } from "next";
import Link from "next/link";
import { CatalogIcon } from "@/components/CatalogIcon";
import { ProductCard } from "@/components/shop/ProductCard";
import { SortSelect } from "@/components/shop/SortSelect";
import { getProductCategories, getProducts, type ProductSort } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tienda",
  description: "Productos seleccionados para ciclistas, elegidos para complementar el trabajo del taller Tropicleta.",
};

type Props = { searchParams: Promise<{ categoria?: string; orden?: string }> };
const sorts: ProductSort[] = ["recientes", "precio-asc", "precio-desc"];

export default async function TiendaPage({ searchParams }: Props) {
  const { categoria, orden } = await searchParams;
  const sort = sorts.includes(orden as ProductSort) ? (orden as ProductSort) : "recientes";
  const [categories, products] = await Promise.all([getProductCategories(), getProducts({ category: categoria, sort })]);

  const href = (cat?: string) => {
    const p = new URLSearchParams();
    if (cat) p.set("categoria", cat);
    if (sort !== "recientes") p.set("orden", sort);
    const q = p.toString();
    return `/tienda/${q ? "?" + q : ""}`;
  };

  return (
    <>
      <section className="tp-hero tp-page-hero">
        <div className="tp-shell" style={{ position: "relative", zIndex: 1 }}>
          <span className="tp-kicker">Tienda Tropicleta</span>
          <h1 className="tp-display">
            Productos <span>seleccionados.</span>
          </h1>
          <p className="tp-hero-copy">
            Una selección pequeña de productos para ciclistas, elegidos para complementar el trabajo del taller. Paga
            con Webpay o Mercado Pago y retira en el taller o recibe en tu casa.
          </p>
        </div>
      </section>

      <section className="tp-section" style={{ paddingTop: 48 }}>
        <div className="tp-shell">
          <div className="tp-shop-toolbar">
            <nav className="tp-chip-nav" aria-label="Categorías de productos">
              <Link className="tp-chip" href={href()} aria-current={!categoria ? "true" : undefined}>
                Todo
              </Link>
              {categories.map((c) => (
                <Link key={c.slug} className="tp-chip" href={href(c.slug)} aria-current={categoria === c.slug ? "true" : undefined}>
                  <CatalogIcon slug={c.slug} size={16} />
                  {c.name}
                </Link>
              ))}
            </nav>
            <SortSelect value={sort} />
          </div>

          {products.length ? (
            <div className="tp-product-grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="tp-shop-placeholder">
              <div>
                <strong>Todavía no hay productos en esta categoría.</strong>
                <br />
                <br />
                Muy pronto sumaremos más.
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
