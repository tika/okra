import { createEndpoint } from "../../../app/endpoint";
import {
    AuthorizationError,
    InvalidDataError,
    NotFoundError,
} from "../../../app/exceptions";
import { prisma } from "../../../app/prisma";
import { loginSchema } from "../../../schemas/userschema";
import argon2 from "argon2";
import { JWT } from "../../../app/jwt";
import { sanitise } from "../../../app/abstractedtypes";

export default createEndpoint({
    POST: async (req, res) => {
        const { name, password } = loginSchema.parse(req.body);
        if (!name) throw new InvalidDataError("email or username", "body");

        const user = await prisma.user.findFirst({
            where: {
                OR: [{ email: name }, { name }],
            },
        });

        if (!user) throw new NotFoundError("user");

        if (!(await argon2.verify(user.password as string, password)))
            throw new AuthorizationError("user");

        const jwt = new JWT(sanitise(user));
        const token = jwt.sign();

        res.setHeader("Set-Cookie", JWT.cookie(token));

        res.json({ token });
    },
});
