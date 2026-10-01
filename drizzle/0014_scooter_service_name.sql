DO $$
DECLARE
  target_slug text;
  duplicates text[];
BEGIN
  -- Prefer the already edited generic service, retaining its price and history.
  SELECT slug INTO target_slug FROM services
  WHERE slug IN ('camara-tras-scooter','cambio-de-camara-delantera-scooter','pinchazo-scooter') AND removed=false
  ORDER BY CASE slug WHEN 'camara-tras-scooter' THEN 0 WHEN 'cambio-de-camara-delantera-scooter' THEN 1 ELSE 2 END LIMIT 1;
  IF target_slug IS NULL THEN RETURN; END IF;
  SELECT array_agg(slug) INTO duplicates FROM services
  WHERE slug IN ('camara-tras-scooter','cambio-de-camara-delantera-scooter','pinchazo-scooter') AND slug<>target_slug;
  -- Never silently turn a pack containing two separate jobs into a single job.
  IF EXISTS (SELECT 1 FROM services s WHERE NOT s.removed AND
    (SELECT count(*) FROM jsonb_array_elements(s.components) c
      WHERE c->>'slug'=target_slug OR c->>'slug'=ANY(duplicates))>1) THEN
    RAISE EXCEPTION 'Un pack contiene dos servicios de cámara de scooter. Revisa su composición antes de unificar estos servicios.';
  END IF;
  UPDATE services s SET components=(SELECT jsonb_agg(
    CASE WHEN c->>'slug'=ANY(duplicates) THEN jsonb_set(c,'{slug}',to_jsonb(target_slug)) ELSE c END ORDER BY position)
    FROM jsonb_array_elements(s.components) WITH ORDINALITY AS parts(c,position))
  WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(s.components) c WHERE c->>'slug'=ANY(duplicates));
  UPDATE services SET active=false,removed=true WHERE slug=ANY(duplicates);
  UPDATE services SET name='Cambio de cámara de scooter',summary='Cambio de cámara de scooter.',description='Cambio de cámara de scooter.' WHERE slug=target_slug;
END $$;
