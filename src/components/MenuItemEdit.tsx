import { useState, FormEvent } from "react";
import toast from "react-hot-toast";
import { isNumber } from "../app/number";
import { FormInput } from "./FormInput";
import { toastStyle } from "../app/constants";
import { BaseItem } from "../app/okra";
import styles from "../styles/MenuItemEdit.module.css";

interface Props {
    item?: BaseItem;
    action(newItem: BaseItem): void;
    onDelete?: (id: number) => void;
    shouldClear?: boolean;
}

export function MenuItemEdit({ item, ...props }: Props) {
    const [name, setName] = useState(item?.name ?? "");
    const [price, setPrice] = useState(item?.price.toString() ?? "");
    const [description, setDescription] = useState(item?.description ?? "");
    const [image, setImage] = useState(item?.image ?? "");
    const [category, setCategory] = useState(item?.category ?? "");

    function submit(e: FormEvent) {
        e.preventDefault();
        if (!isNumber(price)) {
            return toast.error("Price must be a number!", {
                style: toastStyle,
            });
        }

        const data: BaseItem = {
            id: item?.id,
            name,
            price: Number(price),
            description,
            image,
            category,
        };

        props.action(data);

        if (props.shouldClear) {
            clear();
        }
    }

    function clear() {
        setName("");
        setPrice("");
        setDescription("");
        setImage("");
    }

    return (
        <form onSubmit={submit} className={styles.main}>
            <FormInput
                title="Image"
                placeholder="Image URL"
                value={image}
                onInput={(val) => setImage(val)}
                type="text"
            />
            <FormInput
                title="Name*"
                placeholder="Pancakes"
                value={name}
                onInput={(val) => setName(val)}
                type="text"
            />
            <FormInput
                title="Price (in £)*"
                placeholder="15"
                value={price}
                onInput={(val) => setPrice(val)}
                type="text"
            />
            <FormInput
                title="Category*"
                placeholder="e.g. Salads/Burgers/Wraps"
                value={description}
                onInput={(val) => setDescription(val)}
                type="text"
            />
            <FormInput
                title="Description"
                placeholder="e.g. Great quality, low on price"
                value={description}
                onInput={(val) => setDescription(val)}
                type="text"
            />
            <div className={styles.buttons}>
                <button type="submit">Save</button>
                {props.onDelete && item && item.id && (
                    <span
                        className={`danger-text ${styles.delete}`}
                        onClick={() => props.onDelete!(item.id as number)}
                    >
                        Delete
                    </span>
                )}
            </div>
        </form>
    );
}
