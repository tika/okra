import { StarIcon } from "@heroicons/react/outline";
import { useState } from "react";
import { Feedback } from "../app/okra";
import styles from "../styles/FeedbackForm.module.css";

interface Props {
    onSubmit(feedback: Feedback): void;
}

export default function FeedbackForm(props: Props) {
    const [text, setText] = useState("");
    const [starCount, setStarCount] = useState(1);

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                props.onSubmit({ text, starCount });
            }}
        >
            <h2>Leave feedback</h2>
            <div className={styles.stars}>
                <span>
                    {starCount} star{starCount > 1 && "s"}
                </span>
                <div>
                    {[1, 2, 3, 4, 5].map((it) => (
                        <StarIcon
                            key={it}
                            stroke="var(--okra-green)"
                            fill={
                                it <= starCount ? "var(--okra-green)" : "none"
                            }
                            width="1.5em"
                            height="1.5em"
                            onClick={() => setStarCount(it)}
                        />
                    ))}
                </div>
            </div>
            <div className={styles.bottom}>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Your feedback here"
                />
                <button type="submit">Submit</button>
            </div>
        </form>
    );
}
