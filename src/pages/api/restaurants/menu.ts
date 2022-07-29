import { createEndpoint } from "../../../app/endpoint";
import { InvalidDataError, NotFoundError } from "../../../app/exceptions";
import { prisma } from "../../../app/prisma";
import { RestaurantJWT } from "../../../app/restaurantjwt";
import { createSchema, deleteSchema } from "../../../schemas/menuschema";

export default createEndpoint({
    GET: async (req, res) => {
        if (!req.query.id) throw new InvalidDataError("id", "query");

        const restaurant = await prisma.restaurant.findFirst({
            where: { id: parseInt(req.query.id as string) },
            include: { menu: true },
        });

        if (!restaurant) throw new NotFoundError("restaurant");

        return { menu: restaurant.menu };
    },
    POST: async (req, res) => {
        // POST to a menu sets the menu equal to the inputted JSON
        const restaurant = RestaurantJWT.parseRequest(req);
        const { item } = createSchema.parse(req.body);

        if (!restaurant) throw new NotFoundError("restaurant");

        // Then just connect it to one that already exists
        if (item.id) {
            const updatedRestaurant = await prisma.restaurant.update({
                where: { id: restaurant.id },
                data: {
                    menu: {
                        connect: item,
                    },
                },
                include: {
                    menu: true,
                },
            });

            return res.send({ updatedMenu: updatedRestaurant.menu });
        }

        const { id, ...itemWithoutId } = item;

        // We are creating a new item
        const updatedRestaurant = await prisma.restaurant.update({
            where: { id: restaurant.id },
            data: {
                menu: {
                    create: itemWithoutId,
                },
            },
            include: {
                menu: true,
            },
        });

        return res.send({ updatedMenu: updatedRestaurant.menu });
    },
    DELETE: async (req, res) => {
        const restaurant = RestaurantJWT.parseRequest(req);
        const { id } = deleteSchema.parse(req.body);

        if (!restaurant) throw new NotFoundError("restaurant");

        const updatedRestaurant = await prisma.restaurant.update({
            where: { id: restaurant.id },
            data: {
                menu: {
                    delete: {
                        id,
                    },
                },
            },
            include: {
                menu: true,
            },
        });

        return res.send({ updatedMenu: updatedRestaurant.menu });
    },
});
