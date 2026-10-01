import { z } from "zod";
export const selectionSchema = z.object({ manual:z.array(z.string().min(1)).max(40), packages:z.array(z.string().min(1)).max(40), excluded:z.array(z.string().min(1)).max(40) });
