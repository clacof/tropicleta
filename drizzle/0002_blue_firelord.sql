CREATE TABLE "cash_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" varchar(36) NOT NULL,
	"date" date NOT NULL,
	"type" varchar(10) NOT NULL,
	"category" varchar(60) NOT NULL,
	"description" text NOT NULL,
	"amount" integer NOT NULL,
	"method" varchar(30) NOT NULL,
	"reference" varchar(120) DEFAULT '' NOT NULL,
	"void_reason" text,
	"voided_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cash_positive" CHECK ("cash_entries"."amount" > 0),
	CONSTRAINT "cash_type" CHECK ("cash_entries"."type" in ('ingreso', 'gasto'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX "cash_request_unique" ON "cash_entries" USING btree ("request_id");