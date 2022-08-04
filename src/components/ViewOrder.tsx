import { OrderWithUser } from "../app/okra";
import {
    convertDate,
    convertTime,
    formatAddress,
    formatPrice,
} from "../app/primitive";
import { DisplayUser } from "./DisplayUser";

interface Props {
    complete?: () => void;
    cancel?: () => void;
    order: OrderWithUser;
    total: number;
}

export function ViewOrder(props: Props) {
    return (
        <div>
            <ul>
                {props.order.items.map((it) => (
                    <li>
                        {it.quantity}x {it.item.name}
                    </li>
                ))}
            </ul>

            <span className="highlight">
                Order total: {formatPrice(props.total)}
            </span>

            <div>
                <DisplayUser
                    user={props.order.user}
                    text={`${props.order.user.name} • ${convertDate(
                        props.order.createdAt
                    )} • ${convertTime(props.order.createdAt)}`}
                />
                <a
                    href={`mailto:${props.order.user.email}`}
                    className="highlight"
                >
                    Contact
                </a>
            </div>

            <span>
                {formatAddress({
                    line1: props.order.user.address1,
                    line2: props.order.user.address2,
                    city: props.order.user.city,
                    postcode: props.order.user.postcode,
                })}
            </span>

            {props.complete && props.cancel && (
                <div>
                    <button onClick={props.complete}>Complete</button>
                    <span onClick={props.cancel}>Cancel</span>
                </div>
            )}
        </div>
    );
}
