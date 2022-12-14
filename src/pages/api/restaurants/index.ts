import { createEndpoint } from "../../../app/endpoint";
import {
    AuthorizationError,
    ConflictError,
    HTTPError,
    NotFoundError,
} from "../../../app/exceptions";
import {
    deleteSchema,
    registerSchema,
    updateSchema,
} from "../../../schemas/restaurantschema";
import argon2 from "argon2";
import { RestaurantJWT } from "../../../app/restaurantjwt";
import { prisma } from "../../../app/prisma";
import { sanitiseRestaurant } from "../../../app/abstractedtypes";
import { convertImage } from "../../../app/convertimage";
import { isValidAddress } from "../../../app/maps";

export default createEndpoint({
    POST: async (req, res) => {
        const data = registerSchema.parse(req.body);

        // see if location is real
        if (
            !(await isValidAddress({
                line1: data.address1,
                line2: !data.address2 ? null : data.address2,
                postcode: data.postcode,
                city: data.city,
            }))
        )
            throw new HTTPError(400, "This address doesn't exist");

        let newRestaurant;
        try {
            const hashedPassword = await argon2.hash(data.password);
            newRestaurant = await prisma.restaurant.create({
                data: {
                    ...data,
                    password: hashedPassword,
                    logo: convertImage(data.logo),
                },
            });
        } catch (e) {
            console.log(e);
            throw new ConflictError("restaurant", "details");
        }

        const jwt = new RestaurantJWT(sanitiseRestaurant(newRestaurant));
        const token = jwt.sign();

        res.setHeader("Set-Cookie", RestaurantJWT.cookie(token));

        res.json({ token });
    },
    PATCH: async (req, res) => {
        const restaurant = RestaurantJWT.parseRequest(req);
        const data = updateSchema.parse(req.body);

        if (!restaurant) throw new NotFoundError("restaurant");

        const fullRestaurant = await prisma.restaurant.findFirst({
            where: { id: restaurant.id },
        });

        if (
            !(await argon2.verify(
                fullRestaurant!.password as string,
                data.password
            ))
        ) {
            throw new AuthorizationError("restaurant");
        }

        // see if location is real
        if (data.address1 && data.city && data.postcode) {
            if (
                !(await isValidAddress({
                    line1: data.address1,
                    line2: !data.address2 ? null : data.address2,
                    postcode: data.postcode,
                    city: data.city,
                }))
            ) {
                throw new HTTPError(400, "This address doesn't exist");
            }
        }

        // Hash new password
        if (data.newPassword) {
            data.newPassword = await argon2.hash(data.newPassword);
        }

        // Update logo
        if (data.logo) {
            data.logo = convertImage(data.logo);
        }

        if (data.minOrderAmount) {
            data.minOrderAmount = Number(data.minOrderAmount);
        }

        const { password, newPassword, ...toSend } = data;
        const d = {
            ...toSend,
            password: newPassword,
        };

        const updatedRestaurant = await prisma.restaurant.update({
            where: { id: restaurant.id },
            data: d,
        });

        res.json(sanitiseRestaurant(updatedRestaurant));
    },
    DELETE: async (req, res) => {
        const restaurant = RestaurantJWT.parseRequest(req);
        const { password } = deleteSchema.parse(req.body);

        if (!restaurant) throw new NotFoundError("restaurant");

        const fullRestaurant = await prisma.restaurant.findFirst({
            where: { id: restaurant.id },
        });

        if (
            !(await argon2.verify(fullRestaurant!.password as string, password))
        )
            throw new AuthorizationError("restaurant");

        await prisma.restaurant.delete({ where: { id: restaurant.id } });

        res.setHeader("Set-Cookie", RestaurantJWT.logoutCookie());

        res.json({ message: `Deleted restaurant account ${restaurant.id}` });
    },
});
