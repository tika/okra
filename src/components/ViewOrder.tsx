import { OrderWithUser } from "../app/okra";
import {
    convertDate,
    convertTime,
    formatAddress,
    formatPrice,
} from "../app/primitive";
import { DisplayUser } from "./DisplayUser";
import styles from "../styles/ViewOrder.module.css";

interface Props {
    complete?: () => void;
    cancel?: () => void;
    order: OrderWithUser;
    total: number;
}

export function ViewOrder(props: Props) {
    return (
        <div className={styles.main}>
            <ul className={styles.items}>
                {props.order.items.map((it) => (
                    <li>
                        {it.quantity}x {it.item.name}
                    </li>
                ))}
            </ul>

            {props.order.note && (
                <span>Note to restaurant: {props.order.note}</span>
            )}

            <span className="highlight">
                Order total: {formatPrice(props.total)}
            </span>

            <div className={styles.user}>
                <DisplayUser
                    user={props.order.user}
                    text={`${props.order.user.name} • ${convertDate(
                        props.order.createdAt
                    )} • ${convertTime(props.order.createdAt)}`}
                    dest={`/users/app/view/${props.order.user.id}`}
                />
                <a
                    href={`mailto:${props.order.user.email}`}
                    className="highlight"
                >
                    Contact
                </a>
            </div>

            <span className={styles.address}>
                Delivery address:{" "}
                {formatAddress({
                    line1: props.order.user.address1,
                    line2: props.order.user.address2,
                    city: props.order.user.city,
                    postcode: props.order.user.postcode,
                })}
            </span>

            {props.complete && props.cancel && (
                <div className={styles.buttons}>
                    <button onClick={props.complete}>Complete</button>
                    <span className="danger-text" onClick={props.cancel}>
                        Cancel
                    </span>
                </div>
            )}
        </div>
    );
}
