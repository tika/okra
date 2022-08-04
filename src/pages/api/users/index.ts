import { createEndpoint } from "../../../app/endpoint";
import {
    AuthorizationError,
    ConflictError,
    HTTPError,
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
import { isValidAddress } from "../../../app/maps";

export default createEndpoint({
    POST: async (req, res) => {
        const { name, email, password, address1, address2, postcode, city } =
            registerSchema.parse(req.body);

        // see if location is real
        if (
            !(await isValidAddress({
                line1: address1,
                line2: !address2 ? null : address2,
                postcode,
                city,
            }))
        )
            throw new HTTPError(400, "This address doesn't exist");

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
            throw new ConflictError("user", "details");
        }

        const jwt = new UserJWT(sanitiseUser(newUser));
        const token = jwt.sign();

        res.setHeader("Set-Cookie", UserJWT.cookie(token));

        res.json({ token });
    },
    PATCH: async (req, res) => {
        const user = UserJWT.parseRequest(req);
        const data = updateSchema.parse(req.body);

        if (!user) throw new NotFoundError("user");

        const fullUser = await prisma.user.findFirst({
            where: { id: user.id },
        });

        if (!fullUser) {
            throw new NotFoundError("user");
        }

        if (
            !(await argon2.verify(fullUser!.password as string, data.password))
        ) {
            throw new AuthorizationError("user");
        }

        // see if location is real
        if (data.address1 && data.city && data.postcode) {
            if (
                !(await isValidAddress({
                    line1: data.address1,
                    line2: !data.address2 ? null : data.address2,
                    postcode: data.postcode,
                    city: data.city,
                }))
            ) {
                throw new HTTPError(400, "This address doesn't exist");
            }
        }

        // Hash new password
        if (data.newPassword) {
            data.newPassword = await argon2.hash(data.newPassword);
        }

        const { password, newPassword, ...toSend } = data;
        const d = {
            ...toSend,
            password: newPassword,
        };

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: d,
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
