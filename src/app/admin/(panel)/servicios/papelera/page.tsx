import ServiciosAdmin from "../page";
export const metadata={title:"Papelera de servicios"};
export default async function Papelera({searchParams}:{searchParams:Promise<{bloqueado?:string;eliminado?:string}>}) {
  return <ServiciosAdmin searchParams={Promise.resolve({...await searchParams,quitados:"1"})}/>;
}
