import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { Item } from "@prisma/client";
import Image from "next/image";
import { formatPrice } from "../app/primitive";
import { MinusIcon, PlusIcon, XIcon } from "@heroicons/react/outline";
import styles from "../styles/AddItemModal.module.css";

interface Props {
    item?: Item;
    close(): void;
    change(amount: number): void;
    amount: number;
}

export function AddItemModal(props: Props) {
    const [amount, setAmount] = useState(1);

    useEffect(() => {
        setAmount(props.amount === 0 ? 1 : props.amount);
    }, [props]);

    function getText() {
        if (!props.item) return null;

        // Trying to add items
        if (amount !== 0) {
            return `Add ${amount} to order • ${formatPrice(
                props.item.price * amount
            )}`;
        }

        // Can't remove because it's not already in the cart
        if (itemNotInCart()) {
            return "Choose an amount";
        }

        return "Remove item from cart";
    }

    function itemNotInCart() {
        return props.amount === 0;
    }

    return (
        <Dialog
            open={props.item !== undefined}
            onClose={() => props.close()}
            className={styles.main}
        >
            {props.item && (
                <Dialog.Panel className={styles.panel}>
                    <button onClick={() => props.close()} className={styles.x}>
                        <XIcon stroke="black" />
                    </button>
                    {props.item.image && (
                        <div className={styles.image}>
                            <Image src={props.item.image} layout="fill" />
                        </div>
                    )}
                    <div className={styles.content}>
                        <div>
                            <Dialog.Title className={styles.title}>
                                {props.item.name}
                            </Dialog.Title>
                            <span className={styles.price}>
                                {formatPrice(props.item.price)}
                            </span>
                            <Dialog.Description className={styles.description}>
                                {props.item.description}
                            </Dialog.Description>
                        </div>

                        <div className={styles.buttons}>
                            <div className={styles.increments}>
                                <button
                                    onClick={() =>
                                        setAmount(amount === 0 ? 0 : amount - 1)
                                    }
                                >
                                    <MinusIcon
                                        width="100%"
                                        height="100%"
                                        stroke="black"
                                        strokeWidth="3"
                                    />
                                </button>
                                <span>{amount}</span>
                                <button onClick={() => setAmount(amount + 1)}>
                                    <PlusIcon
                                        width="100%"
                                        height="100%"
                                        stroke="black"
                                        strokeWidth="3"
                                    />
                                </button>
                            </div>

                            <button
                                onClick={() => props.change(amount)}
                                disabled={amount === 0 && itemNotInCart()}
                            >
                                {getText()}
                            </button>
                        </div>
                    </div>
                </Dialog.Panel>
            )}
        </Dialog>
    );
}
