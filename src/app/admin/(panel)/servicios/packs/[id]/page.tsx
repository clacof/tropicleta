import ServiceEditor from "../../[id]/page";

export default function PackEditor(props: {params:Promise<{id:string}>;searchParams:Promise<{dependencias?:string;recuperacion?:string}>}) {
  return <ServiceEditor {...props} packMode />;
}
