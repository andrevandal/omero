import ProjectSwitcher from './ProjectSwitcher'
import { MainNav } from './MainNav'
import UserNav from './UserNav'

const Header = () => {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center px-4 gap-2">
        <ProjectSwitcher />
        <MainNav className="mx-6" />
        <div className="ml-auto flex items-center space-x-4">
          <UserNav />
        </div>
      </div>
    </header>
  )
}

export default Header
