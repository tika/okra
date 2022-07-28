import { z } from "zod";

const name = z.string().min(3);
const password = z.string().min(6);

export const registerSchema = z.object({
    name: name,
    email: z.string().email(),
    password,
    address1: z.string(),
    address2: z.string().optional(),
    city: z.string(),
    postcode: z.string(),
});

export const loginSchema = z.object({
    name,
    password,
});

export const updateSchema = z.object({
    name: name.optional(),
    email: z.string().email().optional(),
    password,
    address1: z.string().optional(),
    address2: z.string().optional(),
    city: z.string().optional(),
    postcode: z.string().optional(),
    newPassword: password.optional(),
});

export const deleteSchema = z.object({
    password,
});
