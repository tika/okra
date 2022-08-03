import { Item, Review } from "@prisma/client";

export interface SVGProps {
    height: string | number;
    width: string | number;
}

export interface DefaultProps {
    main: string;
}

export type BaseItem = Omit<Item, "id" | "restaurantId"> & {
    id: number | undefined;
};
export interface CartItem {
    itemId: number;
    quantity: number;
}

export type CheckoutCartItem = Item & { quantity: number };

export type Feedback = {
    starCount: number;
    text: string;
};

export type ReviewWithRestaurant = Review & {
    restaurantName: string;
    restaurantLogo: string;
};
