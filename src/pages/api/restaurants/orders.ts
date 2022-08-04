import { createEndpoint } from "../../../app/endpoint";
import { NotFoundError, HTTPError } from "../../../app/exceptions";
import { RestaurantJWT } from "../../../app/restaurantjwt";
import { completeOrCancelSchema } from "../../../schemas/orderschema";
import { prisma } from "../../../app/prisma";

export default createEndpoint({
    // Complete an order
    POST: async (req, res) => {
        const restaurant = RestaurantJWT.parseRequest(req);
        const { orderId } = completeOrCancelSchema.parse(req.body);

        if (!restaurant) throw new NotFoundError("restaurant");

        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
            },
        });

        if (!order) throw new NotFoundError("order");

        if (order.completedAt !== null)
            throw new HTTPError(400, "Order already completed");

        const updatedOrder = await prisma.order.update({
            where: {
                id: orderId,
            },
            data: {
                completedAt: new Date(),
            },
        });

        res.json({ message: "Completed order", updatedOrder: updatedOrder });
    },

    // Cancel order
    DELETE: async (req, res) => {
        const restaurant = RestaurantJWT.parseRequest(req);
        const { orderId } = completeOrCancelSchema.parse(req.body);

        if (!restaurant) throw new NotFoundError("restaurant");

        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
            },
        });

        if (!order) throw new NotFoundError("order");

        if (order.completedAt !== null)
            throw new HTTPError(400, "Order already completed");

        await prisma.order.delete({
            where: {
                id: orderId,
            },
        });

        // Nb: could possibly have another field on the order for whether it was cancelled, but this will do for now

        res.send({ message: "Order cancelled/deleted" });
    },
});
