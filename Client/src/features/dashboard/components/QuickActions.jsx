import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus } from 'lucide-react'

export function QuickActions() {
  const actions = [
    { label: 'Add Student', value: 'add-student' },
    { label: 'Add Teacher', value: 'add-teacher' },
    { label: 'Create Class', value: 'create-class' },
    { label: 'Collect Payment', value: 'collect-payment' },
    { label: 'Take Attendance', value: 'take-attendance' },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Quick Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => (
          <DropdownMenuItem key={action.value}>
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
