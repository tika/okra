import { z } from "zod";

export const completeOrCancelSchema = z.object({
    orderId: z.string(),
});
