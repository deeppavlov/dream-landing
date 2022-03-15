import "../styles/globals.css";
import type { AppProps } from "next/app";

if (process.env.NODE_ENV === "development") {
  const { worker } = require("../mocks/browser");
  worker?.start && worker.start();
}

function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default App;
