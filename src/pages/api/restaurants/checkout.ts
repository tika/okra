import { createEndpoint } from "../../../app/endpoint";
import { checkoutSchema } from "../../../schemas/checkoutschema";
import { prisma } from "../../../app/prisma";
import { NotFoundError } from "../../../app/exceptions";
import { formatPrice } from "../../../app/primitive";
import { OrderItem } from "@prisma/client";

export default createEndpoint({
    POST: async (req, res) => {
        const data = checkoutSchema.parse(req.body);

        // Is valid restaurant
        const restaurant = await prisma.restaurant.findFirst({
            where: {
                id: data.restaurantId,
            },
        });

        if (!restaurant) throw new NotFoundError("restaurant");

        // Is the token a token? Well, stripe would return an error
        const stripe = require("stripe")(restaurant.stripeSecretKey);

        // Work out total amount
        const items = await prisma.item.findMany({
            where: {
                id: {
                    in: data.items.map((it) => it.itemId),
                },
            },
        });

        let total = 0;

        for (let i = 0; i < items.length; i++) {
            const match = data.items.find((it) => it.itemId === items[i].id);
            if (!match) continue;

            total += items[i].price * match.quantity;
        }

        const charge = await stripe.charges.create({
            amount: total * 100,
            currency: "gbp",
            description: `Items: ${data.items
                .map((it) => it.itemId)
                .join(", ")}`,
            source: data.token,
        });

        // Temporarily holds the OrderItems
        const temp: Omit<OrderItem, "id" | "orderId">[] = [];

        data.items.forEach((it) =>
            temp.push({
                quantity: it.quantity,
                itemId: it.itemId,
            })
        );

        const order = await prisma.order.create({
            data: {
                note: data.note ?? "",
                items: {
                    create: temp,
                },
                userId: data.userId,
                restaurantId: data.restaurantId,
            },
            include: {
                items: true,
            },
        });

        console.log(
            `${data.userId} made a purchase for ${formatPrice(total)}, id: ${
                order.id
            }`
        );

        res.send({
            message: `Successfully made order for ${formatPrice(
                total
            )}, reference ${order.id}`,
            id: order.id,
        });
    },
});
