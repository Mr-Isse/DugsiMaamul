import React, { useState } from 'react'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useGetPlansQuery,
  useDeletePlanMutation
} from '@/services/api/superAdminApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function SuperAdminPlansPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: response, isLoading, refetch } = useGetPlansQuery({ search: searchTerm })
  const [deletePlan] = useDeletePlanMutation()

  const plans = response?.data || []

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) return
    try {
      await deletePlan(id).unwrap()
      toast.success('Plan deleted successfully')
      refetch()
    } catch (err) {
      toast.error('Failed to delete plan')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subscription Plans</h1>
          <p className="text-muted-foreground">Manage SaaS plans and billing configurations.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Plan
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search plans..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Billing Cycle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : plans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No plans found.
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => (
                <TableRow key={plan._id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>${plan.price}</TableCell>
                  <TableCell className="capitalize">{plan.billingCycle}</TableCell>
                  <TableCell>
                    <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(plan._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
