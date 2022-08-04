import { StarIcon } from "@heroicons/react/outline";
import { Restaurant, Review, User } from "@prisma/client";
import Image from "next/image";
import { convertDate } from "../app/primitive";
import styles from "../styles/ViewReview.module.css";
import { DisplayUser } from "./DisplayUser";

interface Props {
    data: Review;
    restaurant?: Restaurant;
    user?: User;
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
                {props.restaurant ? (
                    <>
                        <div className={styles.image}>
                            <Image src={props.restaurant.logo} layout="fill" />
                        </div>
                        <span>
                            {props.restaurant.name} •{" "}
                            {convertDate(props.data.createdAt)}
                        </span>
                    </>
                ) : (
                    <>
                        {props.user && (
                            <DisplayUser
                                user={props.user}
                                text={`${props.user.name} • ${convertDate(
                                    props.data.createdAt
                                )}`}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
