import { DefaultProps } from "../../../../app/okra";
import { Navbar } from "../../../../components/Navbar";
import { GetServerSideProps } from "next";
import { isNumber } from "../../../../app/primitive";
import { prisma } from "../../../../app/prisma";
import { UserJWT } from "../../../../app/userjwt";
import { Restaurant, Review, User } from "@prisma/client";
import { DisplayUser } from "../../../../components/DisplayUser";
import styles from "../../../../styles/Reviews.module.css";
import { DisplayRestaurant } from "../../../../components/DisplayRestaurant";
import { ViewReview } from "../../../../components/ViewReview";

interface Props {
    user: User;
    restaurant: Restaurant;
    reviews: (Review & {
        user: User;
    })[];
}

export default function FinishOrder(props: Props & DefaultProps) {
    return (
        <div className={props.main}>
            <header>
                <Navbar>
                    <DisplayUser user={props.user} />
                </Navbar>
            </header>
            <div className={styles.main}>
                <div>
                    <DisplayRestaurant
                        dest={`/users/app/${props.restaurant.id}`}
                        restaurant={props.restaurant}
                    />
                    <h1>Reviews</h1>
                    <h2>
                        {props.reviews.length} reviews from paying customers
                    </h2>
                    <div>
                        {props.reviews.map((it) => (
                            <ViewReview user={it.user} data={it} />
                        ))}
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
            reviews: {
                include: {
                    user: true,
                },
            },
        },
    });

    if (!restaurant) return { notFound: true };

    return {
        props: {
            restaurant,
            user: fullUser,
            reviews: restaurant.reviews,
        },
    };
};
