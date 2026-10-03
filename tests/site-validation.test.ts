import assert from "node:assert/strict";
import { parseCart, clampQuantity } from "../src/lib/cart";
import { bookingSchema } from "../src/lib/validation";

const item = { productId: 1, slug: "cadena", name: "Cadena", price: 10000, quantity: 3, stock: 2 };
assert.deepEqual(parseCart([item, item, { productId: 2 }, { ...item, productId: 3, price: -1 }]), [{ ...item, quantity: 2 }]);
assert.deepEqual(parseCart([{ ...item, stock: 0 }]), []);
assert.deepEqual(parseCart({}), []);
assert.equal(clampQuantity(NaN, 10), 0);
assert.equal(clampQuantity(2.5, 10), 2);
assert.equal(clampQuantity(99, 99), 10);
const booking = { name: "Prueba taller", phone: "976614443", vehicleType: "bicicleta", services: ["mantencion-completa"], preferredDate: "2099-12-01", timeSlot: "manana" };
assert.equal(bookingSchema.safeParse(booking).success, true);
for (const transportMode of ["both", "pickup", "delivery"]) {
  const parsed = bookingSchema.safeParse({ ...booking, pickup: "on", transportMode, pickupCommune: "Copiapó", pickupAddress: "Dirección de prueba 105", firstService: "on" });
  assert.equal(parsed.success, true);
  if (parsed.success) assert.equal(parsed.data.firstService, true);
}
assert.equal(bookingSchema.safeParse({ ...booking, transportMode: "invalid" }).success, false);
assert.equal(bookingSchema.safeParse({ ...booking, pickup: "on", pickupCommune: "Copiapó" }).success, false);
for (const preferredDate of ["2099-02-31", "2099-13-01", "2000-01-01", "mal"])
  assert.equal(bookingSchema.safeParse({ ...booking, preferredDate }).success, false);
console.log("Carrito y fechas: pruebas correctas");
