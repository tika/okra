import { z } from "zod";

export const createSchema = z.object({
    item: z.object({
        id: z.number().optional(),
        image: z.string().optional(),
        name: z.string(),
        price: z.number(),
        category: z.string(),
        description: z.string().optional(),
    }),
});

export const deleteSchema = z.object({
    id: z.number(),
});
