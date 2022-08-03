import { Item, Restaurant, User } from "@prisma/client";
import { GetServerSideProps } from "next";
import { UserJWT } from "../../../../app/userjwt";
import { CartItem, DefaultProps } from "../../../../app/okra";
import { Navbar } from "../../../../components/Navbar";
import { prisma } from "../../../../app/prisma";
import { DisplayUser } from "../../../../components/DisplayUser";
import styles from "../../../../styles/ViewRestaurant.module.css";
import { isNumber, capitalise } from "../../../../app/primitive";
import {
    CurrencyPoundIcon,
    LocationMarkerIcon,
    SearchIcon,
    ShoppingCartIcon,
    StarIcon,
} from "@heroicons/react/outline";
import { MenuItem } from "../../../../components/MenuItem";
import { createRef, useEffect, useRef, useState } from "react";
import { AddItemModal } from "../../../../components/AddItemModal";
import { Cart } from "../../../../app/cart";
import toast from "react-hot-toast";

interface Props {
    user: User;
    restaurant: Restaurant;
    menu: Item[];
    reviewCount: number;
    starAverage: number;
    lastOrderCompletedAt: Date | null;
}

export default function ViewRestaurant(props: Props & DefaultProps) {
    const [itemsShown, setItemsShown] = useState(props.menu);
    const [categoryContainers, setCategoryContainers] = useState([]);
    const [categoriesShown, setCategoriesShown] = useState(getCategories());
    const [highlightedCategory, setHighlightedCategory] = useState(0);
    const [cartItem, setCartItem] = useState<Item | undefined>(); // TODO: better name
    const [cart, setCart] = useState<Cart>();

    // This is silly, but because of a Hydration warning, we must first wait for the entire window to mount before using localstorage.
    useEffect(() => {
        setCart(new Cart(props.restaurant.id));
    }, []);

    // Gets categories from the items shown
    function getCategories() {
        return Array.from(
            new Set(itemsShown.map((it) => capitalise(it.category)))
        );
    }

    // Every time getCategories updates
    useEffect(() => {
        // add or remove refs
        setCategoryContainers((categoryContainers) =>
            Array(categoriesShown.length)
                .fill([])
                .map((_, i) => categoryContainers[i] || createRef())
        );
    }, [categoriesShown]);

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
        if (!cartItem || !cart) return;

        // Then we want to remove item from
        if (amount === 0) {
            cart.remove(cartItem.id);

            // Close this window, and update UI
            toast(`Removed ${cartItem.name} from cart`);
        } else {
            cart.add(cartItem, amount);

            toast(`Added ${cartItem.name} to cart`);
        }

        setCartItem(undefined);
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
                    item={cartItem}
                    amount={
                        cart?.get().find((it) => it.itemId === cartItem?.id)
                            ?.quantity ?? 0
                    }
                    close={() => setCartItem(undefined)}
                    change={itemChange}
                />
                <div className={styles.sidebar}>
                    <h1>{props.restaurant.name}</h1>
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
                            <span>0.22 miles away • 2 mins away</span>
                        </div>
                        <div>
                            <ShoppingCartIcon />
                            <span>
                                {props.lastOrderCompletedAt
                                    ? `Last order completed at
                                ${props.lastOrderCompletedAt.toString()}`
                                    : "No orders yet"}
                            </span>
                        </div>
                        <div>
                            <CurrencyPoundIcon />
                            <span>
                                Min. order £{props.restaurant.minOrderAmount}
                            </span>
                        </div>
                    </div>
                    <div className={styles.categories}>
                        {categoriesShown.map((it, i) => (
                            <h3
                                key={it}
                                className={`${
                                    highlightedCategory === i && "highlight"
                                }`}
                            >
                                {it}
                            </h3>
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
                                <div
                                    key={i}
                                    className={styles.itemsContainer}
                                    ref={categoryContainers[i]}
                                >
                                    <h2>{capitalise(it)}</h2>
                                    <div>
                                        {categoryItems
                                            .filter((it) => it.image)
                                            .map((item) => (
                                                <MenuItem
                                                    key={item.id}
                                                    onPlus={() =>
                                                        setCartItem(item)
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
                                                        setCartItem(item)
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
    });

    return {
        props: {
            user: fullUser,
            restaurant: restaurant,
            menu: restaurant.menu.sort((a, b) =>
                a.category.localeCompare(b.category)
            ),
            reviewCount: restaurant.reviews.length,
            starAverage: avg._avg.rating || 0,
            lastOrderCompletedAt: lastOrder ? lastOrder.completedAt : null,
        },
    };
};
