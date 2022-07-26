import { PrismaClient } from "@prisma/client";

// @ts-ignore
export const prisma: PrismaClient = global.___prisma___;

if (!prisma) {
    throw new Error("No Prisma connection found");
}
