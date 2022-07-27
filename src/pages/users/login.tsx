import { Navbar } from "../../components/Navbar";
import { DefaultProps } from "../../app/okra";
import { FormInput } from "../../components/FormInput";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { toastStyle } from "../../app/constants";
import { fetcher } from "../../app/fetch";
import { GetServerSideProps } from "next";
import { JWT } from "../../app/userjwt";

interface Props {}

export default function Login(props: Props & DefaultProps) {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    function submit(e: FormEvent) {
        e.preventDefault();
        toast.promise(
            fetcher("POST", "/users/login", { name, password }),
            {
                loading: "Loading...",
                success: <b>Settings saved!</b>,
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
                    <h1>Login</h1>
                    <h2>
                        Don&apos;t have an account?{" "}
                        <a className="highlight" href="/users/signup">
                            Sign Up
                        </a>
                    </h2>
                </div>

                <form onSubmit={submit}>
                    <FormInput
                        title="Username or email"
                        placeholder="e.g. name@example.com"
                        value={name}
                        onInput={(val) => setName(val)}
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

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const user = JWT.parseRequest(ctx.req);

    if (user) {
        return {
            redirect: {
                destination: "/users/app",
                permanent: false,
            },
        };
    }

    return { props: {} };
};
