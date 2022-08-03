// Stores entity types that are safe to be shown to the web
import { User, Restaurant } from ".prisma/client";

export type AbstractUser = Omit<
    User,
    "email" | "password" | "address1" | "address2" | "city" | "postcode"
>;
export type AbstractRestaurant = Omit<
    Restaurant,
    "email" | "password" | "stripePublicKey" | "stripeSecretKey"
>;

export function sanitiseUser(user: User[]): AbstractUser[];
export function sanitiseUser(user: User): AbstractUser;
export function sanitiseUser(user: User | User[]) {
    if (Array.isArray(user)) {
        return user.map((u) => {
            const {
                email,
                password,
                address1,
                address2,
                city,
                postcode,
                ...useful
            } = u;
            return useful;
        });
    }

    const { email, password, address1, address2, city, postcode, ...useful } =
        user;
    return useful;
}

export function sanitiseRestaurant(
    restaurant: Restaurant[]
): AbstractRestaurant[];
export function sanitiseRestaurant(restaurant: Restaurant): AbstractRestaurant;
export function sanitiseRestaurant(restaurant: Restaurant | Restaurant[]) {
    if (Array.isArray(restaurant)) {
        return restaurant.map((u) => {
            const {
                email,
                password,
                stripePublicKey,
                stripeSecretKey,
                ...useful
            } = u;
            return useful;
        });
    }

    const { email, password, stripePublicKey, stripeSecretKey, ...useful } =
        restaurant;
    return useful;
}
