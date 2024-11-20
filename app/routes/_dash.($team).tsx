import Footer from '@/components/Footer'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'

import { MetaFactory, extractBaseUrlFromContext } from '@/lib/head'
import { LoaderFunctionArgs, MetaFunction, json } from '@remix-run/cloudflare'
import { Outlet } from '@remix-run/react'

export const loader = ({ context }: LoaderFunctionArgs) => {
  const baseUrl = extractBaseUrlFromContext(context)

  const teams = [
    {
      id: 1,
      slug: 'andrevandal.dev'
    }
  ]

  return json({
    baseUrl,
    team: teams[0]
  })
}

export const meta: MetaFunction<typeof loader> = ({ data }) =>
  MetaFactory({
    ...(data ?? {})
  })

export default function Index() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="container flex-1">
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  )
}
