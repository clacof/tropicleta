import { z } from "zod";
export const selectionSchema = z.object({ manual:z.array(z.string().min(1)).max(40), packages:z.array(z.string().min(1)).max(40), excluded:z.array(z.string().min(1)).max(40), quantities:z.record(z.string().min(1),z.number().int().min(1).max(20)).refine(q=>Object.keys(q).length<=80).optional() });
