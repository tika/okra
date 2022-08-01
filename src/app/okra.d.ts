import { Item } from "@prisma/client";

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
    amount: number;
}
