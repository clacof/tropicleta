import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
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
