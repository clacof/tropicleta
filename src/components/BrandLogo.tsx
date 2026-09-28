import Image from "next/image";

export function BrandLogo() {
  return <span className="tp-brand-lockup">
    <Image src="/brand/mascota-oficial.webp" alt="" width={320} height={348} sizes="72px" className="tp-brand-mascot" />
    <span>Tropicleta</span>
  </span>;
}
