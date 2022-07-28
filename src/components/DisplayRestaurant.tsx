import { Restaurant } from "@prisma/client";
import Image from "next/image";
import styles from "../styles/Display.module.css";

interface Props {
    restaurant: Restaurant;
}

export function DisplayRestaurant(props: Props) {
    return (
        <a className={styles.main} href="/restaurants/app/edit">
            <div className={styles.image}>
                <Image src={props.restaurant.logo} layout="fill" />
            </div>
            <span>{props.restaurant.name}</span>
        </a>
    );
}
