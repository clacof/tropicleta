import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { db, schema } from "@/db";

type Props = { params: Promise<{ id: string }> };

export default async function ProductoAdmin({ params }: Props) {
  const { id } = await params;
  const categories = await db.select().from(schema.productCategories).orderBy(asc(schema.productCategories.sort));
  let product = null;
  if (id !== "nuevo") {
    [product] = await db.select().from(schema.products).where(eq(schema.products.id, Number(id))).limit(1);
    if (!product) notFound();
  }
  return (
    <>
      <nav className="tp-breadcrumb">
        <Link href="/admin/productos/">Productos</Link>
        <span>/</span>
        <span>{product?.name ?? "Nuevo"}</span>
      </nav>
      <div className="tp-admin-title">
        <h1 className="tp-display">{product ? "Editar producto" : "Nuevo producto"}</h1>
      </div>
      <ProductForm product={product} categories={categories} />
    </>
  );
}
