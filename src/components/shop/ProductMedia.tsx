/* eslint-disable @next/next/no-img-element */
type Props = { name: string; image?: string | null; badge?: React.ReactNode };

/** Imagen del producto o, si no hay foto aún, un placeholder con la inicial en estilo Tropicleta. */
export function ProductMedia({ name, image, badge }: Props) {
  return (
    <div className="tp-product-media">
      {image ? (
        <img src={image} alt={name} loading="lazy" />
      ) : (
        <span className="tp-product-initial" aria-hidden="true">
          {name.trim().charAt(0).toUpperCase()}
        </span>
      )}
      {badge}
    </div>
  );
}
