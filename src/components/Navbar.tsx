import { useRouter } from "next/router";
import Logo from "./Logo";

interface Navbar {
    children?: React.ReactNode;
}

// Component where the children are on the right side of the navbar
export function Navbar(props: Navbar) {
    const router = useRouter();

    return (
        <nav>
            <a
                className="logo"
                href={
                    router.asPath.includes("restaurants")
                        ? "/restaurants/app"
                        : "/users/app"
                }
            >
                <Logo height="1.5em" width="1.5em" />
                <span>OKRA</span>
            </a>
            <div className="spaced">{props.children}</div>
        </nav>
    );
}
