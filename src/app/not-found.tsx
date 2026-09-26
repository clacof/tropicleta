import { ComingSoon } from "@/components/ComingSoon";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/components/cart/CartProvider";

export default function NotFound() {
  return (
    <CartProvider>
      <Header />
      <main id="content">
        <ComingSoon
          kicker="Error 404"
          title="Aquí no hay"
          highlight="camino."
          intro="La página que buscas no existe o cambió de lugar. Vuelve al inicio o escríbenos y te ayudamos."
        />
      </main>
      <Footer />
    </CartProvider>
  );
}
