import { User } from "@prisma/client";
import { GetServerSideProps } from "next";
import { UserJWT } from "../../../app/userjwt";
import { DefaultProps } from "../../../app/okra";
import { Navbar } from "../../../components/Navbar";
import { prisma } from "../../../app/prisma";
import { DisplayUser } from "../../../components/DisplayUser";
import { FormInput } from "../../../components/FormInput";
import { FormEvent, useState } from "react";
import styles from "../../../styles/EditUser.module.css";
import toast from "react-hot-toast";
import { fetcher } from "../../../app/fetch";
import { toastStyle } from "../../../app/constants";
import { useRouter } from "next/router";

interface Props {
    user: User;
}

export default function Edit({ user, main }: Props & DefaultProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [address1, setAddress1] = useState("");
    const [address2, setAddress2] = useState("");
    const [city, setCity] = useState("");
    const [postcode, setPostcode] = useState("");

    const router = useRouter();

    function submit(e: FormEvent) {
        e.preventDefault();
        if (newPassword !== confirm) {
            return toast.error("Passwords don't match", { style: toastStyle });
        }

        async function actions() {
            const submittedData = {
                name,
                email,
                password,
                address1,
                address2,
                city,
                postcode,
                newPassword,
            };

            type Key = keyof typeof submittedData;
            const keys = Object.keys(submittedData) as Key[];

            // Delete property on object if value is ""
            keys.forEach((k) => {
                const value = submittedData[k].trim();
                if (value === "") {
                    delete submittedData[k];
                }
            });

            await fetcher("PATCH", "/users", submittedData);
            await router.push("/users/app/edit");
        }

        toast.promise(
            actions(),
            {
                loading: "Loading...",
                success: <b>Updated profile!</b>,
                error: (e) => e.message || <b>Something went wrong</b>,
            },
            { style: toastStyle }
        );
    }

    function onDelete() {
        if (!window.confirm("Are you sure you want to delete your account?"))
            return;

        async function actions() {
            await fetcher("DELETE", "/users", {
                password,
            });
            await router.push("/");
        }

        toast.promise(
            actions(),
            {
                loading: "Loading...",
                success: <b>Deleted account!</b>,
                error: (e) => e.message || <b>Something went wrong</b>,
            },
            { style: toastStyle }
        );
    }

    return (
        <div className={main}>
            <header>
                <Navbar>
                    <DisplayUser user={user} />
                </Navbar>
            </header>
            <main className={styles.main}>
                <div>
                    <form className={styles.form} onSubmit={submit}>
                        <div className={styles.title}>
                            <h1>Edit Profile</h1>
                            <button type="submit">Update</button>
                        </div>
                        <div className={styles.inputs}>
                            <FormInput
                                title={`Username (currently ${user.name})`}
                                value={name}
                                onInput={(val) => setName(val)}
                                type="text"
                            />
                            <FormInput
                                title={`Email (currently ${user.email})`}
                                value={email}
                                onInput={(val) => setEmail(val)}
                                type="email"
                            />
                            <FormInput
                                title="Password*"
                                value={password}
                                onInput={(val) => setPassword(val)}
                                type="password"
                            />
                            <h2 style={{ marginTop: "1em" }}>
                                Change Password
                            </h2>
                            <FormInput
                                title="New Password (confirm via email)"
                                value={newPassword}
                                onInput={(val) => setNewPassword(val)}
                                type="password"
                            />
                            <FormInput
                                title="Confirm New Password"
                                value={confirm}
                                onInput={(val) => setConfirm(val)}
                                type="password"
                            />
                            <h2 style={{ marginTop: "1em" }}>
                                Delivery Address
                            </h2>
                            <FormInput
                                title={`Address line 1 (currently ${user.address1})`}
                                value={address1}
                                onInput={(val) => setAddress1(val)}
                                type="text"
                            />
                            <FormInput
                                title={`Address line 2 (optional) (currently: ${user.address2})`}
                                value={address2}
                                onInput={(val) => setAddress2(val)}
                                type="text"
                            />
                            <FormInput
                                title={`Town/City (currently ${user.city})`}
                                value={city}
                                onInput={(val) => setCity(val)}
                                type="text"
                            />
                            <FormInput
                                title={`Postcode (currently ${user.postcode})`}
                                value={postcode}
                                onInput={(val) => setPostcode(val)}
                                type="text"
                            />
                        </div>
                    </form>
                    <h2 style={{ marginTop: "1em" }}>Delete your account</h2>
                    <p>
                        By deleting your account, you permit us to execute:{" "}
                        <code>DELETE FROM User WHERE id = {user.id}</code>
                    </p>
                    <button
                        onClick={onDelete}
                        className={`danger ${styles.delete}`}
                    >
                        Delete
                    </button>
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

    return {
        props: {
            user: fullUser,
        },
    };
};
