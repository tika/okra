import { User } from "@prisma/client";
import { serialize, parse } from "cookie";
import * as jwt from "jsonwebtoken";
import dayjs from "dayjs";
import { IncomingMessage } from "http";
import { AbstractUser } from "./abstractedtypes";

export type JWTPayload = Pick<User, "id">;

export class JWT {
    public static readonly SECRET_KEY = process.env.JWT_SECRET_KEY as string;
    public readonly user;

    constructor(user: AbstractUser) {
        this.user = user;
    }

    public sign(): string {
        const payload: JWTPayload = {
            id: this.user.id,
        };

        return jwt.sign(payload, JWT.SECRET_KEY, {
            expiresIn: "24h",
        });
    }

    public static logoutCookie() {
        return JWT.cookie("", new Date());
    }

    public static cookie(token: string, expiry?: Date): string {
        return serialize("token", token, {
            httpOnly: true,
            expires: expiry || dayjs().add(24, "hours").toDate(),
            secure: process.env.NODE_ENV === "production",
            path: "/",
        });
    }

    public static parseRequest(
        request: IncomingMessage & { cookies?: { [key: string]: string } }
    ) {
        if (!request || !request.headers.cookie) {
            return null;
        }

        const { token = null } = parse(request.headers.cookie);

        if (!token) {
            return null;
        }

        return JWT.verify(token);
    }

    public static verify(token?: string): JWTPayload | null {
        if (!token) return null;

        try {
            const { ...payload } = jwt.verify(
                token,
                JWT.SECRET_KEY
            ) as JWTPayload;
            console.log("Payload " + payload);
            return payload;
        } catch (_) {
            return null;
        }
    }
}
