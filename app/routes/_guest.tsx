import { Outlet } from '@remix-run/react'
import { extractBaseUrlFromContext } from '@/lib/head'
import { json, LoaderFunctionArgs } from '@remix-run/cloudflare'

export const loader = ({ context }: LoaderFunctionArgs) => {
  const baseUrl = extractBaseUrlFromContext(context)

  return json({
    baseUrl
  })
}

const AuthLayout = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-background flex-col gap-8">
      <img src="/logo.svg" alt="Omero Logo" width="200" />
      <Outlet />
    </div>
  )
}

export default AuthLayout
