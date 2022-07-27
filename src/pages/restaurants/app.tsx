import { Restaurant, User } from "@prisma/client";
import { GetServerSideProps } from "next";
import { RestaurantJWT } from "../../app/restaurantjwt";
import { DefaultProps } from "../../app/okra";
import { Navbar } from "../../components/Navbar";
import { prisma } from "../../app/prisma";
import { DisplayRestaurant } from "../../components/DisplayRestaurant";

interface Props {
    restaurant: Restaurant;
}

export default function App(props: Props & DefaultProps) {
    return (
        <div className={props.main}>
            <header>
                <Navbar />
            </header>
            <DisplayRestaurant restaurant={props.restaurant} />
            <h1>Hello, {props.restaurant.name}</h1>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
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
    });

    return {
        props: {
            restaurant: fullRestaurant,
        },
    };
};
