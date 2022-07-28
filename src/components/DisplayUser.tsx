import { User } from "@prisma/client";
import Avatar from "boring-avatars";
import styles from "../styles/Display.module.css";

interface Props {
    user: User;
}

export function DisplayUser(props: Props) {
    return (
        <a className={styles.main} href="/users/app/edit">
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
            <span>{props.user.name}</span>
        </a>
    );
}
