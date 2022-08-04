import { Restaurant } from "@prisma/client";
import Image from "next/image";
import styles from "../styles/Display.module.css";

interface Props {
    restaurant: Restaurant;
    disabled?: boolean;
    text?: string;
    dest?: string;
}

export function DisplayRestaurant(props: Props) {
    const inner = (
        <>
            <div className={styles.image}>
                <Image
                    alt={"Logo of " + props.restaurant.name}
                    src={props.restaurant.logo}
                    layout="fill"
                />
            </div>
            <span>{props.text ?? props.restaurant.name}</span>
        </>
    );

    return (
        <>
            {props.disabled ? (
                <div className={styles.main}>{inner}</div>
            ) : (
                <a
                    className={styles.main}
                    href={props.dest ?? "/restaurants/app/edit"}
                    style={{ cursor: "pointer" }}
                >
                    {inner}
                </a>
            )}
        </>
    );
}
