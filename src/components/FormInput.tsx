interface Props {
    title: string;
    placeholder?: string;
    type: "text" | "password" | "number" | "email";
    value: string | number;
    onInput(val: string): void;
    className?: string;
}

export function FormInput(props: Props) {
    return (
        <div className={props.className}>
            <h6>{props.title}</h6>
            <input
                placeholder={props.placeholder}
                type={props.type}
                value={props.value}
                onChange={(e) => props.onInput(e.target.value)}
            />
        </div>
    );
}
