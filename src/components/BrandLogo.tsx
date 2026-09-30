import Image from "next/image";

export function BrandLogo({ stacked = false }: { stacked?: boolean }) {
  return <span className={`tp-brand-lockup${stacked ? " tp-brand-stacked" : ""}`}>
    <Image src="/brand/mascota-oficial.webp" alt="" width={320} height={348} sizes="72px" className="tp-brand-mascot" />
    <Image src={stacked ? "/brand/wordmark-stacked.webp" : "/brand/wordmark-banner.webp"} alt="Tropicleta · Taller de bicicletas" width={stacked ? 700 : 1100} height={stacked ? 473 : 291} sizes={stacked ? "155px" : "(max-width: 719px) 160px, 230px"} className="tp-brand-wordmark" />
  </span>;
}
