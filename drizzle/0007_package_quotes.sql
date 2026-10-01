ALTER TABLE services ADD COLUMN kind varchar(16) NOT NULL DEFAULT 'individual';
--> statement-breakpoint
ALTER TABLE services ADD COLUMN components jsonb NOT NULL DEFAULT '[]'::jsonb;
--> statement-breakpoint
ALTER TABLE services ADD COLUMN vehicles jsonb NOT NULL DEFAULT '["bicicleta","electrica"]'::jsonb;
--> statement-breakpoint
ALTER TABLE services ADD COLUMN individually_selectable boolean NOT NULL DEFAULT true;
--> statement-breakpoint
ALTER TABLE services ADD CONSTRAINT service_kind_valid CHECK (kind IN ('individual','package'));
--> statement-breakpoint
ALTER TABLE bookings ADD COLUMN quote_snapshot jsonb;
--> statement-breakpoint
UPDATE services SET kind='package' WHERE slug IN ('mantencion-basica','mantencion-completa','ajuste-inicial','mantencion-ebike','armado-bicicleta-nueva');
--> statement-breakpoint
UPDATE services SET vehicles='["electrica"]'::jsonb WHERE slug='mantencion-ebike';
--> statement-breakpoint
UPDATE services SET vehicles='["scooter"]'::jsonb WHERE category_id=(SELECT id FROM service_categories WHERE slug='scooters');
--> statement-breakpoint
UPDATE services SET vehicles='["bicicleta","electrica","scooter"]'::jsonb WHERE slug IN ('recarga-liquido','retiro-y-entrega');
