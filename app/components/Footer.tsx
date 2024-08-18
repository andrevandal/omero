import { Link } from '@remix-run/react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-muted border-t flex items-center justify-between h-14 px-4 sm:px-6">
      <div className="text-xs text-muted-foreground container">
        &copy; {currentYear}{' '}
        <Link to="https://andrevandal.dev">André Vandal</Link>. All rights
        reserved.
      </div>
    </footer>
  )
}

export default Footer
