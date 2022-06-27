import ReactDOMServer from "react-dom/server";
import React from "react";
import { escapeInject, dangerouslySkipEscape } from "vite-plugin-ssr";
import logoUrl from "./logo.svg";
import type { PageContextBuiltIn } from "vite-plugin-ssr";

export { render };

async function render(pageContext: PageContextBuiltIn) {
  const { Page } = pageContext;
  const pageHtml = ReactDOMServer.renderToString(
    <React.StrictMode>
      <Page />
    </React.StrictMode>
  );

  const title = "Dream SocialBot";
  const desc = "Dream";

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" href="${logoUrl}" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="${desc}" />
        <title>${title}</title>
      </head>
      <body>
        <div id="page-view">${dangerouslySkipEscape(pageHtml)}</div>
      </body>
    </html>`;

  return {
    documentHtml,
  };
}
