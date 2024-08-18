import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from '@remix-run/react'

const ForgotPasswordPage = () => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Forgot Password</CardTitle>
        <CardDescription>
          Enter your email to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button type="submit" className="w-full">
          Reset Password
        </Button>
        <Link
          to="/login"
          className="text-center text-sm underline"
          prefetch="intent"
        >
          Remember your password? Go back to login
        </Link>
      </CardFooter>
    </Card>
  )
}

export default ForgotPasswordPage
