import { useSelector, useDispatch } from 'react-redux'
import { Search, Globe, GitBranch, CalendarDays, X, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { setSelectedYear } from '@/store/slices/academicSlice'
import { setSelectedBranch } from '@/store/slices/tenantSlice'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function DashboardHeader({ onOpenMobileNav }) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { selectedYear, academicYears } = useSelector((state) => state.academic)
  const { selectedBranch, branches } = useSelector((state) => state.tenant)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'so', name: 'Somali' },
    { code: 'ar', name: 'Arabic' },
  ]

  const currentLanguage = 'en' // This would come from a language slice in the future

  const handleYearChange = (yearId) => {
    const year = academicYears.find(y => y._id === yearId)
    if (year) {
      dispatch(setSelectedYear(year))
    }
  }

  const handleBranchChange = (branchId) => {
    const branch = branches.find(b => b._id === branchId)
    if (branch) {
      dispatch(setSelectedBranch(branch))
    }
  }

  const handleLanguageChange = (langCode) => {
    // This would dispatch to a language slice in the future
    console.log('Language changed to:', langCode)
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left side - Mobile menu button and Search */}
        <div className="flex items-center gap-3 flex-1">
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={onOpenMobileNav}
            aria-label="Open navigation"
          >
            <Menu className="size-4" />
          </Button>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students, teachers, classes..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Right side - Selectors */}
        <div className="flex items-center gap-3">
          {/* Academic Year Selector */}
          {user?.role !== 'superadmin' && user?.role !== 'super_admin' && (
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedYear?._id || ''} onValueChange={handleYearChange}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Academic Year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears?.map((year) => (
                    <SelectItem key={year._id} value={year._id} className="text-xs">
                      {year.name || year.yearName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Branch Selector */}
          {user?.role !== 'superadmin' && user?.role !== 'super_admin' && branches?.length > 1 && (
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedBranch?._id || ''} onValueChange={handleBranchChange}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches?.map((branch) => (
                    <SelectItem key={branch._id} value={branch._id} className="text-xs">
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Select value={currentLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[100px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code} className="text-xs">
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>

      {/* Search Results Dropdown */}
      {searchOpen && searchQuery && (
        <div className="absolute top-16 left-4 right-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8 bg-background border rounded-lg shadow-lg p-4 z-50">
          <p className="text-sm text-muted-foreground mb-2">Search results for "{searchQuery}"</p>
          <p className="text-xs text-muted-foreground">No results found</p>
        </div>
      )}
    </header>
  )
}
