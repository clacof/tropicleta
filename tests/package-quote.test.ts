import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { packageQuote, packageLeaves, selectedLeaves, toggleSelection, validateHierarchy, emptySelection, type PackageService, type Selection } from "../src/lib/package-quote";
import { serviceQuote } from "../src/lib/service-quote";
import { packageReference } from "../src/lib/package-reference";
const individual=(slug:string,price:number|null=10000):PackageService=>({slug,name:slug,price,priceFrom:false,kind:"individual",components:[],vehicles:["bicicleta"],individuallySelectable:true,active:true});
const pack=(slug:string,price:number,children:string[]):PackageService=>({...individual(slug,price),kind:"package",components:children.map(slug=>({slug,required:true}))});
// Fixture artificial: no establece la composición de los paquetes reales del taller.
const catalog=[individual("a"),individual("b"),individual("c",20000),individual("extra",15000),pack("basic",15000,["a","b"]),pack("complete",30000,["basic","c"])];
const quote=(selection:Selection,rows=catalog)=>packageQuote(rows,selection,"bicicleta");
const total=(selection:Selection,rows=catalog)=>serviceQuote(quote(selection,rows).lines).total;
let basic=toggleSelection(catalog,emptySelection,"basic");
assert.deepEqual(selectedLeaves(catalog,basic),["a","b"]); // 1
let complete=toggleSelection(catalog,emptySelection,"complete");
assert.deepEqual(selectedLeaves(catalog,complete),["a","b","c"]); // 2
const manual:Selection={manual:["a","b"],packages:[],excluded:[]};
assert.deepEqual(quote(manual).lines.map(s=>s.slug),["basic"]); // 3
assert.equal(quote(manual).lines[0].automatic,true);
assert.equal(total({...complete,manual:["a"]}),30000); // 4
assert.equal(total(toggleSelection(catalog,complete,"extra")),45000); // 5
const removed=toggleSelection(catalog,complete,"b");
assert.deepEqual(selectedLeaves(catalog,removed),["a","c"]);
assert.ok(!quote(removed).recognized.includes("complete"));
assert.equal(total(removed),30000); // 6
const explicitWithManual={...basic,manual:["a"]};
assert.deepEqual(selectedLeaves(catalog,toggleSelection(catalog,explicitWithManual,"basic")),["a"]); // 7
assert.equal(total({...complete,packages:["complete","basic"]}),30000); // 8
assert.deepEqual(quote(complete).lines.map(s=>s.slug),["complete"]);
assert.equal(new Set(quote(complete).lines.flatMap(s=>s.included.length?s.included:[s.slug])).size,3);
assert.throws(()=>packageQuote(catalog,{manual:["a"],packages:[],excluded:[]},"scooter"),/vehículo/); // 10
assert.throws(()=>validateHierarchy([...catalog,pack("cycle1",10,["cycle2"]),pack("cycle2",10,["cycle1"])]),/circular/); // 11
const competing=[...catalog,pack("alternative",14000,["a","b"])];
assert.equal(total(manual,competing),14000); // 12
assert.deepEqual(quote(manual,competing).lines.map(s=>s.slug),["alternative"]);
const overlap=[individual("a"),individual("b"),individual("c"),pack("ab",10000,["a","b"]),pack("bc",10000,["b","c"])];
const overlapQuote=quote({manual:["a","b","c"],packages:[],excluded:[]},overlap);
assert.equal(serviceQuote(overlapQuote.lines).total,20000);
const billed=overlapQuote.lines.flatMap(s=>s.included.length?s.included:[s.slug]);
assert.equal(billed.length,new Set(billed).size);
const optional=[...catalog, {...pack("optional",15000,["a"]),components:[{slug:"a",required:true},{slug:"b",required:false}]}];
assert.ok(quote({manual:["a"],packages:[],excluded:[]},optional).recognized.includes("optional"));
assert.deepEqual(packageLeaves(optional,"optional",true),["a"]);
assert.throws(()=>validateHierarchy([...catalog,pack("bad",100,["missing"])]),/existe/);
assert.throws(()=>validateHierarchy([...catalog,pack("duplicate",100,["a","a"])]),/duplicados/);
assert.throws(()=>validateHierarchy(catalog.map(s=>s.slug==="a"?{...s,vehicles:["scooter"]}:s)),/compatible/);
assert.throws(()=>validateHierarchy(catalog.map(s=>s.slug==="a"?{...s,active:false}:s)),/desactivado/);
const opaque=[individual("x"),pack("pending",35000,[])];
assert.equal(total({manual:[],packages:["pending"],excluded:[]},opaque),35000);
assert.throws(()=>quote({manual:["x"],packages:["pending"],excluded:[]},opaque),/pendiente/);
assert.equal(total({manual:["a","b"],packages:[],excluded:[]},[individual("a",null),individual("b"),pack("known",20000,["a","b"])]),20000);
assert.throws(()=>quote({manual:["a"],packages:[],excluded:[]},catalog.map(s=>s.slug==="a"?{...s,individuallySelectable:false}:s)),/dentro/);
assert.throws(()=>quote(basic,catalog.map(s=>s.slug==="basic"?{...s,individuallySelectable:false}:s)),/otro paquete/);
assert.equal(total(complete,catalog.map(s=>s.slug==="basic"?{...s,individuallySelectable:false}:s)),30000);
const restored=toggleSelection(catalog,removed,"complete");
assert.deepEqual(selectedLeaves(catalog,restored),["a","b","c"]);

