import { createEndpoint } from "../../../app/endpoint";
import {
    AuthorizationError,
    InvalidDataError,
    NotFoundError,
} from "../../../app/exceptions";
import { prisma } from "../../../app/prisma";
import { loginSchema } from "../../../schemas/restaurantschema";
import argon2 from "argon2";
import { RestaurantJWT } from "../../../app/restaurantjwt";
import { sanitiseRestaurant } from "../../../app/abstractedtypes";

export default createEndpoint({
    POST: async (req, res) => {
        const { email, password } = loginSchema.parse(req.body);
        if (!email) throw new InvalidDataError("email", "body");

        const restaurant = await prisma.restaurant.findFirst({
            where: {
                email,
            },
        });

        if (!restaurant) throw new NotFoundError("restaurant");

        if (!(await argon2.verify(restaurant.password as string, password)))
            throw new AuthorizationError("restaurant");

        const jwt = new RestaurantJWT(sanitiseRestaurant(restaurant));
        const token = jwt.sign();

        res.setHeader("Set-Cookie", RestaurantJWT.cookie(token));

        res.json({ token });
    },
});
