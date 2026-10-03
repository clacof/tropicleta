import type { Metadata } from "next";
import { CategoryManager } from "@/components/admin/CategoryManager";
export const metadata:Metadata={title:"Categorías de servicios"};
export default function ServiceCategories(){return <CategoryManager kind="servicio"/>;}
