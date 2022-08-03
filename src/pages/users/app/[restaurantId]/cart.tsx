import { DefaultProps, CheckoutCartItem } from "../../../../app/okra";
import { useEffect, useState } from "react";
import { Cart } from "../../../../app/cart";
import { Navbar } from "../../../../components/Navbar";
import { GetServerSideProps } from "next";
import { formatPrice, isNumber } from "../../../../app/primitive";
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

interface Props {
    user: User;
    restaurant: Restaurant;
    menu: Item[];
    lastOrderCompletedAt: Date | null;
}

export default function CartPage(props: Props & DefaultProps) {
    const [items, setItems] = useState<CheckoutCartItem[]>([]);
    const [total, setTotal] = useState(0);
    const [note, setNote] = useState<string | null>(null);

    const router = useRouter();

    // Set cart
    useEffect(() => {
        // setCart(new Cart(props.restaurant.id));
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
                amount: cartItems[i].amount,
                ...menuItem,
            });

            tempTotal += cartItems[i].amount * menuItem.price;
        }

        setItems(temp);
        setTotal(tempTotal);
    }, []);

    return (
        <div className={props.main}>
            <header>
                <Navbar>
                    <DisplayUser user={props.user} />
                </Navbar>
            </header>
            <div className={styles.main}>
                <div>
                    <div></div>
                    <a
                        href={`/users/app/${props.restaurant.id}`}
                        className={styles.return}
                    >
                        <ArrowLeftIcon />
                        <span>Return to menu</span>
                    </a>
                    <div className={styles.top}>
                        <h1>Your Cart at {props.restaurant.name}</h1>
                        <div className={styles.info}>
                            <div>
                                <ShoppingCartIcon />
                                <span>
                                    {props.lastOrderCompletedAt
                                        ? `Last order completed at
                                ${props.lastOrderCompletedAt.toString()}`
                                        : "No orders yet"}
                                </span>
                            </div>
                            <div>
                                <LocationMarkerIcon />
                                <span>0.22 miles away • 2 mins away</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.items}>
                        {items.map((it) => (
                            <div className={styles.item}>
                                <h1>
                                    {it.amount}x {it.name}
                                </h1>
                                <span>{formatPrice(it.amount * it.price)}</span>
                            </div>
                        ))}

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
                                    `/users/app/${props.restaurant.id}/checkout`
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

    return {
        props: {
            restaurant,
            user: fullUser,
            menu: restaurant.menu,
            lastOrderCompletedAt: lastOrder ? lastOrder.completedAt : null,
        },
    };
};
