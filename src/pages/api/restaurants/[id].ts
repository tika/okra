import { sanitiseRestaurant } from "../../../app/abstractedtypes";
import { createEndpoint } from "../../../app/endpoint";
import { InvalidDataError, NotFoundError } from "../../../app/exceptions";
import { prisma } from "../../../app/prisma";

export default createEndpoint({
    GET: async (req, res) => {
        if (!req.query.id) throw new InvalidDataError("id", "query");

        const restaurant = await prisma.restaurant.findFirst({
            where: { id: parseInt(req.query.id as string) },
        });

        if (!restaurant) throw new NotFoundError("restaurant");

        res.json(sanitiseRestaurant(restaurant));
    },
});
