import { User } from "@prisma/client";
import { parse, serialize } from "cookie";
import * as jwt from "jsonwebtoken";
import dayjs from "dayjs";
import { IncomingMessage } from "http";
import { AbstractUser } from "./abstractedtypes";

export type JWTPayload = Pick<User, "id">;

export class UserJWT {
    public static readonly SECRET_KEY = process.env.JWT_SECRET_KEY as string;
    public readonly user;

    constructor(user: AbstractUser) {
        this.user = user;
    }

    public sign(): string {
        const payload: JWTPayload = {
            id: this.user.id,
        };

        return jwt.sign(payload, UserJWT.SECRET_KEY, {
            expiresIn: "24h",
        });
    }

    public static logoutCookie() {
        return UserJWT.cookie("", new Date());
    }

    public static cookie(token: string, expiry?: Date): string {
        return serialize("userToken", token, {
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

        const { userToken = null } = parse(request.headers.cookie);

        if (!userToken) {
            return null;
        }

        return UserJWT.verify(userToken);
    }

    public static verify(token?: string): JWTPayload | null {
        if (!token) return null;

        try {
            const { ...payload } = jwt.verify(
                token,
                UserJWT.SECRET_KEY
            ) as JWTPayload;
            return payload;
        } catch (_) {
            return null;
        }
    }
}
