import { Item, Restaurant, User } from "@prisma/client";
import { Elements } from "@stripe/react-stripe-js";
import { DefaultProps } from "../../../../app/okra";
import { stripePromise } from "../../../../app/stripe";
import CheckoutForm from "../../../../components/CheckoutForm";
import { DisplayUser } from "../../../../components/DisplayUser";
import { Navbar } from "../../../../components/Navbar";
import { GetServerSideProps } from "next";
import { UserJWT } from "../../../../app/userjwt";
import { prisma } from "../../../../app/prisma";
import { isNumber } from "../../../../app/primitive";
import { Cart } from "../../../../app/cart";
import { useEffect, useState } from "react";
import styles from "../../../../styles/Checkout.module.css";

interface Props {
    user: User;
    restaurant: Restaurant;
    note?: string;
    menu: Item[];
}

export default function Checkout(props: DefaultProps & Props) {
    const [cart, setCart] = useState<Cart>();
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const temp = new Cart(props.restaurant.id);
        const cartItems = temp.get();
        let tempTotal = 0;

        for (let i = 0; i < cartItems.length; i++) {
            const menuItem = props.menu.find(
                (it) => it.id === cartItems[i].itemId
            );

            if (!menuItem) continue;

            tempTotal += cartItems[i].quantity * menuItem.price;
        }

        setCart(temp);
        setTotal(tempTotal);
    }, [props.menu, props.restaurant.id]);

    return (
        <div className={props.main}>
            <header>
                <title>Checkout</title>
                <Navbar>
                    <DisplayUser user={props.user} />
                </Navbar>
            </header>
            <main className={styles.main}>
                <div>
                    <h1>Checkout</h1>
                    <h2>
                        Secured using Stripe, make your payment for your order
                        now.
                    </h2>
                    {cart && (
                        <Elements stripe={stripePromise}>
                            <CheckoutForm
                                note={props.note}
                                userId={props.user.id}
                                restaurantId={props.restaurant.id}
                                items={cart.get()}
                                total={total}
                            />
                        </Elements>
                    )}
                </div>
            </main>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
    const user = UserJWT.parseRequest(ctx.req);

    if (!user) {
        return {
            redirect: {
                destination: "/users/login",
                permanent: false,
            },
        };
    }

    const fullUser = await prisma.user.findFirst({ where: { id: user.id } });

    if (!fullUser) {
        return {
            redirect: {
                destination: "/users/login",
                permanent: false,
            },
        };
    }

    if (!ctx.params || !isNumber(ctx.params.restaurantId as string))
        return { notFound: true };

    const restaurant = await prisma.restaurant.findFirst({
        where: { id: Number(ctx.params.restaurantId) },
        include: {
            menu: true,
        },
    });

    if (!restaurant) return { notFound: true };

    const note = ctx.query.note;

    return {
        props: {
            restaurant,
            user: fullUser,
            note: note as string,
            menu: restaurant.menu,
        },
    };
};
