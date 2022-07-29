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

        const { id, ...itemWithoutId } = item;

        // This is what is sent to prisma as a query
        // If there is an item id, then we want to update the menu where the item.id = item.id
        // And set this new data
        // Otherwise create a new item
        const toSendObject = item.id
            ? {
                  update: {
                      where: { id: item.id },
                      data: itemWithoutId,
                  },
              }
            : {
                  create: itemWithoutId,
              };

        // We are creating a new item
        const updatedRestaurant = await prisma.restaurant.update({
            where: { id: restaurant.id },
            data: {
                menu: toSendObject,
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
