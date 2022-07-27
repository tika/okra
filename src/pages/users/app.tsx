import { User } from "@prisma/client";
import { GetServerSideProps } from "next";
import { UserJWT } from "../../app/userjwt";
import { DefaultProps } from "../../app/okra";
import { Navbar } from "../../components/Navbar";
import { prisma } from "../../app/prisma";
import { DisplayUser } from "../../components/DisplayUser";

interface Props {
    user: User;
}

export default function App(props: Props & DefaultProps) {
    return (
        <div className={props.main}>
            <header>
                <Navbar />
            </header>
            <h1>Hello, {props.user.name}</h1>
            <DisplayUser user={props.user} />
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
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

    return {
        props: {
            user: fullUser,
        },
    };
};
