import React, { useState, useMemo } from 'react'
import { Plus, Search, Edit2, Trash2, AlertCircle, RefreshCw, IdCard, Printer, CheckCircle, XCircle, Eye, Filter } from 'lucide-react'
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
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import {
  useGetIdCardsQuery,
  useCreateIdCardMutation,
  useUpdateIdCardMutation,
  useDeleteIdCardMutation,
  useUpdateIdCardStatusMutation,
  useMarkIdCardPrintedMutation,
  useGetUsersForIdCardQuery,
  useGetIdCardDesignsQuery,
  useCreateIdCardDesignMutation,
} from '@/services/api'

const ID_CARD_STATUSES = ['active', 'inactive', 'expired', 'suspended']

const statusConfig = {
  active: { label: 'Active', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20', icon: CheckCircle },
  inactive: { label: 'Inactive', color: 'text-slate-500 bg-slate-50 dark:bg-slate-800', icon: XCircle },
  expired: { label: 'Expired', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20', icon: XCircle },
  suspended: { label: 'Suspended', color: 'text-red-600 bg-red-50 dark:bg-red-900/20', icon: XCircle },
}

const IdCardModal = ({ isOpen, initial, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    userId: initial?.user?._id || initial?.userId || '',
    type: initial?.type || 'student',
    expiryDate: initial?.expiryDate || '',
    designId: initial?.designId || '',
    notes: initial?.notes || '',
  })

  const { data: usersData } = useGetUsersForIdCardQuery()
  const { data: designsData } = useGetIdCardDesignsQuery()
  const users = Array.isArray(usersData) ? usersData : usersData?.data || []
  const designs = Array.isArray(designsData) ? designsData : designsData?.data || []

  const [generateIdCard, { isLoading: creating }] = useCreateIdCardMutation()
  const [updateIdCard, { isLoading: updating }] = useUpdateIdCardMutation()

  const isEdit = Boolean(initial)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!form.userId) {
      return toast.error('User is required')
    }
    
    try {
      const payload = {
        ...form,
      }
      
      if (isEdit) {
        await updateIdCard({ id: initial._id, ...payload }).unwrap()
        toast.success('ID card updated')
      } else {
        await generateIdCard(payload).unwrap()
        toast.success('ID card generated')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.userMessage || err?.data?.message || 'Failed to save ID card')
    }
  }
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit ID Card' : 'Generate ID Card'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update ID card information' : 'Generate a new ID card'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user">User *</Label>
            <select
              id="user"
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
              required
            >
              <option value="">Select user</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name || `${user.firstName} ${user.lastName || ''}`} ({user.role}) - {user.customId}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <select
              id="type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
              required
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              type="date"
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            />
          </div>

          {designs.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="design">Design</Label>
              <Select value={form.designId} onValueChange={(v) => setForm({ ...form, designId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Design" />
                </SelectTrigger>
                <SelectContent>
                  {designs.map((design) => (
                    <SelectItem key={design._id} value={design._id}>
                      {design.type.charAt(0).toUpperCase() + design.type.slice(1)} - {design.layout}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Internal notes..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating || updating}>
              {creating || updating ? 'Saving...' : isEdit ? 'Update ID Card' : 'Generate ID Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const DeleteConfirmDialog = ({ isOpen, idCard, onClose, onSuccess }) => {
  const [deleteIdCard, { isLoading }] = useDeleteIdCardMutation()

  const handleDelete = async () => {
    try {
      await deleteIdCard(idCard._id).unwrap()
      toast.success('ID card deleted')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete ID card')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle>Delete ID Card</DialogTitle>
          <DialogDescription className="mt-2">
            Are you sure you want to delete this ID card?
            This action cannot be undone.
          </DialogDescription>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const IdCardsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)
  const [selectedIDCard, setSelectedIDCard] = useState(null)

  const { data: idCardsData, isLoading, refetch } = useGetIdCardsQuery({
    status: statusFilter === 'all' ? undefined : statusFilter,
    type: typeFilter === 'all' ? undefined : typeFilter,
    search: searchTerm || undefined,
  })
  const idCards = Array.isArray(idCardsData?.data) ? idCardsData.data : Array.isArray(idCardsData) ? idCardsData : []

  const [updateIdCardStatus] = useUpdateIdCardStatusMutation()
  const [markIdCardPrinted] = useMarkIdCardPrintedMutation()

  const stats = useMemo(() => ({
    total: idCards.length,
    active: idCards.filter((c) => c.status === 'active').length,
    inactive: idCards.filter((c) => c.status === 'inactive').length,
    printed: idCards.filter((c) => c.printed).length,
  }), [idCards])

  const handleCreate = () => {
    setEditRecord(null)
    setIsModalOpen(true)
  }

  const handleEdit = (idCard) => {
    setEditRecord(idCard)
    setIsModalOpen(true)
  }

  const handleDelete = (idCard) => {
    setDeleteRecord(idCard)
  }

  const handleStatusChange = async (idCard, newStatus) => {
    try {
      await updateIdCardStatus({ id: idCard._id, status: newStatus }).unwrap()
      toast.success('Status updated')
      refetch()
    } catch (err) {
      toast.error(err?.data?.userMessage || err?.data?.message || 'Failed to update status')
    }
  }

  const handleMarkPrinted = async (idCard) => {
    try {
      await markIdCardPrinted(idCard._id).unwrap()
      toast.success('ID card marked as printed')
      refetch()
    } catch (err) {
      toast.error(err?.data?.userMessage || err?.data?.message || 'Failed to mark as printed')
    }
  }

  const handlePreview = (idCard) => {
    setSelectedIDCard(idCard)
    setIsPreviewModalOpen(true)
  }

  const handlePrint = async (idCard) => {
    let iframe

    try {
      const userInfoStr = localStorage.getItem('userInfo')
      const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null
      const token = userInfo?.token
      const selectedBranch = localStorage.getItem('selectedBranch')
      const selectedYear = localStorage.getItem('selectedYear')
      
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      if (userInfo?.school?.subdomain) {
        headers['X-School-Slug'] = userInfo.school.subdomain
        headers['X-Tenant-ID'] = userInfo.school.subdomain
      }
      if (selectedBranch) {
        const parsedBranch = JSON.parse(selectedBranch)
        const branchId = typeof parsedBranch === 'object' ? parsedBranch?._id : parsedBranch
        if (branchId) {
          headers['x-branch-id'] = branchId
        }
      }
      if (selectedYear) {
        const parsedYear = JSON.parse(selectedYear)
        const yearId = typeof parsedYear === 'object' ? parsedYear?._id : parsedYear
        if (yearId) {
          headers['x-academic-year-id'] = yearId
        }
      }

      const response = await fetch(`/api/v1/admin/id-cards/${idCard._id}/preview`, {
        headers,
        credentials: 'include'
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to generate printable ID card')
      }

      const html = await response.text()

      iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.right = '0'
      iframe.style.bottom = '0'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = '0'
      document.body.appendChild(iframe)
      
      iframe.contentWindow.document.open()
      iframe.contentWindow.document.write(html)
      iframe.contentWindow.document.close()

      const waitForPrintFrameReady = async (iframe) => {
        const frameWindow = iframe.contentWindow
        const frameDocument = frameWindow?.document

        if (!frameWindow || !frameDocument) {
          throw new Error('Print frame is not available')
        }

        const waitForDocumentReady = async () => {
          const maxWaitMs = 10000
          const startedAt = Date.now()

          while (frameDocument.readyState !== 'complete') {
            if (Date.now() - startedAt > maxWaitMs) {
              throw new Error('Timed out waiting for printable document')
            }
            await new Promise((resolve) => setTimeout(resolve, 50))
          }
        }

        const waitForImages = async () => {
          const images = Array.from(frameDocument.images || [])
          await Promise.all(
            images.map((image) => {
              if (image.complete) return Promise.resolve()
              return new Promise((resolve) => {
                const done = () => resolve()
                image.addEventListener('load', done, { once: true })
                image.addEventListener('error', done, { once: true })
              })
            })
          )
        }

        await waitForDocumentReady()
        if (frameDocument.fonts?.ready) {
          try {
            await frameDocument.fonts.ready
          } catch {
            // Continue printing even if font readiness fails
          }
        }
        await waitForImages()
        await new Promise((resolve) => frameWindow.requestAnimationFrame(() => frameWindow.requestAnimationFrame(resolve)))
      }

      await waitForPrintFrameReady(iframe)

      const printWindow = iframe.contentWindow
      let cleanedUp = false

      const cleanup = () => {
        if (cleanedUp) return
        cleanedUp = true
        if (iframe?.parentNode) {
          iframe.parentNode.removeChild(iframe)
        }
      }

      printWindow.onafterprint = async () => {
        cleanup()
        try {
          await markIdCardPrinted(idCard._id).unwrap()
          refetch()
        } catch (markError) {
          console.error(markError)
          toast.error('Printed, but failed to update print status')
        }
      }

      setTimeout(cleanup, 30000)
      printWindow.focus()
      printWindow.print()
    } catch (error) {
      toast.error('Failed to print ID card')
      console.error(error)
      if (iframe?.parentNode) {
        iframe.parentNode.removeChild(iframe)
      }
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.inactive
    const Icon = config.icon
    return (
      <Badge className={config.color}>
        <Icon size={10} className="mr-1" />
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <IdCard className="text-indigo-600" size={28} />
            ID Cards
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate and manage student, teacher, and staff ID cards
          </p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Generate ID Card
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'indigo' },
          { label: 'Active', value: stats.active, color: 'emerald' },
          { label: 'Inactive', value: stats.inactive, color: 'slate' },
          { label: 'Printed', value: stats.printed, color: 'amber' },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-6">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
              <p className={`text-2xl font-bold mt-1 text-${color}-600 dark:text-${color}-400`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or ID number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-500" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-500" />
                  <SelectValue placeholder="Type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : idCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <IdCard className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' ? 'No ID cards found' : 'No ID cards yet'}
          </p>
          {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
            <Button variant="outline" size="sm" onClick={handleCreate} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Generate First ID Card
            </Button>
          )}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Card Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Printed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {idCards.map((idCard) => {
                  const user = idCard.user || idCard.userSnapshot || {}
                  return (
                    <TableRow key={idCard._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.profileImage?.url || user.imageUrl} />
                            <AvatarFallback className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                              {user.name?.charAt(0)?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name || 'Unknown'}</p>
                            <p className="text-xs text-indigo-600 dark:text-indigo-400">{user.customId || user.email || ''}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                          {idCard.cardNumber}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{idCard.type?.charAt(0)?.toUpperCase() + idCard.type?.slice(1) || 'Student'}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(idCard.status)}</TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-500">{formatDate(idCard.issueDate)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-500">{formatDate(idCard.expiryDate)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={idCard.printed ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-500 bg-slate-50 dark:bg-slate-800'}>
                          {idCard.printed ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handlePreview(idCard)} title="Preview">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handlePrint(idCard)} title="Print">
                            <Printer className="h-4 w-4" />
                          </Button>
                          {!idCard.printed && (
                            <Button variant="ghost" size="icon" onClick={() => handleMarkPrinted(idCard)} title="Mark as Printed">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {idCard.status !== 'active' ? (
                            <Button variant="ghost" size="icon" onClick={() => handleStatusChange(idCard, 'active')} title="Activate">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="icon" onClick={() => handleStatusChange(idCard, 'inactive')} title="Deactivate">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(idCard)} title="Edit">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(idCard)} className="text-red-600" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <IdCardModal
            isOpen={isModalOpen}
            initial={editRecord}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => {
              refetch()
              setIsModalOpen(false)
            }}
          />
        </Dialog>
      )}

      {deleteRecord && (
        <Dialog open={!!deleteRecord} onOpenChange={() => setDeleteRecord(null)}>
          <DeleteConfirmDialog
            isOpen={!!deleteRecord}
            idCard={deleteRecord}
            onClose={() => setDeleteRecord(null)}
            onSuccess={() => {
              refetch()
              setDeleteRecord(null)
            }}
          />
        </Dialog>
      )}

      {/* Preview Modal */}
      {isPreviewModalOpen && selectedIDCard && (
        <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>ID Card Preview - {selectedIDCard.user?.name || selectedIDCard.userSnapshot?.name}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="w-[510px] mx-auto bg-white rounded-xl shadow-xl overflow-hidden border-2 border-blue-800">
                <div className="bg-gradient-to-r from-blue-800 to-blue-500 text-white p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedIDCard.school?.logo && (
                      <img 
                        src={selectedIDCard.school.logo.url || selectedIDCard.school.logo} 
                        alt={selectedIDCard.school.name} 
                        className="w-11 h-11 rounded-full object-cover border-2 border-white"
                      />
                    )}
                    <span className="text-sm font-bold">{selectedIDCard.school?.name}</span>
                  </div>
                  <span className="text-sm font-bold">جامعة جمهورية</span>
                </div>
                <div className="p-4 flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-[120px] h-[140px] bg-blue-100 rounded-lg border-2 border-blue-800 flex items-center justify-center">
                      <Avatar className="w-full h-full rounded-lg">
                        <AvatarImage src={selectedIDCard.user?.profileImage?.url || selectedIDCard.userSnapshot?.profileImage} className="object-cover" />
                        <AvatarFallback className="text-4xl bg-blue-50 text-blue-800">
                          {(selectedIDCard.user?.name || selectedIDCard.userSnapshot?.name)?.charAt(0)?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <span className="bg-blue-800 text-white px-3 py-1 font-bold text-sm rounded-t-md inline-block w-fit">
                      {selectedIDCard.type ? selectedIDCard.type.charAt(0).toUpperCase() + selectedIDCard.type.slice(1) : 'Student'}
                    </span>
                    <div className="border-2 border-blue-800 rounded-b-md rounded-tr-md p-2 bg-white">
                      <div className="flex text-xs mb-1">
                        <span className="font-bold text-blue-800 w-20">Name:</span>
                        <span>{selectedIDCard.user?.name || selectedIDCard.userSnapshot?.name}</span>
                      </div>
                      <div className="flex text-xs mb-1">
                        <span className="font-bold text-blue-800 w-20">ID No:</span>
                        <span>{selectedIDCard.user?.customId || selectedIDCard.cardNumber}</span>
                      </div>
                      {selectedIDCard.user?.class && (
                        <div className="flex text-xs mb-1">
                          <span className="font-bold text-blue-800 w-20">Class:</span>
                          <span>{selectedIDCard.user.class.name || selectedIDCard.user.class}</span>
                        </div>
                      )}
                      {selectedIDCard.user?.phone && (
                        <div className="flex text-xs mb-1">
                          <span className="font-bold text-blue-800 w-20">Mobile:</span>
                          <span>{selectedIDCard.user.phone}</span>
                        </div>
                      )}
                      <div className="flex text-xs">
                        <span className="font-bold text-blue-800 w-20">Expires:</span>
                        <span>{formatDate(selectedIDCard.expiryDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPreviewModalOpen(false)}>Close</Button>
              <Button onClick={() => handlePrint(selectedIDCard)}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default IdCardsPage