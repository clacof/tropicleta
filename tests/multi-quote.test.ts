import assert from "node:assert/strict";
import { multiVehicleQuote,quantityPackageQuote,setSelectionQuantity,vehicleQuotesSchema } from "../src/lib/multi-quote";
import { emptySelection,type PackageService } from "../src/lib/package-quote";
import { serviceQuote } from "../src/lib/service-quote";
const item=(slug:string,price:number|null=10000):PackageService=>({slug,name:slug,price,priceFrom:false,kind:"individual",components:[],vehicles:["bicicleta"],active:true,individuallySelectable:true});
const catalog=[item("a"),item("b"),{...item("pack",15000),kind:"package",components:[{slug:"a",required:true},{slug:"b",required:true}]}];
const total=(selection:Parameters<typeof quantityPackageQuote>[1])=>serviceQuote(quantityPackageQuote(catalog,selection,"bicicleta").lines).subtotal;
let selection=setSelectionQuantity(catalog,emptySelection,"a",2);
assert.equal(total(selection),20000);
selection=setSelectionQuantity(catalog,selection,"a",1);assert.equal(total(selection),10000);
selection=setSelectionQuantity(catalog,selection,"a",0);assert.equal(total(selection),0);
assert.deepEqual(selection.quantities,{});
selection=setSelectionQuantity(catalog,emptySelection,"pack",2);assert.equal(total(selection),30000);
assert.equal(quantityPackageQuote(catalog,selection,"bicicleta").lines[0].quantity,2);
selection=setSelectionQuantity(catalog,selection,"a",1);assert.equal(total(selection),25000);
assert.deepEqual(quantityPackageQuote(catalog,selection,"bicicleta").counts,{a:1,b:2});
const packWithExtra=setSelectionQuantity(catalog,setSelectionQuantity(catalog,emptySelection,"pack",1),"a",2);
assert.equal(total(packWithExtra),25000); // Included unit plus one extra, without duplicating the pack.
const repeatedManual={manual:["a","b"],packages:[],excluded:[],quantities:{a:2,b:2}};
assert.equal(total(repeatedManual),30000); // Two independently recognized packs.
assert.equal(total(setSelectionQuantity(catalog,repeatedManual,"pack",3)),45000);
assert.equal(total(setSelectionQuantity(catalog,repeatedManual,"pack",0)),0);
assert.equal(total(setSelectionQuantity(catalog,selection,"pack",0)),0); // A partially reduced explicit pack can also be removed.
const opaque={...item("opaque",12000),kind:"package",components:[]};
assert.equal(serviceQuote(quantityPackageQuote([opaque],{manual:[],packages:["opaque"],excluded:[],quantities:{opaque:3}},"bicicleta").lines).subtotal,36000);
assert.throws(()=>quantityPackageQuote(catalog,{manual:["a"],packages:[],excluded:[],quantities:{a:21}},"bicicleta"));
assert.throws(()=>quantityPackageQuote(catalog,{manual:["a"],packages:[],excluded:[],quantities:{a:-1}},"bicicleta"));
assert.throws(()=>quantityPackageQuote(catalog,{manual:["a"],packages:[],excluded:[],quantities:{a:1.5}},"bicicleta"));
assert.throws(()=>quantityPackageQuote(catalog,{manual:["a"],packages:[],excluded:[],quantities:{b:2}},"bicicleta"),/cantidad/);
const vehicles=[{slug:"bicicleta",name:"Bicicleta"},{slug:"scooter",name:"Scooter eléctrico"}];
const requests=[{id:"1",vehicle:"bicicleta",details:"MTB",selection:{manual:["a"],packages:[],excluded:[],quantities:{a:2}}},{id:"2",vehicle:"bicicleta",details:"Ruta",selection:{manual:["b"],packages:[],excluded:[]}}];
const groups=multiVehicleQuote(catalog,requests,vehicles);
assert.equal(serviceQuote(groups.flatMap(g=>g.calculation.lines)).subtotal,30000); // No pack can cover work across two bicycles.
const combined=serviceQuote(groups.flatMap(g=>g.calculation.lines),true,"Tierra Amarilla","both",true);
assert.equal(combined.discount,3000);assert.equal(combined.transport,5000);assert.equal(combined.total,32000);
assert.deepEqual(vehicleQuotesSchema.parse(JSON.parse(JSON.stringify(requests))),requests);
assert.throws(()=>multiVehicleQuote(catalog,[{...requests[0],vehicle:"removed"}],vehicles),/vehículo/);
assert.throws(()=>multiVehicleQuote(catalog,[requests[0],requests[0]],vehicles));
assert.throws(()=>vehicleQuotesSchema.parse(Array.from({length:11},(_,i)=>({...requests[0],id:String(i)}))));
console.log("Cantidades, packs repetidos, vehículos separados, límites, descuento y persistencia verificados.");
