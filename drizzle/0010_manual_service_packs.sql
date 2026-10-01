ALTER TABLE services ADD COLUMN requires_double_suspension boolean NOT NULL DEFAULT false;
--> statement-breakpoint
ALTER TABLE services ADD COLUMN removed boolean NOT NULL DEFAULT false;
--> statement-breakpoint
ALTER TABLE products ADD COLUMN removed boolean NOT NULL DEFAULT false;
--> statement-breakpoint
-- Reutiliza los registros y precios actuales para el freno delantero.
UPDATE services SET name = 'Ajuste de freno delantero' WHERE slug = 'ajuste-frenos-mecanicos';
--> statement-breakpoint
UPDATE services SET name = 'Purga o sangrado de freno delantero' WHERE slug = 'purga-frenos-hidraulicos';
--> statement-breakpoint
INSERT INTO services (slug, category_id, name, price, vehicles, sort)
SELECT 'ajuste-freno-trasero', id, 'Ajuste de freno trasero', 7000, '["bicicleta","electrica"]'::jsonb, 25 FROM service_categories WHERE slug = 'frenos'
ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO services (slug, category_id, name, price, vehicles, sort)
SELECT 'sangrado-freno-trasero', id, 'Purga o sangrado de freno trasero', 15000, '["bicicleta","electrica"]'::jsonb, 35 FROM service_categories WHERE slug = 'frenos'
ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO services (slug, category_id, name, price, vehicles, sort)
SELECT 'revision-tornilleria', id, 'Revisión de tornillería', 3000, '["bicicleta","electrica"]'::jsonb, 85 FROM service_categories WHERE slug = 'mantenciones'
ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
-- Configuración confirmada: borradores revisables antes de activar, sin cambiar precios individuales.
UPDATE services SET kind = 'package', price = 25000, active = false, featured = false,
components = '[{"slug":"ajuste-frenos-mecanicos","required":true},{"slug":"ajuste-freno-trasero","required":true},{"slug":"ajuste-de-cambios","required":true},{"slug":"revision-tornilleria","required":true}]'
WHERE slug = 'ajuste-frenos-cambios';
--> statement-breakpoint
UPDATE services SET components = '[{"slug":"ajuste-frenos-mecanicos","required":true},{"slug":"ajuste-freno-trasero","required":true},{"slug":"ajuste-de-cambios","required":true},{"slug":"limpieza-bicicleta-transmision","required":true},{"slug":"revision-tornilleria","required":true}]', active = false, featured = false WHERE slug = 'mantencion-basica';
--> statement-breakpoint
UPDATE services SET components = '[{"slug":"revision-tornilleria","required":true},{"slug":"ajuste-de-cambios","required":true},{"slug":"ajuste-frenos-mecanicos","required":true},{"slug":"ajuste-freno-trasero","required":true},{"slug":"mantencion-de-direccion","required":true},{"slug":"mantencion-de-centro","required":true}]', active = false, featured = false WHERE slug = 'ajuste-inicial';
--> statement-breakpoint
UPDATE services SET components = '[{"slug":"mantencion-basica","required":true},{"slug":"mantencion-de-centro","required":true},{"slug":"mantencion-de-direccion","required":true},{"slug":"eje-delantero","required":true},{"slug":"eje-trasero","required":true}]', active = false, featured = false WHERE slug = 'mantencion-completa';
--> statement-breakpoint
INSERT INTO services (slug, category_id, name, kind, price, components, vehicles, active, requires_double_suspension, sort)
SELECT p.slug, c.id, p.name, 'package', p.price, p.components::jsonb, '["bicicleta","electrica"]'::jsonb, false, p.double_suspension, p.sort
FROM service_categories c CROSS JOIN (VALUES
('mantencion-completa-sangrado', 'Mantención completa + sangrado de ambos frenos', 70000, '[{"slug":"mantencion-completa","required":true},{"slug":"purga-frenos-hidraulicos","required":true},{"slug":"sangrado-freno-trasero","required":true}]', false, 46),
('pack-doble-suspension', 'Pack de doble suspensión', 150000, '[{"slug":"mantencion-completa","required":true},{"slug":"servicio-al-cuadro","required":true},{"slug":"servicio-amortiguador","required":true},{"slug":"servicio-completo-horquilla","required":true}]', true, 47),
('pack-doble-suspension-sangrado', 'Pack de doble suspensión + sangrado de ambos frenos', 165000, '[{"slug":"pack-doble-suspension","required":true},{"slug":"purga-frenos-hidraulicos","required":true},{"slug":"sangrado-freno-trasero","required":true}]', true, 48)
) AS p(slug, name, price, components, double_suspension, sort)
WHERE c.slug = 'mantenciones' ON CONFLICT (slug) DO NOTHING;
