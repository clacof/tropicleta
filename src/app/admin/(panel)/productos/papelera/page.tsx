import ProductosAdmin from "../page";
export const metadata={title:"Papelera de productos"};
export default async function Papelera({searchParams}:{searchParams:Promise<{bloqueado?:string;eliminado?:string}>}) {
  return <ProductosAdmin searchParams={Promise.resolve({...await searchParams,quitados:"1"})}/>;
}
