ALTER TABLE cash_entries ADD COLUMN area varchar(16) NOT NULL DEFAULT 'general';
--> statement-breakpoint
ALTER TABLE cash_entries ADD CONSTRAINT cash_area CHECK (area IN ('productos', 'servicios', 'general'));
--> statement-breakpoint
UPDATE cash_entries SET area = 'servicios' WHERE booking_id IS NOT NULL OR category = 'Taller';
--> statement-breakpoint
UPDATE cash_entries SET area = 'productos' WHERE booking_id IS NULL AND category = 'Venta presencial';
