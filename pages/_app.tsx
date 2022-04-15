import "../styles/globals.css";
import "react-custom-scroll/dist/customScroll.css";
import type { AppProps } from "next/app";
import Head from "next/head";

if (process.env.NODE_ENV === "development" && process.env.MSW) {
  const { worker } = require("../mocks/browser");
  worker?.start && worker.start();
}

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default App;
