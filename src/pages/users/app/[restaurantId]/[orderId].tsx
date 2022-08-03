import { DefaultProps, CheckoutCartItem } from "../../../../app/okra";
import { Navbar } from "../../../../components/Navbar";
import { GetServerSideProps } from "next";
import { isNumber } from "../../../../app/primitive";
import { prisma } from "../../../../app/prisma";
import { UserJWT } from "../../../../app/userjwt";
import { Restaurant, User } from "@prisma/client";
import { DisplayUser } from "../../../../components/DisplayUser";
import styles from "../../../../styles/FinishOrder.module.css";

interface Props {
    user: User;
    restaurant: Restaurant;
    items: CheckoutCartItem[];
    itemCount: number;
}

export default function CartPage(props: Props & DefaultProps) {
    return (
        <div className={props.main}>
            <header>
                <Navbar>
                    <DisplayUser user={props.user} />
                </Navbar>
            </header>
            <div className={styles.main}>
                <h1 className="highlight">Thank you for your order!</h1>
                <h2>
                    Your order is being prepared, please email{" "}
                    {props.restaurant.email} if you have an problems
                </h2>
                <h2>Your order summary ({props.itemCount})</h2>
                <div>
                    {props.items.map((it) => (
                        <div key={it.id}>
                            {it.amount}x {it.name}
                        </div>
                    ))}
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
    });

    if (!restaurant) return { notFound: true };

    const order = await prisma.order.findFirst({
        where: { id: ctx.params.orderId as string },
        include: {
            items: true,
        },
    });

    if (!order) return { notFound: true };

    // Collect items
    const items: CheckoutCartItem[] = [];

    for (let i = 0; i < order.items.length; i++) {
        const itemInOrder = order.items[i];

        let index = -1;

        // Finds the item in items that is equal to this
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.id === itemInOrder.id) index = i;
        }

        if (index !== -1) {
            items[i].amount += 1;
        } else {
            items.push({
                ...itemInOrder,
                amount: 1,
            });
        }
    }

    return {
        props: {
            restaurant,
            user: fullUser,
            order: order,
            items,
            itemCount: order.items.length,
        },
    };
};
