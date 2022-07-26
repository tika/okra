// Stores entity types that are safe to be shown to the web
import { User } from ".prisma/client";

export type AbstractUser = Omit<User, "email" | "password">;

export function sanitise(user: User[]): AbstractUser[];
export function sanitise(user: User): AbstractUser;
export function sanitise(user: User | User[]) {
    if (Array.isArray(user)) {
        return user.map((u) => {
            const { email, password, ...useful } = u;
            return useful;
        });
    }

    const { email, password, ...useful } = user;
    return useful;
}
