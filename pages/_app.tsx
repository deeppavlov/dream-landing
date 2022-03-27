import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

if (process.env.NODE_ENV === "development") {
  const { worker } = require("../mocks/browser");
  worker?.start && worker.start();
}

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default App;
