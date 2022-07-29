import { Item, Restaurant, User } from "@prisma/client";
import { GetServerSideProps } from "next";
import { UserJWT } from "../../../app/userjwt";
import { DefaultProps } from "../../../app/okra";
import { Navbar } from "../../../components/Navbar";
import { prisma } from "../../../app/prisma";
import { DisplayUser } from "../../../components/DisplayUser";
import styles from "../../../styles/ViewRestaurant.module.css";
import { isNumber } from "../../../app/number";
import {
    LocationMarkerIcon,
    ShoppingCartIcon,
    StarIcon,
} from "@heroicons/react/outline";

interface Props {
    user: User;
    restaurant: Restaurant;
    menu: Item[];
    reviewCount: number;
    starAverage: number;
}

export default function ViewRestaurant(props: Props & DefaultProps) {
    return (
        <div className={props.main}>
            <header>
                <Navbar>
                    <a className={styles.cart}>
                        <ShoppingCartIcon width="1.5em" height="100%" />
                        <span>Cart • 0</span>
                    </a>
                    <DisplayUser user={props.user} />
                </Navbar>
            </header>
            <main>
                <div>
                    <h1>{props.restaurant.name}</h1>
                    <h2>
                        <span>CLOSED</span> Opens at 16:30 - 21:00
                    </h2>
                    <div className={styles.info}>
                        <div>
                            <StarIcon />
                            <span>
                                {props.starAverage} stars • {props.reviewCount}{" "}
                                reviews
                            </span>
                        </div>
                        <div>
                            <LocationMarkerIcon />
                            <span>0.22 miles away</span>
                        </div>
                        <div>
                            <ShoppingCartIcon />
                            <span>Last order completed at</span>
                        </div>
                        <div>
                            <ShoppingCartIcon />
                            <span>
                                Min. order £{props.restaurant.minOrderAmount}
                            </span>
                        </div>
                    </div>
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
            reviews: true,
        },
    });

    if (!restaurant) return { notFound: true };

    const avg = await prisma.review.aggregate({
        _avg: {
            rating: true,
        },
        where: {
            restaurantId: restaurant.id,
        },
    });

    if (!avg) return { notFound: true };

    return {
        props: {
            user: fullUser,
            restaurant: restaurant,
            menu: restaurant.menu,
            reviewCount: restaurant.reviews.length,
            starAverage: avg._avg.rating || 4,
        },
    };
};
