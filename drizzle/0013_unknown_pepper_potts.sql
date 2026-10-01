CREATE TABLE "quote_vehicles" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(20) NOT NULL,
	"name" varchar(60) NOT NULL,
	"removed" boolean DEFAULT false NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "quote_vehicles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
INSERT INTO "quote_vehicles" ("slug","name","sort") VALUES ('bicicleta','Bicicleta',0),('scooter','Scooter eléctrico',1) ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint
UPDATE "services" SET "requires_double_suspension"=false,"excludes_double_suspension"=false;
