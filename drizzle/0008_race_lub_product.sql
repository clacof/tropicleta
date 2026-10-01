-- Producto solicitado para probar la tienda y el carrito. Se carga una sola vez.
INSERT INTO product_categories (slug, name, sort)
VALUES ('mantencion', 'Mantención', 1)
ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, description, price, stock, images, featured, active)
VALUES (
  'sellador-race-lub-250-ml',
  (SELECT id FROM product_categories WHERE slug = 'mantencion'),
  'Sellador Race Lub 250 ml',
  'Sellador con partículas para cámaras y neumáticos tubeless. Formato de 250 ml, para bicicletas de ruta, MTB y gravel. Ayuda a sellar pinchazos y puede utilizarse de forma preventiva. Incluye tubo aplicador. Según la información del envase, su fórmula es 100% biodegradable. Consulta con el taller la dosis y compatibilidad para tus neumáticos.',
  10000,
  6,
  '["/productos/sellador-race-lub-250-ml.png"]'::jsonb,
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;
