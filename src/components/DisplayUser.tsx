import { User } from "@prisma/client";
import Avatar from "boring-avatars";
import styles from "../styles/Display.module.css";

interface Props {
    user: User;
    disabled?: boolean;
    text?: string;
}

export function DisplayUser(props: Props) {
    const inner = (
        <>
            <Avatar
                size="2.5em"
                name={props.user.name}
                variant="beam"
                colors={[
                    "var(--okra-green)",
                    "var(--dark-okra-green)",
                    "var(--teal)",
                    "var(--dark-purple)",
                ]}
            />
            <span>{props.text ?? props.user.name}</span>
        </>
    );

    return (
        <>
            {props.disabled ? (
                <div className={styles.main}>{inner}</div>
            ) : (
                <a className={styles.main} href={"/users/app/edit"}>
                    {inner}
                </a>
            )}
        </>
    );
}
