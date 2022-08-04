import { Token, loadStripe } from "@stripe/stripe-js";
import { fetcher } from "./fetch";
import { CartItem } from "./okra";

export async function stripeTokenHandler(
    token: Token,
    restaurantId: number,
    note: string | undefined,
    userId: number,
    items: CartItem[]
) {
    const paymentData = { token: token.id, restaurantId, note, userId, items };

    const response = await fetcher(
        "POST",
        `/restaurants/checkout`,
        paymentData
    );

    return response;
}
