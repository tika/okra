import { Restaurant, User } from "@prisma/client";
import { GetServerSideProps } from "next";
import { UserJWT } from "../../../app/userjwt";
import { DefaultProps } from "../../../app/okra";
import { Navbar } from "../../../components/Navbar";
import { prisma } from "../../../app/prisma";
import { DisplayUser } from "../../../components/DisplayUser";
import styles from "../../../styles/UserApp.module.css";
import Image from "next/image";
import { LocationMarkerIcon, ShoppingCartIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";
import { formatTimeBetween, millisToMins } from "../../../app/primitive";

interface Props {
    user: User;
    restaurants: (Restaurant & { latestTime: number })[];
}

export default function App(props: Props & DefaultProps) {
    const router = useRouter();

    return (
        <div className={props.main}>
            <header>
                <Navbar>
                    <DisplayUser user={props.user} />
                </Navbar>
            </header>
            <main className={styles.center}>
                <div>
                    <h1>Your hunger stops here.</h1>
                    <h2>Find food in seconds.</h2>
                </div>
                <div>
                    <h6>
                        Restaurants near {props.user.city} (
                        {props.restaurants.length} results)
                    </h6>
                    <div className={styles.restaurants}>
                        {props.restaurants.map((it) => (
                            <div
                                key={it.id}
                                className={styles.restaurant}
                                onClick={() =>
                                    router.push(`/users/app/${it.id}`)
                                }
                            >
                                <div className={styles.img}>
                                    <Image
                                        key={it.id}
                                        src={it.logo}
                                        layout="fill"
                                        alt={"Logo of " + it.name}
                                    />
                                </div>
                                <div className={styles.padding}>
                                    <div className={styles.details}>
                                        <h1>{it.name}</h1>
                                        <h2>{it.description}</h2>
                                    </div>
                                    <div className={styles.info}>
                                        <LocationMarkerIcon
                                            stroke="var(--okra-green)"
                                            height="2em"
                                            width="2em"
                                        />
                                        <span>6 miles away</span> {/*TODO*/}
                                    </div>
                                    <div className={styles.info}>
                                        <ShoppingCartIcon
                                            stroke="var(--okra-green)"
                                            height="2em"
                                            width="2em"
                                        />
                                        <span>
                                            {it.latestTime === -1
                                                ? "No orders yet"
                                                : `Last order took
                                             ${millisToMins(it.latestTime)}`}
                                        </span>
                                    </div>
                                </div>
                            </div>
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

    // Find restaurants
    const restaurants = await prisma.restaurant.findMany({
        where: {
            city: {
                equals: fullUser.city,
            },
        },
        include: {
            orders: {
                take: 1,
                where: {
                    completedAt: {
                        not: null,
                    },
                },
                orderBy: {
                    completedAt: "desc",
                },
            },
        },
    });

    const temp = [];

    for (let i = 0; i < restaurants.length; i++) {
        const { orders, ...rest } = restaurants[i];
        const completedAt = orders[0].completedAt?.getTime();

        temp.push({
            ...rest,
            latestTime:
                (completedAt && completedAt - orders[0].createdAt.getTime()) ??
                -1,
        });
    }

    return {
        props: {
            user: fullUser,
            restaurants: temp,
        },
    };
};
