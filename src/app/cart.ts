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

    LocalStorage.setItem(cartKey, items);
    return items;
}

export function setCart(items: CartItem[]) {
    LocalStorage.setItem(cartKey, items);
}
