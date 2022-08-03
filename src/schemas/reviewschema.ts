import { z } from "zod";

export const createSchema = z.object({
    description: z.string(),
    rating: z.number().min(1).max(5),
    restaurantId: z.number(),
});

export const getSchema = z.object({
    restaurantId: z.number(),
});
