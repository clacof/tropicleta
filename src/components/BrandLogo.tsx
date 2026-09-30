import Image from "next/image";

export function BrandLogo() {
  return <span className="tp-brand-lockup">
    <Image src="/brand/mascota-oficial.webp" alt="" width={320} height={348} sizes="72px" className="tp-brand-mascot" />
    <Image src="/brand/wordmark-banner.webp" alt="Tropicleta · Taller de bicicletas" width={1100} height={291} sizes="(max-width: 719px) 160px, 230px" className="tp-brand-wordmark" />
  </span>;
}
