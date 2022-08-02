import React from "react";
import { CardElement } from "@stripe/react-stripe-js";
import { StripeCardElementOptions } from "@stripe/stripe-js";

const CARD_ELEMENT_OPTIONS: StripeCardElementOptions = {
    style: {
        base: {
            color: "white",
            fontFamily: '"Readex Pro", sans-serif',
            fontSmoothing: "antialiased",
            fontSize: "16px",
            "::placeholder": {
                color: "#aab7c4",
            },
        },
        invalid: {
            color: "#fa755a",
            iconColor: "#fa755a",
        },
    },
};

// Straight from https://stripe.com/docs/payments/accept-a-payment-charges?platform=web#add-and-configure-a-component
export default function CardSection() {
    return (
        <label>
            Card details
            <CardElement options={CARD_ELEMENT_OPTIONS} />
        </label>
    );
}
