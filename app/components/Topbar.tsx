import ProjectSwitcher from '@/components/ProjectSwitcher'
import UserNav from '@/components/UserNav'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { useSearchParams } from '@remix-run/react'

const Topbar = () => {
  const [_searchParams, setSearchParams] = useSearchParams()
  const toggleSidebar = () => {
    setSearchParams((prev) => {
      prev.set('sidebar', 'open')
      return prev
    })
  }

  return (
    <header className="border-b h-16 flex items-center">
      <div className="container flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <ProjectSwitcher />
        <UserNav className="ml-auto" />
      </div>
    </header>
  )
}

export default Topbar