async function persistence() {
  const client=new PGlite(); const db=drizzle(client,{schema});
  try {
    await migrate(db,{migrationsFolder:"./drizzle"});
    const [existing]=await db.select().from(schema.services).where(eq(schema.services.slug,"mantencion-basica"));
    assert.equal(existing.kind,"package"); assert.equal(existing.components.length,5);
    const rows=await db.select().from(schema.services);
    validateHierarchy(rows);
    const configured=rows.filter(s=>s.kind==="package"&&s.components.length);
    assert.equal(configured.length,7);
    assert.ok(configured.every(s=>!s.active));
    const basicPack=rows.find(s=>s.slug==="mantencion-basica")!;
    assert.deepEqual(packageReference(rows,basicPack),{reference:47000,savings:12000});
    assert.deepEqual(packageReference(rows,rows.find(s=>s.slug==="mantencion-completa")!),{reference:83000,savings:33000});
    assert.equal(rows.find(s=>s.slug==="ajuste-frenos-mecanicos")!.price,7000);
    assert.equal(rows.find(s=>s.slug==="purga-frenos-hidraulicos")!.price,15000);
    const activePacks=rows.map(s=>s.components.length?{...s,active:true}:s);
    const doubleSelection={manual:[],packages:["pack-doble-suspension-sangrado"],excluded:[]};
    assert.throws(()=>packageQuote(activePacks,doubleSelection,"bicicleta"),/vehículo/);
    assert.equal(serviceQuote(packageQuote(activePacks,doubleSelection,"bicicleta",true).lines).total,165000);
    const fullSelection={manual:[],packages:["mantencion-completa"],excluded:[]};
    assert.equal(serviceQuote(packageQuote(activePacks,fullSelection,"bicicleta").lines).total,50000);
    assert.equal(packageLeaves(rows,"mantencion-completa").length,9);
    assert.ok(!packageLeaves(rows,"pack-doble-suspension").includes("horquilla-mecanica"));
    const changed=rows.map(s=>s.slug==="revision-tornilleria"?{...s,price:5000}:s);
    assert.equal(packageReference(changed,basicPack)!.reference,49000);
    assert.equal(rows.find(s=>s.slug==="mantencion-ebike")!.vehicles.join(),"electrica");
    assert.equal(rows.find(s=>s.slug==="frenos-scooter")!.vehicles.join(),"scooter");
    assert.equal(rows.find(s=>s.slug==="recarga-liquido")!.vehicles.length,3);
    const components=[{slug:"ajuste-frenos-mecanicos",required:true},{slug:"ajuste-de-cambios",required:true}];
    await db.update(schema.services).set({components,price:18000,active:true}).where(eq(schema.services.id,existing.id));
    const updated=await db.select().from(schema.services); validateHierarchy(updated);
    const result=packageQuote(updated,{manual:components.map(c=>c.slug),packages:[],excluded:[]},"bicicleta");
    assert.equal(result.lines[0].slug,"mantencion-basica"); assert.equal(serviceQuote(result.lines).total,18000); // 9
    await db.insert(schema.bookings).values({code:"TEST-PACKAGE",name:"Prueba",phone:"56912345678",vehicleType:"bicicleta",serviceNames:result.lines.map(s=>s.name),preferredDate:"2099-01-01",timeSlot:"manana",quoteSnapshot:{selection:manual,lines:result.lines}});
    const [booking]=await db.select().from(schema.bookings).where(eq(schema.bookings.code,"TEST-PACKAGE"));
    assert.ok(booking.quoteSnapshot);
    await migrate(db,{migrationsFolder:"./drizzle"});
    const [preserved]=await db.select().from(schema.services).where(eq(schema.services.id,existing.id));
    assert.equal(preserved.price,18000); assert.deepEqual(preserved.components,components);
  } finally {await client.close();}
  console.log("Paquetes: selección, cobertura sin duplicados, vehículos, ciclos y persistencia verificados.");
}
persistence().catch(e=>{console.error(e);process.exitCode=1;});
