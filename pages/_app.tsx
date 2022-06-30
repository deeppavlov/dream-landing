import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import Script from "next/script";
import { PopupProvider } from "../components/Popup";

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
        <title>Dream Social Bot</title>
      </Head>
      {process.env.NODE_ENV !== "development" ? (
        <>
          <Script id="yandex-metrika" strategy="afterInteractive">
            {`
              (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
              (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

              ym(88822179, "init", {
                    clickmap:true,
                    trackLinks:true,
                    accurateTrackBounce:true,
                    webvisor:true,
                    trackHash:true
              });
            `}
          </Script>

          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-21TGJ1M308');
            `}
          </Script>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-21TGJ1M308"
            strategy="afterInteractive"
          />
        </>
      ) : (
        <Script id="google-analytics-shim" strategy="afterInteractive">
          {`
            window.gtag=(...args) => console.info("GA", ...args)
          `}
        </Script>
      )}

      <PopupProvider>
        <Component {...pageProps} />
      </PopupProvider>
    </>
  );
}

export default App;
