import { createEndpoint } from "../../../app/endpoint";
import {
    AuthorizationError,
    ConflictError,
    NotFoundError,
} from "../../../app/exceptions";
import {
    deleteSchema,
    registerSchema,
    updateSchema,
} from "../../../schemas/userschema";
import argon2 from "argon2";
import { UserJWT } from "../../../app/userjwt";
import { prisma } from "../../../app/prisma";
import { sanitiseUser } from "../../../app/abstractedtypes";

export default createEndpoint({
    POST: async (req, res) => {
        const { name, email, password, address1, address2, postcode, city } =
            registerSchema.parse(req.body);

        let newUser;
        try {
            const hashedPassword = await argon2.hash(password);
            newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    address1,
                    address2,
                    postcode,
                    city,
                },
            });
        } catch (e) {
            console.log(e);
            throw new ConflictError("user", "details");
        }

        const jwt = new UserJWT(sanitiseUser(newUser));
        const token = jwt.sign();

        res.setHeader("Set-Cookie", UserJWT.cookie(token));

        res.json({ token });
    },
    PATCH: async (req, res) => {
        const user = UserJWT.parseRequest(req);
        const { name, email, newPassword, password } = updateSchema.parse(
            req.body
        );

        if (!user) throw new NotFoundError("user");

        const fullUser = await prisma.user.findFirst({
            where: { id: user.id },
        });

        if (!(await argon2.verify(fullUser!.password as string, password)))
            throw new AuthorizationError("user");

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { name, email, password: newPassword },
        });

        res.json(sanitiseUser(updatedUser));
    },
    DELETE: async (req, res) => {
        const user = UserJWT.parseRequest(req);
        const { password } = deleteSchema.parse(req.body);

        if (!user) throw new NotFoundError("user");

        const fullUser = await prisma.user.findFirst({
            where: { id: user.id },
        });

        if (!(await argon2.verify(fullUser!.password as string, password)))
            throw new AuthorizationError("user");

        await prisma.user.delete({ where: { id: user.id } });

        res.setHeader("Set-Cookie", UserJWT.logoutCookie());

        res.json({ message: `Deleted account ${user.id}` });
    },
});
