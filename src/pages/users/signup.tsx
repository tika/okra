import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { fetcher } from "../../app/fetch";
import { DefaultProps } from "../../app/okra";
import { toastStyle } from "../../app/constants";
import { Navbar } from "../../components/Navbar";
import { FormInput } from "../../components/FormInput";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { JWT } from "../../app/userjwt";

interface Props {}

export default function SignUp(props: DefaultProps & Props) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [address1, setAddress1] = useState("");
    const [address2, setAddress2] = useState("");
    const [city, setCity] = useState("");
    const [postcode, setPostcode] = useState("");

    const router = useRouter();

    function submit(e: FormEvent) {
        e.preventDefault();
        if (password !== confirmPassword) {
            return toast.error("Passwords don't match", { style: toastStyle });
        }

        toast
            .promise(
                fetcher("POST", "/users", {
                    name: username,
                    email,
                    password,
                    confirmPassword,
                    address1,
                    address2,
                    city,
                    postcode,
                }),
                {
                    loading: "Loading...",
                    success: <b>Settings saved!</b>,
                    error: (e) => e.message || <b>Something went wrong</b>,
                },
                { style: toastStyle }
            )
            .then(() => router.push("/users/app"));
    }

    return (
        <div className={props.main}>
            <header>
                <Navbar />
            </header>
            <main className="form">
                <div>
                    <h1>Sign Up</h1>
                    <h2>
                        Already grubbing?{" "}
                        <a className="highlight" href="/users/signup">
                            Login
                        </a>
                    </h2>
                </div>

                <form onSubmit={submit}>
                    <FormInput
                        title="Username"
                        placeholder="e.g. johnlennon"
                        value={username}
                        onInput={(val) => setUsername(val)}
                        type="text"
                    />
                    <FormInput
                        title="Email"
                        placeholder="e.g. name@example.com"
                        value={email}
                        onInput={(val) => setEmail(val)}
                        type="email"
                    />
                    <FormInput
                        title="Password"
                        placeholder="password"
                        value={password}
                        onInput={(val) => setPassword(val)}
                        type="password"
                    />
                    <FormInput
                        title="Confirm Password"
                        placeholder="password"
                        value={confirmPassword}
                        onInput={(val) => setConfirmPassword(val)}
                        type="password"
                    />
                    <h2 style={{ marginTop: "1em" }}>Address</h2>
                    <FormInput
                        title="Address Line 1"
                        placeholder="Address Line 1"
                        value={address1}
                        onInput={(val) => setAddress1(val)}
                        type="text"
                    />
                    <FormInput
                        title="Address Line 2 (optional)"
                        placeholder="Address Line 2 (optional)"
                        value={address2}
                        onInput={(val) => setAddress2(val)}
                        type="text"
                    />
                    <FormInput
                        title="Town/city"
                        placeholder="Town/city"
                        value={city}
                        onInput={(val) => setCity(val)}
                        type="text"
                    />
                    <FormInput
                        title="Postcode"
                        placeholder="Postcode"
                        value={postcode}
                        onInput={(val) => setPostcode(val)}
                        type="text"
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
