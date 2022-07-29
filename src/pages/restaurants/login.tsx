import { Navbar } from "../../components/Navbar";
import { DefaultProps } from "../../app/okra";
import { FormInput } from "../../components/FormInput";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { toastStyle } from "../../app/constants";
import { fetcher } from "../../app/fetch";
import { GetServerSideProps } from "next";
import { RestaurantJWT } from "../../app/restaurantjwt";
import { useRouter } from "next/router";

interface Props {}

export default function Login(props: Props & DefaultProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const router = useRouter();

    function submit(e: FormEvent) {
        e.preventDefault();

        async function actions() {
            await fetcher("POST", "/restaurants/login", { email, password });
            await router.push("/restaurants/app");
        }

        toast.promise(
            actions(),
            {
                loading: "Loading...",
                success: <b>Logged in!</b>,
                error: (e) => e.message || <b>Something went wrong</b>,
            },
            { style: toastStyle }
        );
    }

    return (
        <div className={props.main}>
            <header>
                <Navbar />
            </header>
            <main className="form">
                <div>
                    <h1>Restaurant Login</h1>
                    <h2>
                        Don&apos;t have an account?{" "}
                        <a className="highlight" href="/restaurants/signup">
                            Sign Up
                        </a>
                    </h2>
                </div>

                <form onSubmit={submit}>
                    <FormInput
                        title="Email"
                        placeholder="e.g. name@example.com"
                        value={email}
                        onInput={(val) => setEmail(val)}
                        type="text"
                    />
                    <FormInput
                        title="Password"
                        placeholder="enter your password"
                        value={password}
                        onInput={(val) => setPassword(val)}
                        type="password"
                    />
                    <button type="submit">Go</button>
                </form>
            </main>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
    const restaurant = RestaurantJWT.parseRequest(ctx.req);

    if (restaurant) {
        return {
            redirect: {
                destination: "/restaurants/app",
                permanent: false,
            },
        };
    }

    return { props: {} };
};
