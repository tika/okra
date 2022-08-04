import { Restaurant, Review, User } from "@prisma/client";
import { GetServerSideProps } from "next";
import { RestaurantJWT } from "../../../app/restaurantjwt";
import { DefaultProps, OrderWithUser } from "../../../app/okra";
import { Navbar } from "../../../components/Navbar";
import { prisma } from "../../../app/prisma";
import { DisplayRestaurant } from "../../../components/DisplayRestaurant";
import styles from "../../../styles/RestaurantApp.module.css";
import { ViewReview } from "../../../components/ViewReview";
import { ViewOrder } from "../../../components/ViewOrder";

interface Props {
    restaurant: Restaurant;
    orders: {
        total: number;
        order: OrderWithUser;
    }[];
    reviews: (Review & {
        user: User;
    })[];
}

export default function App(props: Props & DefaultProps) {
    return (
        <div className={props.main}>
            <header>
                <Navbar>
                    <a href="/restaurants/app/menu">Menu</a>
                    <a href="/restaurants/app/orders">Orders</a>
                    <DisplayRestaurant restaurant={props.restaurant} />
                </Navbar>
            </header>

            <main>
                <div className={styles.columns}>
                    <div className={styles.reviews}>
                        <h1>Reviews</h1>
                        <div>
                            {props.reviews.map((it) => (
                                <ViewReview
                                    data={it}
                                    key={it.id}
                                    user={it.user}
                                />
                            ))}
                        </div>
                    </div>
                    <div className={styles.orders}>
                        <h1>Recent orders</h1>
                        <div>
                            {props.orders
                                .filter((it) => it.order.completedAt === null)
                                .map((it) => (
                                    <ViewOrder
                                        order={it.order}
                                        total={it.total}
                                        key={it.order.id}
                                        displayComplete
                                    />
                                ))}
                            <hr />
                            {props.orders
                                .filter((it) => it.order.completedAt !== null)
                                .map((it) => (
                                    <ViewOrder
                                        order={it.order}
                                        total={it.total}
                                        key={it.order.id}
                                        displayComplete
                                    />
                                ))}
                        </div>
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
            reviews: {
                include: {
                    user: true,
                },
            },
            orders: {
                include: {
                    user: true,
                    items: {
                        include: {
                            item: true,
                        },
                    },
                },
                orderBy: {
                    completedAt: "desc",
                },
                take: 15,
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
            reviews: fullRestaurant.reviews,
        },
    };
};
