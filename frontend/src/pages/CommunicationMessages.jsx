import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Edit,
  Trash2,
  Send,
  Eye,
  Copy,
  MoreVertical,
  Filter,
  Search
} from 'lucide-react';
import {
  useGetCommunicationMessagesQuery,
  useCreateCommunicationMessageMutation,
  useUpdateCommunicationMessageMutation,
  useDeleteCommunicationMessageMutation,
  useDuplicateCommunicationMessageMutation,
  useSendCommunicationMessageMutation
} from '../store/adminApiSlice';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../components/ui/Dialog';
import { toast } from 'sonner';

const CommunicationMessages = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [messageForm, setMessageForm] = useState({
    title: '',
    subject: '',
    body: '',
    channels: ['in_app'],
    recipients: [],
    status: 'draft'
  });

  const { data: messages, isLoading, error, refetch } = useGetCommunicationMessagesQuery({
    status: statusFilter !== 'all' ? statusFilter : undefined
  });
  const [createMessage, { isLoading: isCreating }] = useCreateCommunicationMessageMutation();
  const [updateMessage, { isLoading: isUpdating }] = useUpdateCommunicationMessageMutation();
  const [deleteMessage] = useDeleteCommunicationMessageMutation();
  const [duplicateMessage] = useDuplicateCommunicationMessageMutation();
  const [sendMessage] = useSendCommunicationMessageMutation();

  const handleCreateMessage = async () => {
    if (!messageForm.title || !messageForm.body) {
      toast.error('Title and body are required');
      return;
    }
    try {
      await createMessage(messageForm).unwrap();
      toast.success('Message created successfully');
      setIsCreateDialogOpen(false);
      setMessageForm({ title: '', subject: '', body: '', channels: ['in_app'], recipients: [], status: 'draft' });
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err?.error || 'Failed to create message');
    }
  };

  const handleSendMessage = async (id) => {
    if (!confirm('Are you sure you want to send this message?')) return;
    try {
      await sendMessage(id).unwrap();
      toast.success('Message sent successfully');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err?.error || 'Failed to send message');
    }
  };

  const handleDuplicateMessage = async (id) => {
    try {
      await duplicateMessage(id).unwrap();
      toast.success('Message duplicated successfully');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err?.error || 'Failed to duplicate message');
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await deleteMessage(id).unwrap();
      toast.success('Message deleted successfully');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err?.error || 'Failed to delete message');
    }
  };

  const filteredMessages = messages?.data?.filter(m =>
    !searchQuery ||
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColors = {
    draft: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    scheduled: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    sent: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    delivered: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    failed: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-xl text-red-500">Failed to load messages</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Communication Messages
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Create, edit, and send communication messages
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
          <Plus size={18} />
          New Message
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3 items-center flex-1">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-80"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages?.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-12 text-center">
            <MessageSquare size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No messages yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Create your first communication message to get started
            </p>
          </div>
        ) : (
          filteredMessages?.map((message) => (
            <div
              key={message._id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
            >
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{message.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColors[message.status] || statusColors.draft}`}>
                      {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">
                    {message.body}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {new Date(message.createdAt).toLocaleDateString()} • {message.channels?.join(', ') || 'in_app'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {message.status === 'draft' && (
                    <Button
                      variant="default"
                      onClick={() => handleSendMessage(message._id)}
                      className="flex items-center gap-2"
                    >
                      <Send size={16} />
                      Send
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => setEditingMessage(message)} className="flex items-center gap-2">
                    <Edit size={16} />
                  </Button>
                  <Button variant="ghost" onClick={() => handleDuplicateMessage(message._id)} className="flex items-center gap-2">
                    <Copy size={16} />
                  </Button>
                  <Button variant="ghost" onClick={() => handleDeleteMessage(message._id)} className="flex items-center gap-2 text-red-500 hover:text-red-600">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      {(isCreateDialogOpen || editingMessage) && (
        <Dialog open={isCreateDialogOpen || !!editingMessage} onOpenChange={() => {
          setIsCreateDialogOpen(false);
          setEditingMessage(null);
        }}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {editingMessage ? 'Edit Message' : 'Create New Message'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <Input
                  value={editingMessage?.title || messageForm.title}
                  onChange={(e) => {
                    if (editingMessage) {
                      setEditingMessage({ ...editingMessage, title: e.target.value });
                    } else {
                      setMessageForm({ ...messageForm, title: e.target.value });
                    }
                  }}
                  placeholder="Message title"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Subject (for email)
                </label>
                <Input
                  value={editingMessage?.subject || messageForm.subject}
                  onChange={(e) => {
                    if (editingMessage) {
                      setEditingMessage({ ...editingMessage, subject: e.target.value });
                    } else {
                      setMessageForm({ ...messageForm, subject: e.target.value });
                    }
                  }}
                  placeholder="Email subject"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Body
                </label>
                <textarea
                  value={editingMessage?.body || messageForm.body}
                  onChange={(e) => {
                    if (editingMessage) {
                      setEditingMessage({ ...editingMessage, body: e.target.value });
                    } else {
                      setMessageForm({ ...messageForm, body: e.target.value });
                    }
                  }}
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Write your message here..."
                />
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button variant="ghost" onClick={() => {
                setIsCreateDialogOpen(false);
                setEditingMessage(null);
              }}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (editingMessage) {
                    await updateMessage({ id: editingMessage._id, ...editingMessage }).unwrap();
                    toast.success('Message updated');
                    setEditingMessage(null);
                  } else {
                    await handleCreateMessage();
                  }
                  refetch();
                }}
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating ? 'Saving...' : 'Save Draft'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CommunicationMessages;
