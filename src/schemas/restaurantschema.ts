import { z } from "zod";

const name = z.string().min(3);
const password = z.string().min(6);

export const registerSchema = z.object({
    logo: z.string(),
    name,
    email: z.string(),
    description: z.string().optional(),
    password,
    minOrderAmount: z.number(),
    address1: z.string(),
    address2: z.string().optional(),
    city: z.string(),
    postcode: z.string(),
});

export const loginSchema = z.object({
    email: z.string(),
    password,
});

export const updateSchema = z.object({
    logo: z.string().optional(),
    name: name.optional(),
    email: z.string().optional(),
    description: z.string().optional(),
    password,
    minOrderAmount: z
        .string()
        .transform((it) => Number(it))
        .optional(),
    address1: z.string().optional(),
    address2: z.string().optional(),
    city: z.string().optional(),
    postcode: z.string().optional(),
    newPassword: password.optional(),
});

export const deleteSchema = z.object({
    password,
});
