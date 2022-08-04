import React, { FormEvent } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import styles from "../styles/CheckoutForm.module.css";
import CardSection from "./CardSection";
import { stripeTokenHandler } from "../app/stripe";
import toast from "react-hot-toast";
import { toastStyle } from "../app/constants";
import { CartItem } from "../app/okra";
import { formatPrice } from "../app/primitive";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

interface Props {
    restaurantId: number;
    userId: number;
    note?: string;
    items: CartItem[];
    total: number;
}

export default function CheckoutForm(props: Props) {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();

    const [disabled, setDisabled] = useState(true);

    useEffect(() => {
        if (!stripe) {
            setDisabled(true);
        }

        setDisabled(false);
    }, [stripe]);

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

        if (result.error) {
            // Show error to your customer.
            toast.error(result.error.message || "Something went wrong", {
                style: toastStyle,
            });
        } else {
            setDisabled(true);

            // Send the token to your server.
            stripeTokenHandler(
                result.token,
                props.restaurantId,
                props.note,
                props.userId,
                props.items
            ).then((res: any) => {
                setDisabled(false);
                router.push(`/users/app/${props.restaurantId}/${res.id}`);
            });
        }
    }

    return (
        <form onSubmit={handleSubmit} className={styles.main}>
            <CardSection />
            <div className={styles.action}>
                <span>Your total today is {formatPrice(props.total)}</span>
                <button disabled={disabled}>Pay</button>
            </div>
        </form>
    );
}
