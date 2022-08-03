import { z } from "zod";

export const checkoutSchema = z.object({
    restaurantId: z.number(),
    userId: z.number(),
    items: z.array(
        z.object({
            itemId: z.number(),
            quantity: z.number(),
        })
    ),
    note: z.string().optional(),
    token: z.any(), // valid inside of Checkout
});
