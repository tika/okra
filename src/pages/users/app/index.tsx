import { Restaurant, User } from "@prisma/client";
import { GetServerSideProps } from "next";
import { UserJWT } from "../../../app/userjwt";
import { DefaultProps, Distance } from "../../../app/okra";
import { Navbar } from "../../../components/Navbar";
import { prisma } from "../../../app/prisma";
import { DisplayUser } from "../../../components/DisplayUser";
import styles from "../../../styles/UserApp.module.css";
import Image from "next/image";
import { LocationMarkerIcon, ShoppingCartIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";
import { millisToMins, secondsToMins } from "../../../app/primitive";
import { calcDistance } from "../../../app/maps";

interface Props {
    user: User;
    restaurants: (Restaurant & {
        distanceFromUser: Distance;
        latestTime: number;
    })[];
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
                    <h2 className="highlight">Find food in seconds.</h2>
                </div>
                <div>
                    <h6>
                        Restaurants sorted by distance (
                        {props.restaurants.length} result
                        {props.restaurants.length > 1 && "s"})
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
                                        <span>
                                            {secondsToMins(
                                                it.distanceFromUser.time
                                            )}{" "}
                                            away
                                        </span>
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

    // Calc distance from this restaurant to the user
    const a = {
        line1: fullUser.address1,
        line2: fullUser.address2,
        city: fullUser.city,
        postcode: fullUser.postcode,
    };

    const temp: (Restaurant & {
        distanceFromUser: Distance;
        latestTime: number;
    })[] = [];

    for (let i = 0; i < restaurants.length; i++) {
        const { orders, ...rest } = restaurants[i];
        const completedAt = orders[0].completedAt?.getTime();

        const distance = await calcDistance(a, {
            line1: rest.address1,
            line2: rest.address2,
            city: rest.city,
            postcode: rest.postcode,
        });

        // something's really wrong
        if (distance === null) {
            return {
                notFound: true,
            };
        }

        temp.push({
            ...rest,
            latestTime:
                (completedAt && completedAt - orders[0].createdAt.getTime()) ??
                -1,
            distanceFromUser: distance,
        });
    }

    return {
        props: {
            user: fullUser,
            restaurants: temp.sort(
                (a, b) => a.distanceFromUser.meters - b.distanceFromUser.meters
            ),
        },
    };
};
