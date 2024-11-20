import { useSearchParams } from '@remix-run/react'
import useMediaQuery from '@/hooks/useMediaQuery'
import { Button } from './ui/button'
import {
  X,
  Home,
  Users,
  FileText,
  Settings,
  FolderOpen,
  Tag,
  Folder
} from 'lucide-react'
import { useEffect } from 'react'

const Sidebar = ({ children }: { children?: React.ReactNode }) => {
  const [searchParams, setSearchParams] = useSearchParams()

  const sidebarOpen = searchParams.get('sidebar') === 'open'
  const toggleSidebar = () => {
    if (!sidebarOpen) {
      setSearchParams((prev) => {
        prev.set('sidebar', 'open')
        return prev
      })
      return
    }
    setSearchParams((prev) => {
      prev.delete('sidebar')
      return prev
    })
  }

  useEffect(() => {
    if (!sidebarOpen) {
      document.body.classList.remove('overflow-hidden')
    } else {
      document.body.classList.add('overflow-hidden')
    }
  }, [sidebarOpen])
  return (
    <aside
      className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-background shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
    >
      <div className="flex items-center justify-between p-4 border-b h-16">
        <h1 className="text-xl font-bold">
          <img src="/logo.svg" alt="Omero Logo" width="150" />
          <span className="sr-only">Omero</span>
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <Button variant="ghost" className="w-full justify-start">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Pages
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="w-full justify-start">
              <Folder className="mr-2 h-4 w-4" />
              Categories
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Posts
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="w-full justify-start">
              <Tag className="mr-2 h-4 w-4" />
              Tags
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="w-full justify-start">
              <FolderOpen className="mr-2 h-4 w-4" />
              Files
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Authors
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </li>
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
