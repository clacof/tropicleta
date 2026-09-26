import Link from "next/link";
import type { Product } from "@/db/schema";
import { formatCLP } from "@/lib/format";
import { ProductMedia } from "./ProductMedia";

export function ProductCard({ product }: { product: Product }) {
  const soldOut = product.stock <= 0;
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;
  return (
    <Link className="tp-product-card" href={`/tienda/${product.slug}/`}>
      <ProductMedia
        name={product.name}
        image={product.images[0]}
        badge={
          soldOut ? (
            <span className="tp-badge">Agotado</span>
          ) : onSale ? (
            <span className="tp-badge tp-badge-orange">Oferta</span>
          ) : null
        }
      />
      <div className="tp-product-body">
        <h3 className="tp-product-name">{product.name}</h3>
        <div className="tp-product-price">
          {formatCLP(product.price)}
          {onSale && <s>{formatCLP(product.compareAtPrice!)}</s>}
        </div>
      </div>
    </Link>
  );
}
