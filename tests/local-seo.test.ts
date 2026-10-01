import assert from "node:assert/strict";
import { siteUrl } from "../src/lib/site-url";
import { localBusinessJsonLd } from "../src/lib/local-business";

for (const domain of ["http://tropicleta.com/", "https://www.tropicleta.com/"]) {
  process.env.NEXT_PUBLIC_SITE_URL = domain;
  assert.equal(siteUrl("/servicios/"), "https://www.tropicleta.com/servicios/");
}
process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3001/";
assert.equal(siteUrl("/contacto/"), "http://localhost:3001/contacto/");
process.env.NEXT_PUBLIC_SITE_URL = "https://tropicleta.com";
const business = localBusinessJsonLd();
assert.equal(business.address.addressLocality, "Tierra Amarilla");
assert.equal(business.address.streetAddress, "Carlos Condell 105");
assert.ok(business.areaServed.some(place => place.name === "Copiapó"));
assert.equal(business["@id"], "https://www.tropicleta.com/#taller");
assert.ok(business.sameAs.some(url => url.includes("instagram.com/tropicleta")));
console.log("PASS: dominio canónico, enlaces locales y ubicación real del taller");
