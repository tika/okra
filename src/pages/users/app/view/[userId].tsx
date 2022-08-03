import { User } from "@prisma/client";
import { DefaultProps, ReviewWithRestaurant } from "../../../../app/okra";
import { DisplayUser } from "../../../../components/DisplayUser";
import { Navbar } from "../../../../components/Navbar";
import { ViewReview } from "../../../../components/ViewReview";
import { GetServerSideProps } from "next";
import { UserJWT } from "../../../../app/userjwt";
import { prisma } from "../../../../app/prisma";
import { isNumber } from "../../../../app/primitive";
import styles from "../../../../styles/ViewUser.module.css";

interface Props {
    user: User;
    reviews: ReviewWithRestaurant[];
    me: User;
}

export default function UserProfile(props: Props & DefaultProps) {
    return (
        <div className={props.main}>
            <header>
                <Navbar>
                    <DisplayUser user={props.me} />
                </Navbar>
            </header>
            <main className={styles.main}>
                <div>
                    <DisplayUser disabled user={props.user} />

                    <h1>Recent reviews</h1>
                    <div>
                        {props.reviews.map((it) => (
                            <ViewReview data={it} />
                        ))}
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

    if (!ctx.params || !isNumber(ctx.params.userId as string))
        return { notFound: true };

    const otherUser = await prisma.user.findFirst({
        where: { id: Number(ctx.params.userId) },
        include: {
            reviews: {
                include: {
                    restaurant: true,
                },
            },
        },
    });

    if (!otherUser) return { notFound: true };

    const tempArr: ReviewWithRestaurant[] = [];

    for (let i = 0; i < otherUser.reviews.length; i++) {
        const { restaurant, ...rest } = otherUser.reviews[i];

        tempArr.push({
            ...rest,
            restaurantLogo: restaurant.logo,
            restaurantName: restaurant.name,
        });
    }

    return {
        props: {
            me: fullUser,
            user: otherUser,
            reviews: tempArr,
        },
    };
};
