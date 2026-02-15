import { html } from "hono/html";

export function DocsPage() {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Praytime API Reference</title>
        <style>{"body { margin: 0; }"}</style>
      </head>
      <body>
        <div id="docs"></div>
        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
        {html`<script>
          Scalar.createApiReference(document.getElementById('docs'), {
            url: 'https://api.praytime.io/openapi.json',
            theme: 'default',
          })
        </script>`}
      </body>
    </html>
  );
}
