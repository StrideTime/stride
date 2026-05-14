import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router';

import '@stride/ui/styles/global.css';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Stride' },
    ],
    links: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
  }),
  component: RootDocument,
});

// The root route renders the whole HTML document — TanStack Start SSR-renders this on the
// web build and prerenders it for the desktop SPA build.
function RootDocument() {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
