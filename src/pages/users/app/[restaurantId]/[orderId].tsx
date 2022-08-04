import { DefaultProps, CheckoutCartItem, Feedback } from "../../../../app/okra";
import { Navbar } from "../../../../components/Navbar";
import { GetServerSideProps } from "next";
import { formatPrice, isNumber } from "../../../../app/primitive";
import { prisma } from "../../../../app/prisma";
import { UserJWT } from "../../../../app/userjwt";
import { Restaurant, User } from "@prisma/client";
import { DisplayUser } from "../../../../components/DisplayUser";
import styles from "../../../../styles/FinishOrder.module.css";
import FeedbackForm from "../../../../components/FeedbackForm";
import { fetcher } from "../../../../app/fetch";
import toast from "react-hot-toast";

interface Props {
    user: User;
    restaurant: Restaurant;
    items: CheckoutCartItem[];
    itemCount: number;
    note: string;
    total: number;
}

export default function FinishOrder(props: Props & DefaultProps) {
    function submitFeedback(val: Feedback) {
        toast.promise(
            fetcher("POST", `/restaurants/reviews`, {
                description: val.text,
                rating: val.starCount,
                restaurantId: props.restaurant.id,
            }),
            {
                loading: "Submitting feedback",
                success: "Sent your feedback!",
                error: (e) => e.message || "Something went wrong!",
            }
        );
    }

    return (
        <div className={props.main}>
            <header>
                <Navbar>
                    <DisplayUser user={props.user} />
                </Navbar>
            </header>
            <div className={styles.main}>
                <div>
                    <h1 className="highlight">Thank you for your order!</h1>
                    <h2>
                        Your order is being prepared, please email{" "}
                        {props.restaurant.email} if you have an problems
                    </h2>
                    <h2 className={styles.summary}>
                        Your order summary ({props.itemCount})
                    </h2>
                    <div className={styles.items}>
                        {props.items.map((it) => (
                            <div key={it.id}>
                                {it.quantity}x {it.name} (
                                {formatPrice(it.price * it.quantity)})
                            </div>
                        ))}
                    </div>
                    {props.note && (
                        <p className={styles.note}>
                            Your note to the restaurant: {props.note}
                        </p>
                    )}
                    <span>
                        Delivery Fee:{" "}
                        {formatPrice(props.restaurant.deliveryFee)}
                    </span>
                    <br />
                    <span className={styles.total}>
                        Total: {formatPrice(props.total)}
                    </span>
                    <div className={styles.form}>
                        <FeedbackForm onSubmit={submitFeedback} />
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

    const order = await prisma.order.findFirst({
        where: { id: ctx.params.orderId as string },
        include: {
            items: true,
        },
    });

    if (!order) return { notFound: true };

    let total = 0;

    // Let's map some items
    const tempItems: CheckoutCartItem[] = [];

    for (let i = 0; i < order.items.length; i++) {
        const item = order.items[i];
        const menuItem = restaurant.menu.find((it) => it.id === item.itemId);

        if (!menuItem) continue;

        total += item.quantity * menuItem.price;

        tempItems.push({
            ...menuItem,
            quantity: item.quantity,
        });
    }

    total += restaurant.deliveryFee;

    return {
        props: {
            restaurant,
            user: fullUser,
            order: order,
            items: tempItems,
            itemCount: order.items.length,
            note: order.note,
            total,
        },
    };
};
