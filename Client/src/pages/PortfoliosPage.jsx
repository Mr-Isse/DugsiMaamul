import React, { useState, useMemo } from 'react'
import {
  FolderOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
} from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  useGetPortfoliosQuery,
  useCreatePortfolioMutation,
  useUpdatePortfolioMutation,
  useDeletePortfolioMutation,
  useGetStudentsQuery,
} from '@/services/api'

const PORTFOLIO_TYPES = [
  'Certificate',
  'Award',
  'Project',
  'Activity',
  'Achievement',
  'Other',
]

const PortfolioModal = ({ isOpen, initial, students, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    student: initial?.student?._id || initial?.student || '',
    items: initial?.items?.length > 0 
      ? initial.items.map(i => ({
          title: i.title || '',
          type: i.type || 'Certificate',
          description: i.description || '',
          date: i.date ? new Date(i.date).toISOString().split('T')[0] : '',
          remarks: i.remarks || '',
        }))
      : [{ title: '', type: 'Certificate', description: '', date: '', remarks: '' }],
    isPublic: initial?.isPublic || false,
  })

  const [createPortfolio, { isLoading: creating }] = useCreatePortfolioMutation()
  const [updatePortfolio, { isLoading: updating }] = useUpdatePortfolioMutation()

  const isEdit = Boolean(initial)

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { title: '', type: 'Certificate', description: '', date: '', remarks: '' }] })
  }

  const removeItem = (idx) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })
  }

  const updateItem = (idx, field, value) => {
    const updated = [...form.items]
    updated[idx] = { ...updated[idx], [field]: value }
    setForm({ ...form, items: updated })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!form.student) {
      return toast.error('Student is required')
    }
    
    const validItems = form.items.filter(i => i.title.trim())
    if (validItems.length === 0) {
      return toast.error('At least one item with title is required')
    }
    
    try {
      const payload = {
        student: form.student,
        items: validItems,
        isPublic: form.isPublic,
      }
      
      if (isEdit) {
        await updatePortfolio({ id: initial._id, ...payload }).unwrap()
        toast.success('Portfolio updated successfully')
      } else {
        await createPortfolio(payload).unwrap()
        toast.success('Portfolio created successfully')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.userMessage || err?.data?.message || 'Failed to save portfolio')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Portfolio' : 'New Portfolio'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update portfolio information' : 'Create a new student portfolio with multiple items'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student">Student *</Label>
            <select
              id="student"
              value={form.student}
              onChange={(e) => setForm({ ...form, student: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
              required
            >
              <option value="">Select student...</option>
              {students?.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.customId})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={form.isPublic}
              onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
              className="w-4 h-4"
            />
            <Label htmlFor="isPublic" className="cursor-pointer">Public Portfolio</Label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Portfolio Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </div>
            <div className="space-y-3">
              {form.items.map((item, idx) => (
                <div key={idx} className="p-4 border rounded-lg space-y-3 bg-gray-50 dark:bg-gray-800">
                  <div className="flex justify-between items-start">
                    <div className="grid grid-cols-2 gap-3 flex-1">
                      <div className="space-y-1">
                        <Label className="text-xs">Title *</Label>
                        <Input
                          value={item.title}
                          onChange={(e) => updateItem(idx, 'title', e.target.value)}
                          placeholder="Item title"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Type</Label>
                        <select
                          value={item.type}
                          onChange={(e) => updateItem(idx, 'type', e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-input bg-background"
                        >
                          {PORTFOLIO_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Date</Label>
                        <Input
                          type="date"
                          value={item.date}
                          onChange={(e) => updateItem(idx, 'date', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Remarks</Label>
                        <Input
                          value={item.remarks}
                          onChange={(e) => updateItem(idx, 'remarks', e.target.value)}
                          placeholder="Remarks"
                        />
                      </div>
                    </div>
                    {form.items.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)} className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      value={item.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      placeholder="Description..."
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating || updating}>
              {creating || updating ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const DeleteConfirmDialog = ({ isOpen, portfolio, onClose, onSuccess }) => {
  const [deletePortfolio, { isLoading }] = useDeletePortfolioMutation()

  const handleDelete = async () => {
    try {
      await deletePortfolio(portfolio._id).unwrap()
      toast.success('Portfolio deleted successfully')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.userMessage || err?.data?.message || 'Failed to delete portfolio')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle className="mb-2">Delete Portfolio</DialogTitle>
          <DialogDescription className="text-sm">
            Are you sure you want to delete the portfolio for <span className="font-bold">"{portfolio?.student?.name}"</span>?
            This action cannot be undone.
          </DialogDescription>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const PortfoliosPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)

  const { data: portfoliosData, isLoading, refetch } = useGetPortfoliosQuery()
  const { data: studentsData } = useGetStudentsQuery()

  const portfolios = Array.isArray(portfoliosData) ? portfoliosData : portfoliosData?.data || []
  const students = Array.isArray(studentsData) ? studentsData : studentsData?.data || []

  const filteredPortfolios = useMemo(() => {
    if (!portfolios) return []
    const q = searchTerm.toLowerCase()
    return portfolios.filter((p) => {
      if (searchTerm) {
        const match =
          (p.student?.name || '').toLowerCase().includes(q) ||
          (p.items || []).map(i => i.title).join(' ').toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [portfolios, searchTerm])

  const handleCreate = () => {
    setEditRecord(null)
    setIsModalOpen(true)
  }

  const handleEdit = (portfolio) => {
    setEditRecord(portfolio)
    setIsModalOpen(true)
  }

  const handleDelete = (portfolio) => {
    setDeleteRecord(portfolio)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Portfolios</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage student achievements, certificates, and projects
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Portfolio
          </Button>
        </div>
      </div>

      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by student name or item title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Types</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredPortfolios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No portfolios found
                </TableCell>
              </TableRow>
            ) : (
              filteredPortfolios.map((portfolio) => (
                <TableRow key={portfolio._id}>
                  <TableCell className="font-medium">
                    {portfolio.student?.name || 'Unknown Student'}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-purple-100 text-purple-700">
                      {portfolio.items?.length || 0} item{(portfolio.items?.length || 0) !== 1 ? 's' : ''}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {[...new Set(portfolio.items?.map(i => i.type))].join(', ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    {portfolio.isPublic ? (
                      <Badge className="bg-blue-100 text-blue-700">Public</Badge>
                    ) : (
                      <Badge variant="outline">Private</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(portfolio)}
                        className="h-8 w-8"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(portfolio)}
                        className="h-8 w-8 text-red-600 hover:text-red-700"
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

      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <PortfolioModal
            isOpen={isModalOpen}
            initial={editRecord}
            students={students}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => {
              refetch()
              setIsModalOpen(false)
            }}
          />
        </Dialog>
      )}

      {deleteRecord && (
        <Dialog open={Boolean(deleteRecord)} onOpenChange={() => setDeleteRecord(null)}>
          <DeleteConfirmDialog
            isOpen={Boolean(deleteRecord)}
            portfolio={deleteRecord}
            onClose={() => setDeleteRecord(null)}
            onSuccess={() => {
              refetch()
              setDeleteRecord(null)
            }}
          />
        </Dialog>
      )}
    </div>
  )
}

export default PortfoliosPage