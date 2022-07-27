import Image from "next/image";
import React from "react";
import Logo from "../components/Logo";
import styles from "../styles/Index.module.css";
import { DefaultProps } from "../app/okra";
import { Navbar } from "../components/Navbar";

interface Props {}

export default function Index(props: DefaultProps & Props) {
    return (
        <div className={props.main}>
            <header>
                <Navbar>
                    <div className={styles.buttons}>
                        <a className="btn dark" href="/users/signup">
                            Sign Up
                        </a>
                        <a className="btn" href="/users/login">
                            Login
                        </a>
                    </div>
                </Navbar>
            </header>
            <main className={styles.main}>
                <div className={styles.top}>
                    <h1>
                        <span className="highlight">Premium</span> food to your
                        door
                    </h1>
                    <h2>Log in to start ordering</h2>
                    <a className="btn" href="/users/signup">
                        Start
                    </a>
                </div>
                <div className={styles.imageContainer}>
                    <div className={styles.image}>
                        <Image
                            layout="fill"
                            src="https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                            className="darken"
                        />
                    </div>
                </div>
            </main>
            <footer className={styles.footer}>
                <p>
                    This is CS50 - by{" "}
                    <a className="highlight" href="https://tika.is/">
                        Tika
                    </a>
                </p>
                <p>Own a restaurant?</p>
            </footer>
        </div>
    );
}
