import { DefaultProps, CheckoutCartItem, Distance } from "../../../../app/okra";
import { useEffect, useState } from "react";
import { Cart } from "../../../../app/cart";
import { Navbar } from "../../../../components/Navbar";
import { GetServerSideProps } from "next";
import {
    convertDate,
    convertTime,
    formatPrice,
    isNumber,
    mToKm,
    secondsToMins,
} from "../../../../app/primitive";
import { prisma } from "../../../../app/prisma";
import { UserJWT } from "../../../../app/userjwt";
import { Item, Restaurant, User } from "@prisma/client";
import { DisplayUser } from "../../../../components/DisplayUser";
import {
    ArrowLeftIcon,
    ExclamationIcon,
    LocationMarkerIcon,
    PlusIcon,
    ShoppingCartIcon,
} from "@heroicons/react/outline";
import styles from "../../../../styles/Cart.module.css";
import { FormInput } from "../../../../components/FormInput";
import { useRouter } from "next/router";
import Link from "next/link";
import { calcDistance } from "../../../../app/maps";

interface Props {
    user: User;
    restaurant: Restaurant;
    menu: Item[];
    lastOrderCompletedAt: Date | null;
    distanceFromUser: Distance;
}

export default function CartPage(props: Props & DefaultProps) {
    const [items, setItems] = useState<CheckoutCartItem[]>([]);
    const [total, setTotal] = useState(0);
    const [note, setNote] = useState<string | null>(null);

    const router = useRouter();

    // Set cart
    useEffect(() => {
        const cart = new Cart(props.restaurant.id);
        const cartItems = cart.get();
        const temp = [];
        let tempTotal = 0;

        for (let i = 0; i < cartItems.length; i++) {
            const menuItem = props.menu.find(
                (it) => it.id === cartItems[i].itemId
            );

            if (!menuItem) continue;

            temp.push({
                quantity: cartItems[i].quantity,
                ...menuItem,
            });

            tempTotal += cartItems[i].quantity * menuItem.price;
        }

        tempTotal += props.restaurant.deliveryFee;

        setItems(temp);
        setTotal(tempTotal);
    }, [props.menu, props.restaurant.id]);

    return (
        <div className={props.main}>
            <header>
                <Navbar>
                    <DisplayUser user={props.user} />
                </Navbar>
            </header>
            <div className={styles.main}>
                <div>
                    <div className={styles.top}>
                        <Link href={`/users/app/${props.restaurant.id}`}>
                            <span className={styles.return}>
                                <ArrowLeftIcon />
                                Return to menu
                            </span>
                        </Link>
                        <h1>Your Cart at {props.restaurant.name}</h1>
                        <div className={styles.info}>
                            <div>
                                <ShoppingCartIcon />
                                <span>
                                    {props.lastOrderCompletedAt
                                        ? `Last order completed at
                                ${convertDate(
                                    props.lastOrderCompletedAt
                                )} • ${convertTime(props.lastOrderCompletedAt)}`
                                        : "No orders yet"}
                                </span>
                            </div>
                            <div>
                                <LocationMarkerIcon />
                                <span>
                                    {mToKm(props.distanceFromUser.meters)} •{" "}
                                    {secondsToMins(props.distanceFromUser.time)}{" "}
                                    away
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.items}>
                        {items.map((it) => (
                            <div className={styles.item} key={it.id}>
                                <h1>
                                    {it.quantity}x {it.name}
                                </h1>
                                <span>
                                    {formatPrice(it.quantity * it.price)}
                                </span>
                            </div>
                        ))}

                        <span>
                            Delivery fee:{" "}
                            {formatPrice(props.restaurant.deliveryFee)}
                        </span>

                        {note === null ? (
                            <div
                                className={styles.orderNote}
                                onClick={() => setNote("")}
                            >
                                <div>
                                    <h2>Add order note</h2>
                                    <h3>Customized note to restaurant</h3>
                                </div>
                                <PlusIcon />
                            </div>
                        ) : (
                            <FormInput
                                className={styles.input}
                                title="Note"
                                value={note}
                                onInput={(val) => setNote(val)}
                                placeholder="e.g. Gluten Free"
                                type="text"
                            />
                        )}
                    </div>

                    <div className={styles.bottom}>
                        {total < props.restaurant.minOrderAmount && (
                            <div className={styles.minOrder}>
                                <div>
                                    <ExclamationIcon />
                                    <span>Adjust cart to place order</span>
                                </div>
                                <span>
                                    You are{" "}
                                    {formatPrice(
                                        props.restaurant.minOrderAmount - total
                                    )}{" "}
                                    away from the minimum order amount
                                </span>
                            </div>
                        )}

                        <button
                            onClick={() =>
                                router.push(
                                    `/users/app/${
                                        props.restaurant.id
                                    }/checkout${note ? "?note=" + note : ""}`
                                )
                            }
                            disabled={total < props.restaurant.minOrderAmount}
                        >
                            Go to checkout • {formatPrice(total)}
                        </button>
                    </div>
                </div>
            </div>
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

    // When was the last order completed at?
    // Well, we sort all of the orders in desc order, and get the first one
    const lastOrder = await prisma.order.findFirst({
        orderBy: {
            completedAt: "desc",
        },
    });

    // distance from user
    const a = {
        line1: fullUser.address1,
        line2: fullUser.address2,
        city: fullUser.city,
        postcode: fullUser.postcode,
    };

    const b = {
        line1: restaurant.address1,
        line2: restaurant.address2,
        city: restaurant.city,
        postcode: restaurant.postcode,
    };

    const distance = await calcDistance(a, b);

    if (!distance) return { notFound: true };

    return {
        props: {
            restaurant,
            user: fullUser,
            menu: restaurant.menu,
            lastOrderCompletedAt: lastOrder ? lastOrder.completedAt : null,
            distanceFromUser: distance,
        },
    };
};
