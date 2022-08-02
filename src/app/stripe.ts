import { Token, loadStripe } from "@stripe/stripe-js";
import { fetcher } from "./fetch";

export async function stripeTokenHandler(token: Token) {
    const paymentData = { token: token.id };

    const response = await fetcher("POST", "/charge", paymentData);

    return response;
}

export const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
);
