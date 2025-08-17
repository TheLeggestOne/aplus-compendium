import { z } from "zod";

export const CharacterSchema = z.object({
  id: z.uuid(),
  name: z.string().min(2).max(512),
  level: z.number().min(1),
});

export type CharacterShape = z.infer<typeof CharacterSchema>;
