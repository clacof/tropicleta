export function adminConfigurationError(): string | null {
  const production = process.env.NODE_ENV === "production";
  const password = process.env.ADMIN_PASSWORD ?? (production ? undefined : "tropicleta");
  if (!password) return "El acceso no está configurado: falta ADMIN_PASSWORD en Vercel.";
  const value = process.env.SESSION_SECRET ?? (production ? undefined : "solo-desarrollo-no-usar-en-produccion");
  if (!value || value.length < 16)
    return "No se puede crear la sesión: configura SESSION_SECRET en Vercel con al menos 16 caracteres.";
  return null;
}
