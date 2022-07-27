import { NextApiHandler } from "next";
import { ZodError } from "zod";
import { HTTPError } from "./exceptions";

export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export function createEndpoint<Resource>(
    methods: Partial<Record<Method, NextApiHandler<Resource>>>
): NextApiHandler<Resource | { message: string } | any> {
    const supportedMethods = Object.keys(methods);

    return async (req, res) => {
        const handler = methods[(req.method || "GET") as Method];

        if (!handler) {
            return res.status(405).json({
                message: `You must ${supportedMethods.join(
                    ", "
                )} to this endpoint!`,
            });
        }

        try {
            await handler(req, res);
        } catch (err) {
            if (err instanceof HTTPError) {
                return res.status(err.code).json({ message: err.message });
            }

            if (err instanceof ZodError) {
                const issues = err.issues.map((it) => {
                    return { information: it.message, fields: it.path };
                });
                return res.status(422).json({
                    message: `${issues[0].fields} ${issues[0].information}`,
                    issues,
                });
            }

            if (err instanceof Error) {
                res.status(500).json({
                    message: process.env.NODE_ENV
                        ? err.message
                        : "Something went wrong.",
                });
            }
        }
    };
}
