import { GetServerSideProps } from "next";
import { UserJWT } from "../../app/userjwt";

export default function UserLogout() {
    return null;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    ctx.res.setHeader("Set-Cookie", UserJWT.cookie("", new Date()));

    return {
        redirect: {
            destination: "/",
            permanent: false,
        },
    };
};
