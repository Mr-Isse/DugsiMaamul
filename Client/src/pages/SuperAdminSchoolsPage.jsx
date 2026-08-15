import React, { useState } from 'react'
import { Plus, Search, Edit2, Trash2, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useGetSchoolsQuery,
  useToggleSchoolBlockMutation,
  useDeleteSchoolMutation
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

export default function SuperAdminSchoolsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: response, isLoading, refetch } = useGetSchoolsQuery({ search: searchTerm })
  const [toggleBlock] = useToggleSchoolBlockMutation()
  const [deleteSchool] = useDeleteSchoolMutation()

  const schools = response?.data || []

  const handleToggleBlock = async (id, currentStatus) => {
    try {
      await toggleBlock(id).unwrap()
      toast.success(`School ${currentStatus === 'Blocked' ? 'unblocked' : 'blocked'} successfully`)
      refetch()
    } catch (err) {
      toast.error('Failed to update school status')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this school? This action cannot be undone.')) return
    try {
      await deleteSchool(id).unwrap()
      toast.success('School deleted successfully')
      refetch()
    } catch (err) {
      toast.error('Failed to delete school')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Schools Management</h1>
          <p className="text-muted-foreground">Manage all registered schools in the platform.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add School
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search schools..."
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
              <TableHead>School Name</TableHead>
              <TableHead>Subdomain</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : schools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No schools found.
                </TableCell>
              </TableRow>
            ) : (
              schools.map((school) => (
                <TableRow key={school._id}>
                  <TableCell className="font-medium">{school.name}</TableCell>
                  <TableCell>{school.subdomain}</TableCell>
                  <TableCell>
                    <Badge variant={school.status === 'Active' ? 'default' : school.status === 'Blocked' ? 'destructive' : 'secondary'}>
                      {school.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{school.subscription?.plan?.name || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleBlock(school._id, school.status)}
                      >
                        {school.status === 'Blocked' ? (
                          <><CheckCircle2 className="h-4 w-4 mr-1" /> Unblock</>
                        ) : (
                          <><ShieldAlert className="h-4 w-4 mr-1" /> Block</>
                        )}
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(school._id)}
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
