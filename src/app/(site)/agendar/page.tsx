import { redirect } from "next/navigation";
export default async function AgendarPage({ searchParams }: { searchParams: Promise<{ servicio?: string }> }) {
  const { servicio } = await searchParams;
  redirect("/servicios/" + (servicio ? "?servicio=" + encodeURIComponent(servicio) : ""));
}
