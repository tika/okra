import { Item } from "@prisma/client";
import { LocalKey, LocalStorage } from "ts-localstorage";
import { CartItem } from "./okra";

const cartKey = new LocalKey<CartItem[]>("cart", []);

// Returns the items in the cart
export function getCartItems() {
    return LocalStorage.getItem(cartKey);
}

// Adds an item to the cart
// Returns the new items in the cart
export function addToCart(item: Item, amount: number) {
    let items = getCartItems();

    // If there aren't already items, lets set that key equal to a blank array
    if (!items) {
        LocalStorage.setItem(cartKey, []);
        items = [];
    }

    items.push({
        itemId: item.id,
        amount,
    });

    // Compact duplicate ids
    LocalStorage.setItem(cartKey, clean(items));

    return items;
}

// Cleans up where we have duplicate ids
// Returns a new array
function clean(x: CartItem[]) {
    const y: CartItem[] = [];

    for (let i = 0; i < x.length; i++) {
        const elem = x[i];
        const match = y.filter((it) => it.itemId === elem.itemId);

        // If y doesn't include this itemId, then add
        if (match.length === 0) {
            y.push(elem);
        } else {
            // Otherwise find the amount
            match[0].amount += elem.amount;
        }
    }

    return y;
}

export function setCart(items: CartItem[]) {
    LocalStorage.setItem(cartKey, items);
}
