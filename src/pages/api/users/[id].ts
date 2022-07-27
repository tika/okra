import { sanitise } from "../../../app/abstractedtypes";
import { createEndpoint } from "../../../app/endpoint";
import { InvalidDataError, NotFoundError } from "../../../app/exceptions";
import { prisma } from "../../../app/prisma";

export default createEndpoint({
    GET: async (req, res) => {
        if (!req.query.id) throw new InvalidDataError("id", "query");

        const user = await prisma.user.findFirst({
            where: { id: parseInt(req.query.id as string) },
        });

        if (!user) throw new NotFoundError("user");

        res.json(sanitise(user));
    },
});
