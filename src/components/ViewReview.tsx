import { StarIcon } from "@heroicons/react/outline";
import Image from "next/image";
import { ReviewWithRestaurant } from "../app/okra";
import { convertDate } from "../app/primitive";
import styles from "../styles/ViewReview.module.css";

interface Props {
    data: ReviewWithRestaurant;
}

export function ViewReview(props: Props) {
    return (
        <div className={styles.main}>
            <div>
                <div>
                    {[1, 2, 3, 4, 5].map((it) => (
                        <StarIcon
                            key={it}
                            stroke="var(--okra-green)"
                            fill={
                                it <= props.data.rating
                                    ? "var(--okra-green)"
                                    : "none"
                            }
                            width="1.5em"
                            height="1.5em"
                        />
                    ))}
                </div>
                <p>{props.data.description}</p>
            </div>
            <div className={styles.footer}>
                <div className={styles.image}>
                    <Image src={props.data.restaurantLogo} layout="fill" />
                </div>
                <span>
                    {props.data.restaurantName} •{" "}
                    {convertDate(props.data.createdAt)}
                </span>
            </div>
        </div>
    );
}
