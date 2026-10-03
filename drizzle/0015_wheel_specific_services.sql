-- Keep existing IDs and prices for the front wheel; create a distinct rear job.
INSERT INTO services (slug,category_id,name,summary,description,includes,price,price_from,duration,kind,components,vehicles,individually_selectable,removed,featured,active,sort)
SELECT pair.rear_slug,s.category_id,pair.rear_name,s.summary,s.description,s.includes,s.price,s.price_from,s.duration,s.kind,s.components,s.vehicles,s.individually_selectable,s.removed,false,s.active,s.sort
FROM services s JOIN (VALUES
  ('tubeless-completo','tubeless-rueda-trasera','Tubeless de rueda trasera'),
  ('recarga-liquido','recarga-liquido-rueda-trasera','Recarga de líquido tubeless de rueda trasera'),
  ('centrado-de-rueda','centrado-rueda-trasera','Centrado de rueda trasera'),
  ('armado-de-rueda','armado-rueda-trasera','Armado de rueda trasera')
) AS pair(front_slug,rear_slug,rear_name) ON s.slug=pair.front_slug
ON CONFLICT(slug) DO NOTHING;
--> statement-breakpoint
UPDATE services SET name=CASE slug
  WHEN 'tubeless-completo' THEN 'Tubeless de rueda delantera'
  WHEN 'recarga-liquido' THEN 'Recarga de líquido tubeless de rueda delantera'
  WHEN 'centrado-de-rueda' THEN 'Centrado de rueda delantera'
  WHEN 'armado-de-rueda' THEN 'Armado de rueda delantera'
END WHERE slug IN ('tubeless-completo','recarga-liquido','centrado-de-rueda','armado-de-rueda');
