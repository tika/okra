import { Item, Restaurant, User } from "@prisma/client";
import { GetServerSideProps } from "next";
import { UserJWT } from "../../../../app/userjwt";
import { DefaultProps, Distance } from "../../../../app/okra";
import { Navbar } from "../../../../components/Navbar";
import { prisma } from "../../../../app/prisma";
import { DisplayUser } from "../../../../components/DisplayUser";
import styles from "../../../../styles/ViewRestaurant.module.css";
import {
    isNumber,
    capitalise,
    millisToMins,
    mToKm,
    secondsToMins,
} from "../../../../app/primitive";
import {
    CurrencyPoundIcon,
    LocationMarkerIcon,
    SearchIcon,
    ShoppingCartIcon,
    StarIcon,
    TruckIcon,
} from "@heroicons/react/outline";
import { MenuItem } from "../../../../components/MenuItem";
import { useEffect, useState } from "react";
import { AddItemModal } from "../../../../components/AddItemModal";
import { Cart } from "../../../../app/cart";
import toast from "react-hot-toast";
import { calcDistance } from "../../../../app/maps";

interface Props {
    user: User;
    restaurant: Restaurant;
    menu: Item[];
    reviewCount: number;
    starAverage: number;
    lastOrderTook: number;
    distanceFromUser: Distance;
}

