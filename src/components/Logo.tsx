import React from "react";
import { SVGProps } from "../app/okra";

export default function Logo(props: SVGProps) {
    return (
        <svg
            width={props.width}
            height={props.height}
            viewBox="0 0 256 256"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M120.762 256L31.2671 105.943L242.253 17.5528L120.762 256Z"
                fill="#73AC50"
            />
            <path
                d="M120.762 0L120.762 256L14 88.1255L120.762 0Z"
                fill="#ABFF77"
            />
        </svg>
    );
}
