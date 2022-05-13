import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import Script from "next/script";

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
      {process.env.NODE_ENV !== "development" && (
        <>
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
              ga('create', 'G-21TGJ1M308', 'auto');
              ga('send', 'pageview');
            `}
          </Script>
          <Script
            src="https://www.google-analytics.com/analytics.js"
            strategy="afterInteractive"
          />
        </>
      )}

      <Component {...pageProps} />
    </>
  );
}

export default App;