export default function ViewRestaurant(props: Props & DefaultProps) {
    const [itemsShown, setItemsShown] = useState(props.menu);
    const [categoriesShown, setCategoriesShown] = useState(getCategories());
    const [viewItem, setViewItem] = useState<Item | undefined>(); // TODO: better name
    const [cart, setCart] = useState<Cart>();

    // This is silly, but because of a Hydration warning, we must first wait for the entire window to mount before using localstorage.
    useEffect(() => {
        setCart(new Cart(props.restaurant.id));
    }, [props.restaurant.id]);

    // Gets categories from the items shown
    function getCategories() {
        return Array.from(
            new Set(itemsShown.map((it) => capitalise(it.category)))
        );
    }

    // Matches name
    function onSearch(val: string) {
        if (val === "") return setItemsShown(props.menu);

        setItemsShown(
            props.menu.filter((it) =>
                it.name.toLowerCase().includes(val.toLowerCase())
            )
        );

        setCategoriesShown(getCategories());
    }

    function itemChange(amount: number) {
        // Something's gone wrong
        if (!viewItem || !cart) return;

        // Then we want to remove item from
        if (amount === 0) {
            cart.remove(viewItem.id);

            // Close this window, and update UI
            toast(`Removed ${viewItem.name} from cart`);
        } else {
            cart.add(viewItem, amount);

            toast(`Added ${viewItem.name} to cart`);
        }

        setViewItem(undefined);
    }

    return (
        <div className={props.main}>
            <header>
                <title>{props.restaurant.name}</title>
                <Navbar>
                    <a
                        className={styles.cart}
                        href={`/users/app/${props.restaurant.id}/cart`}
                    >
                        <ShoppingCartIcon width="1.5em" height="100%" />
                        <span>Cart • {cart?.get().length ?? 0}</span>
                    </a>
                    <DisplayUser user={props.user} />
                </Navbar>
            </header>
            <main className={styles.main}>
                <AddItemModal
                    item={viewItem}
                    amount={
                        cart?.get().find((it) => it.itemId === viewItem?.id)
                            ?.quantity ?? 0
                    }
                    close={() => setViewItem(undefined)}
                    change={itemChange}
                />
                <div className={styles.sidebar}>
                    <h1>{props.restaurant.name}</h1>
                    <div className={styles.info}>
                        <div>
                            <StarIcon />
                            <span>
                                {props.starAverage} stars •{" "}
                                <a
                                    href={`/users/app/${props.restaurant.id}/reviews`}
                                >
                                    {props.reviewCount} reviews
                                </a>
                            </span>
                        </div>
                        <div>
                            <LocationMarkerIcon />
                            <span>
                                {mToKm(props.distanceFromUser.meters)} •{" "}
                                {secondsToMins(props.distanceFromUser.time)}{" "}
                                away
                            </span>
                        </div>
                        <div>
                            <ShoppingCartIcon />
                            <span>
                                {props.lastOrderTook === -1
                                    ? "No orders yet"
                                    : `Last order took ${millisToMins(
                                          props.lastOrderTook
                                      )}`}
                            </span>
                        </div>
                        <div>
                            <CurrencyPoundIcon />
                            <span>
                                Min. order £{props.restaurant.minOrderAmount}
                            </span>
                        </div>
                        <div>
                            <TruckIcon />
                            <span>
                                Delivery fee £{props.restaurant.deliveryFee}
                            </span>
                        </div>
                    </div>
                    <div className={styles.categories}>
                        {categoriesShown.map((it, i) => (
                            <h3 key={it}>{it}</h3>
                        ))}
                    </div>
                </div>
                <div className={styles.container}>
                    <div className={styles.search}>
                        <SearchIcon height="100%" width="30px" />
                        <input
                            onChange={(e) => onSearch(e.target.value)}
                            placeholder="Search items"
                        />
                    </div>
                    <div className={styles.items}>
                        {categoriesShown.map((it, i) => {
                            const categoryItems = itemsShown.filter(
                                (it2) =>
                                    it2.category.toLowerCase() ===
                                    it.toLowerCase()
                            );

                            return (
                                <div key={i} className={styles.itemsContainer}>
                                    <h2>{capitalise(it)}</h2>
                                    <div>
                                        {categoryItems
                                            .filter((it) => it.image)
                                            .map((item) => (
                                                <MenuItem
                                                    key={item.id}
                                                    onPlus={() =>
                                                        setViewItem(item)
                                                    }
                                                    item={item}
                                                    amount={
                                                        cart
                                                            ?.get()
                                                            .find(
                                                                (it) =>
                                                                    it.itemId ==
                                                                    item.id
                                                            )?.quantity || 0
                                                    }
                                                />
                                            ))}
                                    </div>
                                    <div>
                                        {categoryItems
                                            .filter((it) => !it.image)
                                            .map((item) => (
                                                <MenuItem
                                                    key={item.id}
                                                    onPlus={() =>
                                                        setViewItem(item)
                                                    }
                                                    item={item}
                                                    amount={
                                                        cart
                                                            ?.get()
                                                            .find(
                                                                (it) =>
                                                                    it.itemId ==
                                                                    item.id
                                                            )?.quantity || 0
                                                    }
                                                />
                                            ))}
                                    </div>
                                </div>
                            );
                        })}
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

    // When was the last order completed at?
    // Well, we sort all of the orders in desc order, and get the first one
    const lastOrder = await prisma.order.findFirst({
        orderBy: {
            completedAt: "desc",
        },
        select: {
            completedAt: true,
            createdAt: true,
        },
        take: 1,
    });

    // distance from user
    const a = {
        line1: fullUser.address1,
        line2: fullUser.address2,
        city: fullUser.city,
        postcode: fullUser.postcode,
    };

    const b = {
        line1: restaurant.address1,
        line2: restaurant.address2,
        city: restaurant.city,
        postcode: restaurant.postcode,
    };

    const distance = await calcDistance(a, b);

    if (!distance) return { notFound: true };

    return {
        props: {
            user: fullUser,
            restaurant: restaurant,
            menu: restaurant.menu.sort((a, b) =>
                a.category.localeCompare(b.category)
            ),
            reviewCount: restaurant.reviews.length,
            starAverage: Math.round((avg._avg.rating ?? 0) * 10) / 10,
            lastOrderTook:
                !lastOrder || !lastOrder.completedAt
                    ? -1
                    : lastOrder.completedAt.getTime() -
                      lastOrder.createdAt.getTime(),
            distanceFromUser: distance,
        },
    };
};
