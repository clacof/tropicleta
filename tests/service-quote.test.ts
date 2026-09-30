import assert from "node:assert/strict";
import { serviceQuote } from "../src/lib/service-quote";
const services = [{ slug: "basic", name: "Básica", price: 35000, priceFrom: false }, { slug: "adjust", name: "Ajuste", price: 15000, priceFrom: false }];
assert.equal(serviceQuote(services).total, 50000);
assert.equal(serviceQuote(services.slice(0, 1)).total, 35000);
for (const [zone, cost] of [["Tierra Amarilla", 5000], ["Paipote", 15000], ["Copiapó", 20000]] as const) assert.equal(serviceQuote(services, true, zone).total, 50000 + cost);
assert.equal(serviceQuote(services, false, "Copiapó").total, 50000);
assert.equal(serviceQuote(services, true).pending, true);
assert.equal(serviceQuote([{...services[0], price: null}]).pending, true);
assert.equal(serviceQuote([{...services[0], price: null}]).total, 0);
assert.equal(serviceQuote([{...services[0], priceFrom: true}]).from, true);
assert.equal(serviceQuote([]).total, 0);
for (const [zone, cost] of [["Tierra Amarilla", 3000], ["Paipote", 8000], ["Copiapó", 12000]] as const) {
  for (const mode of ["pickup", "delivery"] as const) {
    assert.equal(serviceQuote(services, true, zone, mode).total, 50000 + cost);
    assert.equal(serviceQuote(services, true, zone, mode, true).total, 45000 + cost);
  }
}
assert.equal(serviceQuote(services, true, "Copiapó", "both", true).total, 65000);
assert.equal(serviceQuote(services, false, "", "both", true).discount, 5000);
assert.equal(serviceQuote([], true, "Paipote", "both", true).total, 15000);
assert.equal(serviceQuote(services, true, "", "both", true).pending, true);
console.log("Cálculos de cotización verificados.");
