import "../styles/global.css";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function Okra({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <link
                    rel="apple-touch-icon"
                    sizes="180x180"
                    href="/images/apple-touch-icon.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="32x32"
                    href="/images/favicon-32x32.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="16x16"
                    href="/images/favicon-16x16.png"
                />
            </Head>
            <Component {...pageProps} />
        </>
    );
}
