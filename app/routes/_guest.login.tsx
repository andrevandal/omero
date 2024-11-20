import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, Link, useNavigation } from '@remix-run/react'
import {
  ActionFunctionArgs,
  MetaFunction,
  redirect
} from '@remix-run/cloudflare'
import { MetaFactory } from '@/lib/head'
import { zfd } from 'zod-form-data'
import { z } from 'zod'

import { loader as AuthLoader } from './_guest'
import { parsedFormDataFromRequest } from '@/lib/request.server'

export const meta: MetaFunction<typeof AuthLoader> = ({ data }) =>
  MetaFactory({
    baseUrl: data?.baseUrl,
    title: 'Login',
    description: 'Login to your account'
  })

const formSchema = zfd.formData({
  email: zfd.text(z.string().email()),
  password: zfd.text(z.string().min(5).max(50))
})

export const action = async ({ request }: ActionFunctionArgs) => {
  const { email: _email, password: _password } =
    await parsedFormDataFromRequest(request, formSchema)

  return redirect('/')
}

const LoginPage = () => {
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const isLoading = navigation.state === 'loading'
  return (
    <Form method="post">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            Enter your email and password to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              name="email"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/forgot-password"
                className="text-sm text-muted-foreground"
                prefetch="intent"
              >
                Forgot Password?
              </Link>
            </div>
            <Input id="password" type="password" name="password" required />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            loading={isSubmitting}
          >
            Sign In
          </Button>
        </CardFooter>
      </Card>
    </Form>
  )
}
export default LoginPage
