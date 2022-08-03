import { GetServerSideProps } from "next";
import { RestaurantJWT } from "../../app/restaurantjwt";

export default function RestaurantLogout() {
    return null;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    ctx.res.setHeader("Set-Cookie", RestaurantJWT.cookie("", new Date()));

    return {
        redirect: {
            destination: "/",
            permanent: false,
        },
    };
};
