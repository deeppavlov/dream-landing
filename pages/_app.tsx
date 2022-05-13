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
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          if (document.location.hostname.search("dream.deeppavlov.ai") !== -1) {
            window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
            ga('create', 'GOOGLE_ANALYTICS_ID', 'auto');
            ga('send', 'pageview');
          } else {
            window.ga=(...args)=>console.log("GA", ...args)
          }
        `}
      </Script>
      {process.env.NODE_ENV !== "development" && (
        <Script
          src="https://www.google-analytics.com/analytics.js"
          strategy="afterInteractive"
        />
      )}

      <Component {...pageProps} />
    </>
  );
}

export default App;
