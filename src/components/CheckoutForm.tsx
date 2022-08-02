import React, { FormEvent } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

import CardSection from "./CardSection";
import { stripeTokenHandler } from "../app/stripe";
import toast from "react-hot-toast";
import { toastStyle } from "../app/constants";

export default function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();

    async function handleSubmit(event: FormEvent) {
        // We don't want to let default form submission happen here,
        // which would refresh the page.
        event.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            // Make  sure to disable form submission until Stripe.js has loaded.
            return;
        }

        const card = elements.getElement(CardElement);

        if (!card) {
            return;
        }

        const result = await stripe.createToken(card);

        console.log("HELLO");

        if (result.error) {
            // Show error to your customer.
            toast.error(result.error.message || "Something went wrong", {
                style: toastStyle,
            });
        } else {
            // Send the token to your server.
            stripeTokenHandler(result.token);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <CardSection />
            <button disabled={!stripe}>Confirm order</button>
        </form>
    );
}
