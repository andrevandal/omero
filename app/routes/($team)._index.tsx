import Footer from '@/components/Footer'
import Header from '@/components/Header'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { MetaFactory, extractBaseUrlFromContext } from '@/lib/head'
import { LoaderFunctionArgs, MetaFunction, json } from '@remix-run/cloudflare'
import { Link } from '@remix-run/react'

export const loader = ({ context }: LoaderFunctionArgs) => {
  const baseUrl = extractBaseUrlFromContext(context)

  return json({
    baseUrl
  })
}

export const meta: MetaFunction<typeof loader> = ({ data }) =>
  MetaFactory({
    ...(data ?? {})
  })

export default function Index() {
  return (
    <>
      <Header />
      <div className="container">
        <main className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 sm:p-6">
          <Card>
            <CardHeader>
              <CardTitle>Posts</CardTitle>
              <CardDescription>Manage your blog posts</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="text-4xl font-bold">245</div>
              <div className="text-sm text-muted-foreground">Total Posts</div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">12</span> added this month
              </div>
            </CardContent>
            <CardFooter>
              <Link
                to="/posts"
                className="text-primary hover:underline"
                prefetch="intent"
              >
                Manage Posts
              </Link>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Organize your content</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="text-4xl font-bold">32</div>
              <div className="text-sm text-muted-foreground">
                Total Categories
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">4</span> added this month
              </div>
            </CardContent>
            <CardFooter>
              <Link
                to="/categories"
                className="text-primary hover:underline"
                prefetch="intent"
              >
                Manage Categories
              </Link>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Categorize your content</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="text-4xl font-bold">154</div>
              <div className="text-sm text-muted-foreground">Total Tags</div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">8</span> added this month
              </div>
            </CardContent>
            <CardFooter>
              <Link
                to="/tags"
                className="text-primary hover:underline"
                prefetch="intent"
              >
                Manage Tags
              </Link>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pages</CardTitle>
              <CardDescription>Manage your website pages</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="text-4xl font-bold">67</div>
              <div className="text-sm text-muted-foreground">Total Pages</div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">3</span> added this month
              </div>
            </CardContent>
            <CardFooter>
              <Link
                to="/pages"
                className="text-primary hover:underline"
                prefetch="intent"
              >
                Manage Pages
              </Link>
            </CardFooter>
          </Card>
        </main>
      </div>
      <Footer />
    </>
  )
}
