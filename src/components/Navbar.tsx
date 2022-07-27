import Logo from "./Logo";

interface Navbar {
    children?: React.ReactNode;
}

// Component where the children are on the right side of the navbar
export function Navbar(props: Navbar) {
    return (
        <nav>
            <div className="logo">
                <Logo height="1.5em" width="1.5em" />
                <span>OKRA</span>
            </div>
            {props.children}
        </nav>
    );
}
