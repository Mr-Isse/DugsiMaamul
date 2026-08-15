import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CheckCircle,
  ClipboardCheck,
  CreditCard,
  Mail,
  Megaphone,
  MessageCircle,
  MonitorSmartphone,
  Phone,
  Plus,
  Search,
  Send,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import {
  useCreateNotificationMutation,
  useDeleteNotificationMutation,
  useGetNotificationHistoryQuery,
  useGetNotificationTemplatesQuery,
  useGetNotificationRecipientsQuery,
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from '../store/adminApiSlice';
import { socket, connectSocket } from '../utils/socket';
import { toast } from 'sonner';
import {
  DugsiButton,
  DugsiCard,
  DugsiEmptyState,
  DugsiHeader,
  DugsiPage,
  DugsiStatCard,
  dugsiFieldClass,
  dugsiLabelClass,
} from '../components/DugsiUI';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { cn } from '../lib/utils';

const typeOptions = ['info', 'announcement', 'success', 'warning', 'danger', 'attendance', 'finance', 'exam'];
const audienceOptions = [
  { value: 'all', label: 'All Users' },
  { value: 'student', label: 'Students' },
  { value: 'teacher', label: 'Teachers' },
  { value: 'parent', label: 'Parents' },
  { value: 'admin', label: 'Admins' },
  { value: 'selected', label: 'Selected Users' },
];
const channelOptions = [
  { value: 'in_app', label: 'In App', icon: Bell },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'sms', label: 'SMS', icon: Phone },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { value: 'push', label: 'Push', icon: MonitorSmartphone },
];

const typeIcons = {
  info: Bell,
  warning: Bell,
  success: CheckCircle,
  danger: Bell,
  announcement: Megaphone,
  attendance: ClipboardCheck,
  finance: CreditCard,
  exam: Bell,
};

const initialForm = {
  title: '',
  message: '',
  type: 'announcement',
  priority: 'normal',
  audience: 'all',
  recipientIds: [],
  channels: ['in_app'],
  actionLink: '',
};

