import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { localBusinessJsonLd } from "@/lib/local-business";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()).replace(/</g, "\\u003c") }} />
      <a className="skip-link" href="#content">
        Ir al contenido principal
      </a>
      <Header />
      <main id="content">{children}</main>
      <Footer />
      <ChatWidget />
      <CartDrawer />
    </CartProvider>
  );
}
