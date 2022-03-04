import "../styles/globals.css";
import type { AppProps } from "next/app";

function MaintenancePage({ Component, pageProps }: AppProps) {
    return <Component { ...pageProps } />
}

export default MaintenancePage
