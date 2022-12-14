import { createEndpoint } from "../../../app/endpoint";
import { checkoutSchema } from "../../../schemas/checkoutschema";
import { prisma } from "../../../app/prisma";
import { NotFoundError } from "../../../app/exceptions";
import { formatPrice, formatAddress } from "../../../app/primitive";
import { OrderItem } from "@prisma/client";
import { sendEmail } from "../../../app/email";

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
            amount: Math.round(total * 100 + restaurant.deliveryFee * 100), // must be an int
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
                user: true,
                items: {
                    include: {
                        item: true,
                    },
                },
            },
        });

        // Send an email to the user
        sendEmail(order.user.email, "Order placed at " + restaurant.name, [
            `Hi ${order.user.name}`,
            "Thanks for placing your order, your food will be here shortly!",
            "",
            "Order summary:",
            "Id: " + order.id,
            "Items:",
            order.items
                .map(
                    (it) =>
                        ` - ${it.quantity}x ${it.item.name} (${formatPrice(
                            it.item.price * it.quantity
                        )})`
                )
                .join("\n"),
            order.note ? "Note: " + order.note : "No note provided",
            `Order total: ${formatPrice(restaurant.deliveryFee + total)}`,
            "",
            "Delivery address:",
            formatAddress({
                line1: order.user.address1,
                line2: order.user.address2,
                city: order.user.city,
                postcode: order.user.postcode,
            }),
            "",
            "Okra",
        ]);

        // Send an email to the restaurant
        sendEmail(restaurant.email, "New order from " + order.user.name, [
            `Hi ${restaurant.name}`,
            `You have a new order from ${order.user.name}`,
            "",
            "Order summary:",
            "Id: " + order.id,
            "Items:",
            order.items
                .map(
                    (it) =>
                        ` - ${it.quantity}x ${it.item.name} (${formatPrice(
                            it.item.price * it.quantity
                        )})`
                )
                .join("\n"),
            order.note ? "Note: " + order.note : "No note provided",
            `Order total: ${formatPrice(restaurant.deliveryFee + total)}`,
            "",
            "Delivery address:",
            formatAddress({
                line1: order.user.address1,
                line2: order.user.address2,
                city: order.user.city,
                postcode: order.user.postcode,
            }),
            "",
            "Thanks for being a partner,",
            "Okra",
        ]);

        console.log(
            `${data.userId} made a purchase for ${formatPrice(
                total + restaurant.deliveryFee
            )}, id: ${order.id}`
        );

        res.send({
            message: `Successfully made order for ${formatPrice(
                restaurant.deliveryFee
            )}, reference ${order.id}`,
            id: order.id,
        });
    },
});
