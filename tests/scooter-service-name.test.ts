import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
async function main(){
const client=new PGlite();const db=drizzle(client,{schema});
try{
  await migrate(db,{migrationsFolder:"./drizzle"});
  const [category]=await db.select().from(schema.serviceCategories).where(eq(schema.serviceCategories.slug,"scooters"));
  const [front]=await db.insert(schema.services).values({slug:"cambio-de-camara-delantera-scooter",name:"Cambio delantero",categoryId:category.id,price:10000,vehicles:["scooter"]}).returning();
  const [rear]=await db.insert(schema.services).values({slug:"camara-tras-scooter",name:"Cambio trasero",categoryId:category.id,price:10000,vehicles:["scooter"]}).returning();
  const [pack]=await db.insert(schema.services).values({slug:"pack-camara",name:"Pack cámara",categoryId:category.id,kind:"package",components:[{slug:front.slug,required:true}],vehicles:["scooter"],active:false}).returning();
  const migration=await readFile("drizzle/0014_scooter_service_name.sql","utf8");
  await client.exec(migration);
  const rows=await db.select().from(schema.services);
  const current=rows.find(s=>s.id===rear.id)!;
  assert.equal(current.name,"Cambio de cámara de scooter");assert.equal(current.price,10000);
  assert.equal(rows.find(s=>s.id===front.id)!.removed,true);
  assert.equal(rows.find(s=>s.slug==="pinchazo-scooter")!.removed,true);
  assert.deepEqual(rows.find(s=>s.id===pack.id)!.components,[{slug:rear.slug,required:true}]);
  await client.exec(migration); // Idempotent; history records retain their identifiers.
  await db.update(schema.services).set({components:[{slug:rear.slug,required:true},{slug:front.slug,required:true}]}).where(eq(schema.services.id,pack.id));
  await assert.rejects(client.exec(migration),/dos servicios de cámara/);
  assert.equal((await db.select().from(schema.services).where(eq(schema.services.id,pack.id)))[0].components.length,2);
  console.log("Cámara de scooter unificada: precio, IDs y vínculos conservados; packs ambiguos protegidos.");
}finally{await client.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
