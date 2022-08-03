import { Item } from "@prisma/client";
import { LocalKey, LocalStorage } from "ts-localstorage";
import { CartItem } from "./okra";

export class Cart {
    private readonly cartKey;

    constructor(restaurantId: number) {
        this.cartKey = new LocalKey<CartItem[]>(`cart-${restaurantId}`, []);
    }

    // Returns the items in the cart
    public get() {
        if (typeof window === "undefined") return [];

        const items = LocalStorage.getItem(this.cartKey);

        if (!items) {
            LocalStorage.setItem(this.cartKey, []);
        }

        return items || [];
    }

    public set(items: CartItem[]) {
        LocalStorage.setItem(this.cartKey, items);
    }

    // Cleans up where we have duplicate ids
    // Returns a new array
    private clean(x: CartItem[]) {
        const y: CartItem[] = [];

        for (let i = 0; i < x.length; i++) {
            const elem = x[i];
            const match = y.filter((it) => it.itemId === elem.itemId);

            // If y doesn't include this itemId, then add
            if (match.length === 0) {
                y.push(elem);
            } else {
                // Otherwise find the quantity
                match[0].quantity = elem.quantity;
            }
        }

        return y;
    }

    // Adds an item to the cart
    // Returns the new items in the cart
    public add(item: Item, quantity: number) {
        let items = this.get();

        // If there aren't already items, lets set that key equal to a blank array
        if (!items) {
            LocalStorage.setItem(this.cartKey, []);
            items = [];
        }

        items.push({
            itemId: item.id,
            quantity,
        });

        // Compact duplicate ids
        LocalStorage.setItem(this.cartKey, this.clean(items));

        return items;
    }

    // Removes item(s) from cart
    public remove(itemId: number) {
        LocalStorage.setItem(
            this.cartKey,
            this.get().filter((it) => it.itemId !== itemId)
        );
    }
}
