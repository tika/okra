import Head from "next/head";
import React from "react";
import Logo from "../components/Logo";
import styles from "../styles/Index.module.css";

export default function Index() {
    return (
        <>
            <Head>
                <nav>
                    <div className="logo">
                        <Logo height="1.5em" width="1.5em" />
                        <span>OKRA</span>
                    </div>
                    <div className={styles.buttons}>
                        <button className="dark-btn">Sign Up</button>
                        <button>Login</button>
                    </div>
                </nav>
            </Head>
        </>
    );
}
