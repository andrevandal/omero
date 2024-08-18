import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from '@remix-run/react'
import './globals.css'

export function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" sizes="any" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
        />
        <Meta />
        <Links />
      </head>
      <body className="font-sans antialiased bg">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
