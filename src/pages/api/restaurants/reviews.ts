import { createEndpoint } from "../../../app/endpoint";
import { createSchema, getSchema } from "../../../schemas/reviewschema";
import { prisma } from "../../../app/prisma";
import { NotFoundError } from "../../../app/exceptions";
import { UserJWT } from "../../../app/userjwt";

export default createEndpoint({
    GET: async (req, res) => {
        const data = getSchema.parse(req.body);

        const restaurant = await prisma.restaurant.findFirst({
            where: { id: data.restaurantId },
            include: {
                reviews: true,
            },
        });

        if (!restaurant) throw new NotFoundError("restaurant");

        res.json(restaurant);
    },
    POST: async (req, res) => {
        const user = UserJWT.parseRequest(req);
        const data = createSchema.parse(req.body);

        if (!user) throw new NotFoundError("user");

        const restaurant = await prisma.restaurant.findFirst({
            where: { id: data.restaurantId },
        });

        if (!restaurant) throw new NotFoundError("restaurant");

        const review = await prisma.review.create({
            data: {
                description: data.description,
                rating: data.rating,
                restaurantId: restaurant.id,
                userId: user.id,
            },
        });

        res.json({ message: `Created new ${review.rating} star review` });
    },
});
