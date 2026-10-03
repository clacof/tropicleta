import { redirect } from "next/navigation";

export default async function PackEditor({params}: {params:Promise<{id:string}>}) {
  const {id}=await params;
  redirect(`/admin/servicios/packs/${encodeURIComponent(id)}/`);
}
