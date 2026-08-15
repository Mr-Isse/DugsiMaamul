import React, { useState, useMemo } from 'react'
import {
  FileBarChart,
  Search,
  RefreshCw,
  Filter,
  Download,
  Mail,
  MessageSquare,
  Smartphone,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  useGetDeliveryReportsQuery,
} from '@/services/api'

const CHANNELS = ['email', 'sms', 'whatsapp', 'push']
const STATUSES = ['queued', 'sent', 'delivered', 'opened', 'failed', 'bounced']

const ChannelIcon = ({ channel }) => {
  switch (channel) {
    case 'email': return <Mail className="h-4 w-4" />
    case 'sms': return <MessageSquare className="h-4 w-4" />
    case 'whatsapp': return <Smartphone className="h-4 w-4" />
    case 'push': return <Bell className="h-4 w-4" />
    default: return <Mail className="h-4 w-4" />
  }
}

const StatusIcon = ({ status }) => {
  switch (status) {
    case 'delivered':
    case 'opened':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'failed':
    case 'bounced':
      return <XCircle className="h-4 w-4 text-red-600" />
    case 'queued':
    case 'sent':
      return <Clock className="h-4 w-4 text-yellow-600" />
    default:
      return <AlertCircle className="h-4 w-4 text-gray-600" />
  }
}

const DeliveryReportsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [channelFilter, setChannelFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  const { data: logsData, isLoading, refetch } = useGetDeliveryReportsQuery()

  const logs = Array.isArray(logsData) ? logsData : logsData?.data || []

  const filteredLogs = useMemo(() => {
    if (!logs) return []
    return logs.filter((log) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (log.to?.name || '').toLowerCase().includes(q) ||
          (log.to?.email || '').toLowerCase().includes(q) ||
          (log.to?.phone || '').toLowerCase().includes(q) ||
          (log.providerMessageId || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (channelFilter !== 'all' && log.channel !== channelFilter) return false
      if (statusFilter !== 'all' && log.status !== statusFilter) return false
      return true
    })
  }, [logs, searchTerm, channelFilter, statusFilter])

  const deliveryStats = useMemo(() => {
    const total = logs.length
    const delivered = logs.filter((l) => l.status === 'delivered' || l.status === 'opened').length
    const failed = logs.filter((l) => l.status === 'failed' || l.status === 'bounced').length
    const pending = logs.filter((l) => l.status === 'queued' || l.status === 'sent').length
    const rate = total > 0 ? ((delivered / total) * 100).toFixed(1) : 0
    return { total, delivered, failed, pending, rate }
  }, [logs])

  const channelStats = useMemo(() => {
    return CHANNELS.map((channel) => {
      const channelLogs = logs.filter((l) => l.channel === channel)
      const delivered = channelLogs.filter((l) => l.status === 'delivered' || l.status === 'opened').length
      return {
        channel,
        total: channelLogs.length,
        delivered,
        rate: channelLogs.length > 0 ? ((delivered / channelLogs.length) * 100).toFixed(1) : 0,
      }
    })
  }, [logs])

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
      case 'opened':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'failed':
      case 'bounced':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'queued':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
      case 'sent':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const handleExport = () => {
    toast.info('Export functionality coming soon')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Delivery Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track notification delivery status across all channels
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
          <Button size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveryStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{deliveryStats.delivered}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{deliveryStats.failed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Delivery Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{deliveryStats.rate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Channel Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {channelStats.map((stat) => (
          <Card key={stat.channel}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <ChannelIcon channel={stat.channel} />
                {stat.channel.toUpperCase()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold">{stat.delivered}</div>
                <div className="text-sm text-gray-500">/ {stat.total}</div>
              </div>
              <div className="text-sm text-gray-500 mt-1">{stat.rate}% rate</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="max-w-[150px]">
            <SelectValue placeholder="All Channels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            {CHANNELS.map((channel) => (
              <SelectItem key={channel} value={channel}>
                {channel.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="max-w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Recipient</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent At</TableHead>
              <TableHead>Delivered At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                </TableRow>
              ))
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No delivery logs found
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell>
                    <div className="font-medium">{log.to?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">
                      {log.to?.email || log.to?.phone || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ChannelIcon channel={log.channel} />
                      <span className="capitalize">{log.channel}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{log.provider || 'N/A'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <StatusIcon status={log.status} />
                      <Badge className={getStatusColor(log.status)}>
                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDate(log.sentAt)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDate(log.deliveredAt)}</div>
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

export default DeliveryReportsPage