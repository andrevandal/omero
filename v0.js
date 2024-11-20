import { useState } from 'react'
import { Menu, X, Home, Users, FileText, Settings, Search, FolderOpen, Tag, Folder, ChevronDown, LogOut, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from 'next/link'

export default function Component() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentOrg, setCurrentOrg] = useState("Acme Inc")

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold">CMS Admin</h1>
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
                <Menu className="h-6 w-6" />
              </Button>
              <div className="flex-1 flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-[200px] justify-between">
                      <Avatar className="w-6 h-6 mr-2">
                        <AvatarImage src={`https://avatar.vercel.sh/${currentOrg}.png`} alt={currentOrg} />
                        <AvatarFallback>{currentOrg[0]}</AvatarFallback>
                      </Avatar>
                      {currentOrg}
                      <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[300px]">
                    <DropdownMenuLabel>Switch Organization</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Input placeholder="Search organizations..." className="mb-2" />
                    <ScrollArea className="h-[200px]">
                      {["Acme Inc", "Globex Corp", "Initech", "Umbrella Corp", "Hooli", "Pied Piper"].map((org) => (
                        <DropdownMenuItem key={org} onSelect={() => setCurrentOrg(org)}>
                          <Avatar className="w-6 h-6 mr-2">
                            <AvatarImage src={`https://avatar.vercel.sh/${org}.png`} alt={org} />
                            <AvatarFallback>{org[0]}</AvatarFallback>
                          </Avatar>
                          {org}
                        </DropdownMenuItem>
                      ))}
                    </ScrollArea>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder-user.jpg" alt="User" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dashboard for {currentOrg}</h2>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">142</div>
                  <p className="text-xs text-muted-foreground">+12 this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Files</CardTitle>
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">524</div>
                  <p className="text-xs text-muted-foreground">48 GB used</p>
                </CardContent>
              </Card>
            </div>

            {/* Last Posts */}
            <Card className="mb-8">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Last Posts</CardTitle>
                <Input placeholder="Search posts..." className="w-[300px]" />
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { 
                      title: 'New React Hooks', 
                      slug: 'new-react-hooks',
                      authors: ['Alice Johnson', 'Bob Smith'],
                      category: 'Front-end', 
                      tags: ['react', 'javascript'], 
                      status: 'Published' 
                    },
                    { 
                      title: 'Serverless with Cloudflare', 
                      slug: 'serverless-with-cloudflare',
                      authors: ['Charlie Brown'],
                      category: 'Infrastructure', 
                      tags: ['cloudflare', 'typescript'], 
                      status: 'Draft' 
                    },
                    { 
                      title: 'ORM Comparison', 
                      slug: 'orm-comparison',
                      authors: ['Diana Prince', 'Eve Moneypenny'],
                      category: 'Back-end', 
                      tags: ['drizzle', 'typescript'], 
                      status: 'Review' 
                    },
                    { 
                      title: 'IaC with Pulumi', 
                      slug: 'iac-with-pulumi',
                      authors: ['Frank Castle'],
                      category: 'Infrastructure', 
                      tags: ['pulumi', 'typescript'], 
                      status: 'Published' 
                    },
                  ].map((post, index) => (
                    <div key={index} className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <Link href={`/post/${post.slug}`} className="text-lg font-medium hover:underline">
                          {post.title}
                        </Link>
                        <Badge>{post.status}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/category/${post.category.toLowerCase().replace(' ', '-')}`} passHref>
                          <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer">
                            {post.category}
                          </Badge>
                        </Link>
                        {post.tags.map((tag, tagIndex) => (
                          <Link key={tagIndex} href={`/tag/${tag}`} passHref>
                            <Badge variant="secondary" className="hover:bg-secondary/80 transition-colors cursor-pointer">
                              {tag}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        By: {post.authors.map((author, authorIndex) => (
                          <span key={authorIndex}>
                            {authorIndex > 0 && ", "}
                            <Link href={`/author/${author.toLowerCase().replace(' ', '-')}`} className="hover:underline">
                              {author}
                            </Link>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}