import { Link } from '@remix-run/react'

import { cn } from '@/lib/utils'

export function MainNav({
  className,
  ...props
}: Readonly<React.HTMLAttributes<HTMLElement>>) {
  return (
    <nav
      className={cn('flex items-center space-x-4 lg:space-x-6', className)}
      {...props}
    >
      <Link
        to="/"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Home
      </Link>
      <Link
        to="/posts"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Posts
      </Link>
      <Link
        to="/categories"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Categories
      </Link>
      <Link
        to="/tags"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Tags
      </Link>
      <Link
        to="/pages"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Pages
      </Link>
      <Link
        to="/settings"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Settings
      </Link>
    </nav>
  )
}
