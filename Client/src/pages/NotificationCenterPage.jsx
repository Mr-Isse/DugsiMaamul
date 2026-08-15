import React, { useState, useMemo } from 'react'
import {
  Bell,
  Plus,
  Search,
  CheckCircle,
  Trash2,
  Mail,
  Phone,
  MessageCircle,
  MonitorSmartphone,
  Send,
  Filter,
  AlertCircle,
  X,
  Users,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  useGetNotificationsQuery,
  useGetNotificationHistoryQuery,
  useGetNotificationRecipientsQuery,
  useCreateNotificationMutation,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} from '@/services/api'

const TYPE_OPTIONS = [
  { value: 'info', label: 'Info' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'success', label: 'Success' },
  { value: 'warning', label: 'Warning' },
  { value: 'danger', label: 'Danger' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'finance', label: 'Finance' },
  { value: 'exam', label: 'Exam' },
]

const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'All Users' },
  { value: 'student', label: 'Students' },
  { value: 'teacher', label: 'Teachers' },
  { value: 'parent', label: 'Parents' },
  { value: 'admin', label: 'Admins' },
  { value: 'selected', label: 'Selected Users' },
]

const CHANNEL_OPTIONS = [
  { value: 'in_app', label: 'In App', icon: Bell },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'sms', label: 'SMS', icon: Phone },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { value: 'push', label: 'Push', icon: MonitorSmartphone },
]

const TYPE_COLORS = {
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  announcement: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  attendance: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  finance: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  exam: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
}

const NotificationModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'announcement',
    priority: 'normal',
    audience: 'all',
    recipientIds: [],
    channels: ['in_app'],
    actionLink: '',
  })

  const { data: recipientsData } = useGetNotificationRecipientsQuery(form.audience === 'selected' ? 'all' : form.audience)
  const recipients = Array.isArray(recipientsData) ? recipientsData : recipientsData?.data || []

  const [createNotification, { isLoading: sending }] = useCreateNotificationMutation()

  const toggleChannel = (channel) => {
    setForm((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }))
  }

  const toggleRecipient = (id) => {
    setForm((prev) => ({
      ...prev,
      recipientIds: prev.recipientIds.includes(id)
        ? prev.recipientIds.filter((item) => item !== id)
        : [...prev.recipientIds, id],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title is required')
    if (!form.message.trim()) return toast.error('Message is required')
    try {
      await createNotification(form).unwrap()
      toast.success('Notification sent successfully')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to send notification')
    }
  }

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Send Notification</DialogTitle>
        <DialogDescription>Create and send a notification to users</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Notification title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message *</Label>
          <Textarea
            id="message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Enter your message..."
            rows={4}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={form.priority} onValueChange={(value) => setForm({ ...form, priority: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="audience">Audience</Label>
          <Select value={form.audience} onValueChange={(value) => setForm({ ...form, audience: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AUDIENCE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {form.audience === 'selected' && (
          <div className="space-y-2">
            <Label>Select Recipients</Label>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 max-h-40 overflow-y-auto">
              {recipients.length === 0 ? (
                <p className="text-sm text-gray-500">No recipients available</p>
              ) : (
                <div className="space-y-2">
                  {recipients.map((recipient) => (
                    <label key={recipient._id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.recipientIds.includes(recipient._id)}
                        onChange={() => toggleRecipient(recipient._id)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{recipient.name || recipient.email}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Channels</Label>
          <div className="flex flex-wrap gap-2">
            {CHANNEL_OPTIONS.map((channel) => (
              <button
                key={channel.value}
                type="button"
                onClick={() => toggleChannel(channel.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                  form.channels.includes(channel.value)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <channel.icon className="h-4 w-4" />
                {channel.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="actionLink">Action Link (Optional)</Label>
          <Input
            id="actionLink"
            value={form.actionLink}
            onChange={(e) => setForm({ ...form, actionLink: e.target.value })}
            placeholder="https://example.com/page"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={sending}>
            {sending ? 'Sending...' : 'Send Notification'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

const DeleteConfirmDialog = ({ notification, onClose, onSuccess }) => {
  const [deleteNotification, { isLoading }] = useDeleteNotificationMutation()

  const handleDelete = async () => {
    try {
      await deleteNotification(notification._id).unwrap()
      toast.success('Notification deleted')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete notification')
    }
  }

  return (
    <DialogContent className="max-w-sm">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <DialogTitle>Delete Notification</DialogTitle>
        <DialogDescription className="mt-2">
          Are you sure you want to delete this notification?
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

const NotificationCenterPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteRecord, setDeleteRecord] = useState(null)
  const [activeTab, setActiveTab] = useState('inbox')

  const { data: notificationsData, isLoading: loadingInbox, refetch } = useGetNotificationsQuery()
  const { data: historyData, isLoading: loadingHistory } = useGetNotificationHistoryQuery()

  const [markAllRead] = useMarkAllAsReadMutation()
  const [markRead] = useMarkAsReadMutation()

  const notifications = Array.isArray(notificationsData) ? notificationsData : notificationsData?.data || []
  const history = Array.isArray(historyData) ? historyData : historyData?.data || []

  const filteredHistory = useMemo(() => {
    if (!history) return []
    return history.filter((item) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (item.title || '').toLowerCase().includes(q) ||
          (item.message || '').toLowerCase().includes(q) ||
          (item.recipient?.name || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (typeFilter !== 'all' && item.type !== typeFilter) return false
      return true
    })
  }, [history, searchTerm, typeFilter])

  const stats = useMemo(() => ({
    total: history.length,
    unread: notifications.filter((n) => n.status === 'unread').length,
    read: notifications.filter((n) => n.status !== 'unread').length,
    channels: [...new Set(history.flatMap((n) => n.channels || []))].length,
  }), [history, notifications])

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap()
      toast.success('All notifications marked as read')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to mark all as read')
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await markRead(id).unwrap()
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to mark as read')
    }
  }

  const handleDelete = (notification) => {
    setDeleteRecord(notification)
  }

  if (loadingInbox || loadingHistory) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Center</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create, send, and review school notifications
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleMarkAllRead} disabled={!stats.unread} className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Mark All Read
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Send Notification
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Unread
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.unread}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Read
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.read}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Channels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.channels}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('inbox')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'inbox'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Inbox ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          History ({history.length})
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3 items-center flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {activeTab === 'history' && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {activeTab === 'inbox' ? (
          notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No notifications
              </h3>
              <p className="text-gray-500 dark:text-gray-400">Your inbox is empty</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification._id}>
                    <TableCell className="font-medium">{notification.title}</TableCell>
                    <TableCell>
                      <Badge className={TYPE_COLORS[notification.type] || TYPE_COLORS.info}>
                        {notification.type?.charAt(0).toUpperCase() + notification.type?.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={notification.status === 'unread' ? 'default' : 'outline'}>
                        {notification.status?.charAt(0).toUpperCase() + notification.status?.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500 dark:text-gray-400">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {notification.status === 'unread' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkRead(notification._id)}
                            title="Mark as read"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(notification)}
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
          )
        ) : (
          <>
            {filteredHistory.length === 0 ? (
              <div className="p-12 text-center">
                <Send className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No history found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || typeFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'No notifications have been sent yet'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Channels</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        <Badge className={TYPE_COLORS[item.type] || TYPE_COLORS.info}>
                          {item.type?.charAt(0).toUpperCase() + item.type?.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {item.channels?.map((channel) => (
                            <Badge key={channel} variant="outline" className="text-xs">
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500 dark:text-gray-400">
                        {item.recipientCount || item.recipients?.length || '—'}
                      </TableCell>
                      <TableCell className="text-gray-500 dark:text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(item)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {isModalOpen && (
        <NotificationModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => refetch()}
        />
      )}

      {deleteRecord && (
        <DeleteConfirmDialog
          notification={deleteRecord}
          onClose={() => setDeleteRecord(null)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  )
}

export default NotificationCenterPage
