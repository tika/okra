import { createEndpoint } from "../../../app/endpoint";
import { checkoutSchema } from "../../../schemas/checkoutschema";
import { prisma } from "../../../app/prisma";
import { NotFoundError } from "../../../app/exceptions";
import { formatPrice } from "../../../app/primitive";

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

            total += items[i].price * match.amount;
        }

        const charge = await stripe.charges.create({
            amount: total * 100, // todo: calculate amount
            currency: "gbp",
            description: `Items: ${data.items
                .map((it) => it.itemId)
                .join(", ")}`,
            source: data.token,
        });

        // Multiply the number of items in the array
        // I know this is bad, but uh well.
        const arr = [];

        for (let i = 0; i < data.items.length; i++) {
            for (let j = 0; j < data.items[i].amount; j++) {
                arr.push({ id: data.items[i].itemId });
            }
        }

        console.log(arr);

        const order = await prisma.order.create({
            data: {
                note: data.note ?? "",
                items: {
                    connect: arr,
                },
                userId: data.userId,
                restaurantId: data.restaurantId,
            },
            include: {
                items: true,
            },
        });

        console.log(order.items);

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
