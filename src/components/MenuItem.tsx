import { PlusIcon } from "@heroicons/react/outline";
import { Item } from "@prisma/client";
import Image from "next/image";
import { formatPrice } from "../app/primitive";
import styles from "../styles/MenuItem.module.css";

interface Props {
    item: Item;
}

export function MenuItem({ item }: Props) {
    return (
        <div className={`${styles.main} ${item.image && styles.mainImg}`}>
            {item.image && (
                <div className={styles.img}>
                    <Image src={item.image} layout="fill" />
                </div>
            )}
            <div className={styles.info}>
                <h2>{item.name}</h2>
                <span>{formatPrice(item.price)}</span>
            </div>
            <div className={`${styles.plus} ${item.image && styles.plusImg}`}>
                <PlusIcon
                    width="100%"
                    height="100%"
                    stroke="black"
                    strokeWidth="3"
                />
            </div>
        </div>
    );
}
