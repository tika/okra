import { Restaurant, User } from "@prisma/client";
import { GetServerSideProps } from "next";
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
import { RestaurantJWT } from "../../../app/restaurantjwt";
import { DisplayRestaurant } from "../../../components/DisplayRestaurant";
import { isNumber } from "../../../app/number";

interface Props {
    restaurant: Restaurant;
}

export default function Edit({ restaurant, main }: Props & DefaultProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [minOrderAmount, setMinOrderAmount] = useState("");
    const [description, setDescription] = useState("");
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

        if (minOrderAmount.trim() !== "" && !isNumber(minOrderAmount)) {
            return toast.error("Minimum order amount must be a number", {
                style: toastStyle,
            });
        }

        async function actions() {
            const submittedData = {
                name,
                email,
                password,
                minOrderAmount,
                description,
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
                let value = submittedData[k].trim();

                if (value === "") {
                    delete submittedData[k];
                }
            });

            await fetcher("PATCH", "/restaurants", submittedData);
            await router.push("/restaurants/app/edit");
        }

        toast.promise(
            actions(),
            {
                loading: "Loading...",
                success: <b>Updated restaurant!</b>,
                error: (e) => e.message || <b>Something went wrong</b>,
            },
            { style: toastStyle }
        );
    }

    function onDelete() {
        if (
            !window.confirm(
                "Are you sure you want to delete your restaurant account?"
            )
        )
            return;

        async function actions() {
            await fetcher("DELETE", "/restaurants", {
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
                    <DisplayRestaurant restaurant={restaurant} />
                </Navbar>
            </header>
            <main className={styles.main}>
                <div>
                    <form className={styles.form} onSubmit={submit}>
                        <div className={styles.title}>
                            <h1>Edit Restaurant</h1>
                            <button type="submit">Update</button>
                        </div>
                        <div className={styles.inputs}>
                            <FormInput
                                title={`Restaurant Name (currently ${restaurant.name})`}
                                placeholder="e.g. Curry Passion"
                                value={name}
                                onInput={(val) => setName(val)}
                                type="text"
                            />
                            <FormInput
                                title={`Email (currently ${restaurant.email})`}
                                placeholder="e.g. john@doe.com"
                                value={email}
                                onInput={(val) => setEmail(val)}
                                type="email"
                            />
                            <FormInput
                                title="Password*"
                                placeholder="Password"
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
                            <h2 style={{ marginTop: "1em" }}>Misc</h2>
                            <FormInput
                                title={`Minimum order amount (currently £${restaurant.minOrderAmount})`}
                                value={minOrderAmount}
                                onInput={(val) => setMinOrderAmount(val)}
                                type="text"
                            />
                            <FormInput
                                title="Description"
                                placeholder="Sheeesh, kebab"
                                value={description}
                                onInput={(val) => setDescription(val)}
                                type="text"
                            />
                            <h2 style={{ marginTop: "1em" }}>
                                Restaurant Address
                            </h2>
                            <FormInput
                                title={`Address line 1 (currently ${restaurant.address1})`}
                                value={address1}
                                onInput={(val) => setAddress1(val)}
                                type="text"
                            />
                            <FormInput
                                title={`Address line 2 (optional) (currently: ${restaurant.address2})`}
                                value={address2}
                                onInput={(val) => setAddress2(val)}
                                type="text"
                            />
                            <FormInput
                                title={`Town/City (currently ${restaurant.city})`}
                                value={city}
                                onInput={(val) => setCity(val)}
                                type="text"
                            />
                            <FormInput
                                title={`Postcode (currently ${restaurant.postcode})`}
                                value={postcode}
                                onInput={(val) => setPostcode(val)}
                                type="text"
                            />
                        </div>
                    </form>
                    <h2 style={{ marginTop: "1em" }}>
                        Delete your restaurant account
                    </h2>
                    <p>
                        By deleting your account, you permit us to execute:{" "}
                        <code>
                            DELETE FROM Restaurant WHERE id = {restaurant.id}
                        </code>
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

    // TODO: logout
    if (!fullRestaurant) {
        return {
            redirect: {
                destination: "/restaurants/login",
                permanent: false,
            },
        };
    }

    return {
        props: {
            restaurant: fullRestaurant,
        },
    };
};
