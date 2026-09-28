import Image from "next/image";

export function BrandLogo() {
  return <span className="tp-brand-lockup">
    <Image src="/brand/mascota-oficial.webp" alt="" width={160} height={174} className="tp-brand-mascot" />
    <span>Tropicleta</span>
  </span>;
}
