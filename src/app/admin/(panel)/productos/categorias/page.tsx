import type { Metadata } from "next";
import { CategoryManager } from "@/components/admin/CategoryManager";
export const metadata:Metadata={title:"Categorías de productos"};
export default function ProductCategories(){return <CategoryManager kind="producto"/>;}
