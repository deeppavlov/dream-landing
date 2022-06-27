import ReactDOM from "react-dom";
import React from "react";
import { getPage } from "vite-plugin-ssr/client";
import type { PageContextBuiltInClient } from "vite-plugin-ssr/client";

import "./globals.css";

hydrate();

async function hydrate() {
  const pageContext = await getPage<PageContextBuiltInClient>();
  const { Page } = pageContext;
  ReactDOM.hydrate(
    <React.StrictMode>
      <Page />
    </React.StrictMode>,
    document.getElementById("page-view")
  );
}
