import { Restaurant } from "@prisma/client";
import { GetServerSideProps } from "next";
import { RestaurantJWT } from "../../../app/restaurantjwt";
import { BaseItem, DefaultProps } from "../../../app/okra";
import { Navbar } from "../../../components/Navbar";
import { prisma } from "../../../app/prisma";
import { DisplayRestaurant } from "../../../components/DisplayRestaurant";
import { MenuItemEdit } from "../../../components/MenuItemEdit";
import { useRouter } from "next/router";
import { fetcher } from "../../../app/fetch";
import toast from "react-hot-toast";
import { toastStyle } from "../../../app/constants";
import styles from "../../../styles/RestaurantMenu.module.css";
import Link from "next/link";

interface Props {
    restaurant: Restaurant;
    menu: BaseItem[];
}

export default function App(props: Props & DefaultProps) {
    const router = useRouter();

    // When this function is called, we want to take the values of the item provided
    function edit(newItem: BaseItem) {
        console.log(newItem);
        async function actions() {
            await fetcher("POST", "/restaurants/menu", {
                item: newItem,
            });
            await router.push("/restaurants/app/menu");
        }

        toast.promise(
            actions(),
            {
                loading: "Loading...",
                success: <b>Updated menu</b>,
                error: (e) => e.message || <b>Something went wrong</b>,
            },
            { style: toastStyle }
        );
    }

    function onDelete(id: number) {
        async function actions() {
            await fetcher("DELETE", "/restaurants/menu", {
                id,
            });
            await router.push("/restaurants/app/menu");
        }

        toast.promise(
            actions(),
            {
                loading: "Loading...",
                success: <b>Deleted item</b>,
                error: (e) => e.message || <b>Something went wrong</b>,
            },
            { style: toastStyle }
        );
    }

    return (
        <div className={props.main}>
            <header>
                <Navbar>
                    <Link href="/restaurants/app/menu">Menu</Link>
                    <Link href="/restaurants/app/orders">Orders</Link>
                    <DisplayRestaurant restaurant={props.restaurant} />
                </Navbar>
            </header>

            <main className={styles.main}>
                <div className={styles.container}>
                    <h1>Menu Items</h1>
                    <h2>
                        View items that are on your menu, and add new ones at
                        the bottom
                    </h2>
                    <div className={styles.items}>
                        {props.menu.map((it, i) => (
                            <div className={styles.item} key={i}>
                                <span>Item #{i + 1}</span>
                                <MenuItemEdit
                                    item={it}
                                    action={edit}
                                    onDelete={onDelete}
                                />
                            </div>
                        ))}
                    </div>
                    <hr className={styles.divide} />
                    <div>
                        <h2 className={styles.newItem}>New item</h2>
                        <MenuItemEdit shouldClear action={edit} />
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
        include: { menu: true },
    });

    if (!fullRestaurant) {
        return {
            redirect: {
                destination: "/restaurants/login",
                permanent: false,
            },
        };
    }

    // Convert to base item
    const items: BaseItem[] = [];

    fullRestaurant.menu.forEach((item) => {
        const { restaurantId, ...rest } = item;
        items.push(rest);
    });

    return {
        props: {
            restaurant: fullRestaurant,
            menu: items,
        },
    };
};
