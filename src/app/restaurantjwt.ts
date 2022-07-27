import { parse, serialize } from "cookie";
import * as jwt from "jsonwebtoken";
import dayjs from "dayjs";
import { IncomingMessage } from "http";
import { AbstractRestaurant } from "./abstractedtypes";
import { Restaurant } from "@prisma/client";

export type JWTPayload = Pick<Restaurant, "id">;

export class RestaurantJWT {
    public static readonly SECRET_KEY = process.env.JWT_SECRET_KEY as string;
    public readonly restaurant;

    constructor(restaurant: AbstractRestaurant) {
        this.restaurant = restaurant;
    }

    public sign(): string {
        const payload: JWTPayload = {
            id: this.restaurant.id,
        };

        return jwt.sign(payload, RestaurantJWT.SECRET_KEY, {
            expiresIn: "24h",
        });
    }

    public static logoutCookie() {
        return RestaurantJWT.cookie("", new Date());
    }

    public static cookie(token: string, expiry?: Date): string {
        return serialize("restaurantToken", token, {
            httpOnly: true,
            expires: expiry || dayjs().add(24, "hours").toDate(),
            secure: process.env.NODE_ENV === "production",
            path: "/",
        });
    }

    public static parseRequest(
        request: IncomingMessage & {
            cookies: Partial<{
                [key: string]: string;
            }>;
        }
    ): JWTPayload | null {
        if (!request || !request.headers.cookie) {
            return null;
        }

        const { restaurantToken = null } = parse(request.headers.cookie);

        if (!restaurantToken) {
            return null;
        }

        return RestaurantJWT.verify(restaurantToken);
    }

    public static verify(token?: string): JWTPayload | null {
        if (!token) return null;

        try {
            const { ...payload } = jwt.verify(
                token,
                RestaurantJWT.SECRET_KEY
            ) as JWTPayload;
            return payload;
        } catch (_) {
            return null;
        }
    }
}
