import React, { useState } from 'react'
import {
  FileText,
  Download,
  Play,
  Calendar,
  Filter,
  Search,
  MoreVertical,
  BarChart3,
  PieChart,
  Users,
  DollarSign,
  TrendingUp,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  useGetReportsQuery,
  useGetReportHistoryQuery,
  useGenerateReportMutation,
  useDownloadReportMutation,
} from '@/services/api'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import ReportGeneratorModal from '@/components/reports/ReportGeneratorModal'

const ReportsPage = () => {
  const { userInfo } = useSelector((state) => state.auth)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false)

  const { data: reports, isLoading, isError, error, refetch } = useGetReportsQuery()
  const { data: reportHistory } = useGetReportHistoryQuery()
  
  const [generateReport, { isLoading: isGenerating }] = useGenerateReportMutation()
  const [downloadReport, { isLoading: isDownloading }] = useDownloadReportMutation()

  const reportTypes = [
    { id: 'attendance', name: 'Attendance Report', icon: Users, color: 'bg-blue-100 text-blue-800' },
    { id: 'academic', name: 'Academic Performance', icon: BarChart3, color: 'bg-green-100 text-green-800' },
    { id: 'finance', name: 'Financial Summary', icon: DollarSign, color: 'bg-purple-100 text-purple-800' },
    { id: 'enrollment', name: 'Enrollment Statistics', icon: TrendingUp, color: 'bg-orange-100 text-orange-800' },
    { id: 'exams', name: 'Exam Results', icon: PieChart, color: 'bg-pink-100 text-pink-800' },
  ]

  const filteredReports = reportTypes.filter((type) => {
    if (typeFilter !== 'all' && type.id !== typeFilter) return false
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      if (!type.name.toLowerCase().includes(q)) return false
    }
    return true
  })

  const handleGenerateReport = async (data) => {
    try {
      await generateReport(data).unwrap()
      toast.success('Report generated successfully')
      setIsGeneratorOpen(false)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to generate report')
    }
  }

  const handleDownloadReport = async (reportId) => {
    try {
      const blob = await downloadReport(reportId).unwrap()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${reportId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Report downloaded successfully')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to download report')
    }
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            {error?.data?.message || 'Failed to load reports. Please try again.'}
          </p>
          <Button onClick={() => refetch()} className="mt-2" variant="outline" size="sm">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports Center</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Generate and download school reports
          </p>
        </div>
        <Button onClick={() => setIsGeneratorOpen(true)} className="gap-2">
          <Play className="h-4 w-4" />
          Generate Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportHistory?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reportHistory?.filter((r) => {
                const date = new Date(r.createdAt)
                const now = new Date()
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
              }).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Report Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportTypes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Storage Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4 GB</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {reportTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-20 w-20 rounded-full mx-auto" />
                <Skeleton className="h-4 w-32 mx-auto mt-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          filteredReports.map((type) => {
            const Icon = type.icon
            return (
              <Card key={type.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg ${type.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline">Available</Badge>
                  </div>
                  <CardTitle className="mt-4">{type.name}</CardTitle>
                  <CardDescription>
                    Generate comprehensive {type.name.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setIsGeneratorOpen(true)}
                    className="w-full"
                    variant="outline"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Reports
          </CardTitle>
          <CardDescription>
            View and download previously generated reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Generated By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportHistory?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No reports generated yet
                  </TableCell>
                </TableRow>
              ) : (
                reportHistory?.slice(0, 5).map((report) => (
                  <TableRow key={report._id}>
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {report.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{report.generatedBy?.name || 'System'}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Completed
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadReport(report._id)}
                        disabled={isDownloading}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Report Generator Modal */}
      <ReportGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onSubmit={handleGenerateReport}
        isLoading={isGenerating}
        reportTypes={reportTypes}
      />
    </div>
  )
}

export default ReportsPage