const normalizeList = (payload) => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const NotificationCenter = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState(initialForm);
  const { data: templatesRes } = useGetNotificationTemplatesQuery();
  const templates = normalizeList(templatesRes);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showComposer, setShowComposer] = useState(false);

  const { data: notificationsRes, isLoading: loadingInbox, refetch } = useGetNotificationsQuery();
  const { data: historyRes, isLoading: loadingHistory } = useGetNotificationHistoryQuery();
  const { data: recipientsRes } = useGetNotificationRecipientsQuery(formData.audience === 'selected' ? 'all' : formData.audience);
  const [createNotification, { isLoading: sending }] = useCreateNotificationMutation();
  const [markAllRead] = useMarkAllAsReadMutation();
  const [markRead] = useMarkAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const notifications = normalizeList(notificationsRes);
  const history = normalizeList(historyRes);
  const recipients = normalizeList(recipientsRes);

  useEffect(() => {
    if (userInfo?._id) {
      connectSocket(userInfo._id, userInfo.school?._id || userInfo.school);

      const handleSocketNotification = (data) => {
        toast.success(`${data.title}: ${data.message}`, { duration: 5000 });
        refetch();
      };

      socket.on('notification', handleSocketNotification);
      socket.on('broadcast_notification', handleSocketNotification);

      return () => {
        socket.off('notification', handleSocketNotification);
        socket.off('broadcast_notification', handleSocketNotification);
      };
    }
  }, [userInfo, refetch]);

  const filteredHistory = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return history.filter((item) => (
      item.title?.toLowerCase().includes(search) ||
      item.message?.toLowerCase().includes(search) ||
      item.recipient?.name?.toLowerCase().includes(search)
    ));
  }, [history, searchTerm]);

  const stats = useMemo(() => ({
    total: history.length,
    unread: notifications.filter((n) => n.status === 'unread').length,
    read: notifications.filter((n) => n.status !== 'unread').length,
    channels: [...new Set(history.flatMap((n) => n.channels || []))].length,
  }), [history, notifications]);

  const toggleChannel = (channel) => {
    setFormData((current) => {
      const exists = current.channels.includes(channel);
      const channels = exists ? current.channels.filter((item) => item !== channel) : [...current.channels, channel];
      return { ...current, channels: channels.length ? channels : ['in_app'] };
    });
  };

  const toggleRecipient = (id) => {
    setFormData((current) => ({
      ...current,
      recipientIds: current.recipientIds.includes(id)
        ? current.recipientIds.filter((item) => item !== id)
        : [...current.recipientIds, id],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Prepare payload including scheduling and template choices
      const payload = {
        ...formData,
        scheduledAt: formData.scheduledAt || null,
        templateId: formData.templateId || null,
        language: formData.language || 'en',
      };

      const result = await createNotification(payload).unwrap();
      toast.success(`Notification sent to ${result?.data?.sent || result?.data?.requested || 0} recipient(s)`);
      setFormData(initialForm);
      setShowComposer(false);
    } catch (err) {
      toast.error(err?.data?.userMessage || err?.data?.message || 'Failed to send notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap();
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error(err?.data?.userMessage || 'Failed to update notifications');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markRead(id).unwrap();
    } catch (err) {
      toast.error(err?.data?.userMessage || 'Failed to update notification');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id).unwrap();
      toast.success('Notification archived');
    } catch (err) {
      toast.error(err?.data?.userMessage || 'Failed to archive notification');
    }
  };

  if (loadingInbox || loadingHistory) {
    return (
      <DugsiPage>
        <PageHeaderSkeleton />
        <StatsGridSkeleton count={4} />
        <div className="mt-4">
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
            <TableSkeleton rows={6} columns={5} />
          </div>
        </div>
      </DugsiPage>
    );
  }

  return (
    <DugsiPage>
      <DugsiHeader
        icon={Bell}
        title="Notification Center"
        description="Create, send, and review school notifications across all channels."
        actions={(
          <>
            <DugsiButton accent="outline" onClick={handleMarkAllRead} disabled={!stats.unread}>
              <CheckCircle size={16} />
              Mark All Read
            </DugsiButton>
            <DugsiButton onClick={() => setShowComposer(true)}>
              <Plus size={16} />
              Create Notification
            </DugsiButton>
          </>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <DugsiStatCard icon={Bell} label="History" value={stats.total} />
        <DugsiStatCard icon={Megaphone} label="Unread" value={stats.unread} tone="amber" />
        <DugsiStatCard icon={CheckCircle} label="Read" value={stats.read} tone="emerald" />
        <DugsiStatCard icon={MonitorSmartphone} label="Channels" value={stats.channels} tone="slate" />
      </div>

      <DugsiCard contentClassName="flex flex-col lg:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <Input
            placeholder="Search notification history..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="h-14 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-bold text-sm"
          />
        </div>
      </DugsiCard>

      {filteredHistory.length === 0 ? (
        <DugsiEmptyState icon={Bell} title="No Notifications Yet" description="Create your first notification to start building communication history." />
      ) : (
        <DugsiCard contentClassName="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 dark:bg-slate-900/50">
                  <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest">Notification</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Recipient</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Channels</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                  <TableHead className="text-right pr-8 text-[10px] font-black uppercase tracking-widest">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((item) => {
                  const Icon = typeIcons[item.type] || Bell;
                  return (
                    <TableRow key={item._id} className={cn('group hover:bg-slate-50/50 dark:hover:bg-slate-900/50', item.status === 'unread' && 'bg-indigo-50/30 dark:bg-indigo-900/10')}>
                      <TableCell className="pl-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <Icon size={20} />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-white">{item.title}</p>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 max-w-md truncate">{item.message}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-slate-600 dark:text-slate-300">
                        {item.recipient?.name || 'User'}
                        <p className="text-[9px] uppercase tracking-widest text-slate-400">{item.recipient?.role || 'recipient'}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {(item.channels || ['in_app']).map((channel) => (
                            <Badge key={channel} variant="secondary" className="text-[8px] font-black uppercase tracking-widest">
                              {channel.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'unread' ? 'default' : 'secondary'} className="text-[9px] font-black uppercase tracking-widest">
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="flex justify-end gap-2">
                          {item.status === 'unread' && (
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-indigo-600" onClick={() => handleMarkRead(item._id)}>
                              <CheckCircle size={18} />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-red-600" onClick={() => handleDelete(item._id)}>
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </DugsiCard>
      )}

      {showComposer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="px-8 py-8 bg-indigo-600 flex items-center justify-between">
              <div>
                <span className="text-white/70 text-[10px] font-black uppercase tracking-widest">Communication</span>
                <h2 className="text-3xl font-black text-white tracking-tight">Create Notification</h2>
              </div>
              <button onClick={() => setShowComposer(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X size={24} className="text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 md:col-span-2">
                  <label className={dugsiLabelClass}>Title</label>
                  <input required value={formData.title} onChange={(event) => setFormData({ ...formData, title: event.target.value })} className={dugsiFieldClass} placeholder="Fee reminder" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className={dugsiLabelClass}>Message</label>
                  <textarea required rows={4} value={formData.message} onChange={(event) => setFormData({ ...formData, message: event.target.value })} className={dugsiFieldClass} placeholder="Write the notification message..." />
                </div>
                <div className="space-y-1.5">
                  <label className={dugsiLabelClass}>Template (optional)</label>
                  <select value={formData.templateId || ''} onChange={(e) => setFormData({ ...formData, templateId: e.target.value })} className={dugsiFieldClass}>
                    <option value="">-- Select template --</option>
                    {templates.map((tpl) => (
                      <option key={tpl._id} value={tpl._id}>{tpl.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className={dugsiLabelClass}>Language</label>
                  <select value={formData.language || 'en'} onChange={(e) => setFormData({ ...formData, language: e.target.value })} className={dugsiFieldClass}>
                    <option value="en">English</option>
                    <option value="so">Somali</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className={dugsiLabelClass}>Audience</label>
                  <select value={formData.audience} onChange={(event) => setFormData({ ...formData, audience: event.target.value, recipientIds: [] })} className={dugsiFieldClass}>
                    {audienceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className={dugsiLabelClass}>Type</label>
                  <select value={formData.type} onChange={(event) => setFormData({ ...formData, type: event.target.value })} className={dugsiFieldClass}>
                    {typeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className={dugsiLabelClass}>Channels</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {channelOptions.map(({ value, label, icon: Icon }) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => toggleChannel(value)}
                      className={cn('h-12 rounded-2xl border font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all', formData.channels.includes(value) ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-slate-50 text-slate-500 border-transparent hover:bg-indigo-50 hover:text-indigo-600')}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={scheduleEnabled} onChange={(e) => setScheduleEnabled(e.target.checked)} />
                  <span className="text-sm font-bold">Schedule Message</span>
                </label>
                {scheduleEnabled && (
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt || ''}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                  />
                )}
              </div>

              {formData.audience === 'selected' && (
                <div className="space-y-3">
                  <label className={dugsiLabelClass}>Recipients</label>
                  <div className="max-h-52 overflow-y-auto rounded-2xl bg-slate-50 dark:bg-slate-900 p-3 grid gap-2">
                    {recipients.map((recipient) => (
                      <label key={recipient._id} className="flex items-center justify-between gap-3 rounded-xl bg-white dark:bg-slate-800 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                        <span>{recipient.name}<span className="ml-2 text-[9px] uppercase tracking-widest text-slate-400">{recipient.role}</span></span>
                        <input type="checkbox" checked={formData.recipientIds.includes(recipient._id)} onChange={() => toggleRecipient(recipient._id)} />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button type="submit" disabled={sending || (formData.audience === 'selected' && !formData.recipientIds.length)} className="w-full px-8 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60">
                {sending ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={18} /> Send Notification</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </DugsiPage>
  );
};

export default NotificationCenter;
