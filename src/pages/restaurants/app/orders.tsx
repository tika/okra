import { Restaurant } from "@prisma/client";
import { GetServerSideProps } from "next";
import { RestaurantJWT } from "../../../app/restaurantjwt";
import { BaseItem, DefaultProps, OrderWithUser } from "../../../app/okra";
import { Navbar } from "../../../components/Navbar";
import { prisma } from "../../../app/prisma";
import { DisplayRestaurant } from "../../../components/DisplayRestaurant";
import styles from "../../../styles/Orders.module.css";
import { ViewOrder } from "../../../components/ViewOrder";

interface Props {
    restaurant: Restaurant;
    orders: {
        total: number;
        order: OrderWithUser;
    }[];
}

export default function Orders(props: Props & DefaultProps) {
    function complete(order: OrderWithUser) {}

    function cancel(order: OrderWithUser) {}

    return (
        <div className={props.main}>
            <header>
                <Navbar>
                    <a href="/restaurants/app/menu">Menu</a>
                    <a href="/restaurants/app/orders">Orders</a>
                    <DisplayRestaurant restaurant={props.restaurant} />
                </Navbar>
            </header>

            <main className={styles.main}>
                <div>
                    <h1>Orders</h1>
                    <h2>Your pending orders</h2>
                    <div>
                        {props.orders
                            .filter((it) => it.order.completedAt === null)
                            .map((it) => (
                                <ViewOrder
                                    order={it.order}
                                    total={it.total}
                                    complete={() => complete(it.order)}
                                    cancel={() => cancel(it.order)}
                                />
                            ))}
                    </div>
                    <hr />
                    <h2>Completed orders</h2>
                    <div>
                        {props.orders
                            .filter((it) => it.order.completedAt !== null)
                            .map((it) => (
                                <ViewOrder order={it.order} total={it.total} />
                            ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
    const restaurant = RestaurantJWT.parseRequest(ctx.req);

    if (!restaurant) {
        return {
            redirect: {
                destination: "/restaurants/login",
                permanent: false,
            },
        };
    }

    const fullRestaurant = await prisma.restaurant.findFirst({
        where: { id: restaurant.id },
        include: {
            orders: {
                include: {
                    user: true,
                    items: {
                        include: {
                            item: true,
                        },
                    },
                },
            },
        },
    });

    if (!fullRestaurant) {
        return {
            redirect: {
                destination: "/restaurants/login",
                permanent: false,
            },
        };
    }

    // work out order totals
    const orderAndTotal = [];

    for (let i = 0; i < fullRestaurant.orders.length; i++) {
        let total = 0;

        fullRestaurant.orders[i].items.forEach((it) => {
            total += it.quantity * it.item.price;
        });

        orderAndTotal.push({
            total,
            order: fullRestaurant.orders[i],
        });
    }

    return {
        props: {
            restaurant: fullRestaurant,
            orders: orderAndTotal,
        },
    };
};
