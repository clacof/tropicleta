import Image from "next/image";

export function BrandLogo() {
  return <span className="tp-brand-lockup">
    <Image src="/brand/tropicleta-mascota.jpeg" alt="" width={52} height={57} className="tp-brand-mascot" />
    <span>Tropicleta</span>
  </span>;
}
