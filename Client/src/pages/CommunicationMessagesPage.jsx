import React, { useState, useMemo } from 'react'
import {
  MessageSquare,
  Plus,
  Search,
  Edit2,
  Trash2,
  Send,
  Copy,
  Eye,
  Filter,
  AlertCircle,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  useGetCommunicationMessagesQuery,
  useCreateCommunicationMessageMutation,
  useUpdateCommunicationMessageMutation,
  useDeleteCommunicationMessageMutation,
  useDuplicateCommunicationMessageMutation,
  useSendCommunicationMessageMutation,
} from '@/services/api'

const STATUS_STYLES = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  sent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

const CHANNEL_OPTIONS = [
  { value: 'in_app', label: 'In App' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'WhatsApp' },
]

const MessageModal = ({ initial, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    title: initial?.title || '',
    subject: initial?.subject || '',
    body: initial?.body || '',
    channels: initial?.channels || ['in_app'],
    recipients: initial?.recipients || [],
    status: initial?.status || 'draft',
  })

  const [createMessage, { isLoading: creating }] = useCreateCommunicationMessageMutation()
  const [updateMessage, { isLoading: updating }] = useUpdateCommunicationMessageMutation()

  const isEdit = Boolean(initial)

  const toggleChannel = (channel) => {
    setForm((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title is required')
    if (!form.body.trim()) return toast.error('Message body is required')
    try {
      if (isEdit) {
        await updateMessage({ id: initial._id, ...form }).unwrap()
        toast.success('Message updated')
      } else {
        await createMessage(form).unwrap()
        toast.success('Message created')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save message')
    }
  }

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Message' : 'New Message'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Update communication message' : 'Create a new communication message'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Message title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="Email subject (if applicable)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">Message Body *</Label>
          <Textarea
            id="body"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="Enter your message content..."
            rows={6}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Channels</Label>
          <div className="flex flex-wrap gap-2">
            {CHANNEL_OPTIONS.map((channel) => (
              <button
                key={channel.value}
                type="button"
                onClick={() => toggleChannel(channel.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  form.channels.includes(channel.value)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {channel.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={form.status}
            onValueChange={(value) => setForm({ ...form, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={creating || updating}>
            {creating || updating ? 'Saving...' : 'Save Message'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

const DeleteConfirmDialog = ({ message, onClose, onSuccess }) => {
  const [deleteMessage, { isLoading }] = useDeleteCommunicationMessageMutation()

  const handleDelete = async () => {
    try {
      await deleteMessage(message._id).unwrap()
      toast.success('Message deleted')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete message')
    }
  }

  return (
    <DialogContent className="max-w-sm">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <DialogTitle>Delete Message</DialogTitle>
        <DialogDescription className="mt-2">
          Are you sure you want to delete <span className="font-bold">"{message.title}"</span>?
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
  )
}

const CommunicationMessagesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)

  const { data: messagesData, isLoading, refetch } = useGetCommunicationMessagesQuery({
    status: statusFilter !== 'all' ? statusFilter : undefined,
  })
  const messages = Array.isArray(messagesData) ? messagesData : messagesData?.data || []

  const [duplicateMessage] = useDuplicateCommunicationMessageMutation()
  const [sendMessage] = useSendCommunicationMessageMutation()

  const filteredMessages = useMemo(() => {
    if (!messages) return []
    return messages.filter((msg) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (msg.title || '').toLowerCase().includes(q) ||
          (msg.body || '').toLowerCase().includes(q) ||
          (msg.subject || '').toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [messages, searchTerm])

  const handleCreate = () => {
    setEditRecord(null)
    setIsModalOpen(true)
  }

  const handleEdit = (message) => {
    setEditRecord(message)
    setIsModalOpen(true)
  }

  const handleDelete = (message) => {
    setDeleteRecord(message)
  }

  const handleDuplicate = async (message) => {
    try {
      await duplicateMessage(message._id).unwrap()
      toast.success('Message duplicated')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to duplicate message')
    }
  }

  const handleSend = async (message) => {
    if (!confirm(`Are you sure you want to send "${message.title}"?`)) return
    try {
      await sendMessage(message._id).unwrap()
      toast.success('Message sent successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to send message')
    }
  }

  const stats = useMemo(() => ({
    total: messages.length,
    draft: messages.filter((m) => m.status === 'draft').length,
    scheduled: messages.filter((m) => m.status === 'scheduled').length,
    sent: messages.filter((m) => m.status === 'sent').length,
  }), [messages])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Communication Messages</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create, edit, and send communication messages
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New Message
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Drafts</div>
          <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Scheduled</div>
          <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Sent</div>
          <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3 items-center flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredMessages.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No messages found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first message to get started'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Channels</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMessages.map((message) => (
                <TableRow key={message._id}>
                  <TableCell className="font-medium">{message.title}</TableCell>
                  <TableCell className="text-gray-500 dark:text-gray-400">
                    {message.subject || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_STYLES[message.status] || STATUS_STYLES.draft}>
                      {message.status?.charAt(0).toUpperCase() + message.status?.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {message.channels?.map((channel) => (
                        <Badge key={channel} variant="outline" className="text-xs">
                          {channel}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500 dark:text-gray-400">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {message.status === 'draft' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSend(message)}
                          title="Send message"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDuplicate(message)}
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(message)}
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(message)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modals */}
      {isModalOpen && (
        <MessageModal
          initial={editRecord}
          onClose={() => {
            setIsModalOpen(false)
            setEditRecord(null)
          }}
          onSuccess={() => refetch()}
        />
      )}

      {deleteRecord && (
        <DeleteConfirmDialog
          message={deleteRecord}
          onClose={() => setDeleteRecord(null)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  )
}

export default CommunicationMessagesPage
