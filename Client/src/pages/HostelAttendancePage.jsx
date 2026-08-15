import React, { useState, useMemo } from 'react'
import { Home, Calendar, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  useGetHostelAttendanceQuery,
  useMarkHostelAttendanceMutation,
  useGetHostelsQuery,
} from '@/services/api'

const ATTENDANCE_STATUSES = [
  { value: 'Present', label: 'Present', icon: CheckCircle, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  { value: 'Absent', label: 'Absent', icon: XCircle, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  { value: 'Late', label: 'Late', icon: Clock, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
]

const HostelAttendancePage = () => {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [selectedHostel, setSelectedHostel] = useState('')
  const [attendanceMap, setAttendanceMap] = useState({})

  const { data: hostelsData } = useGetHostelsQuery()
  const hostels = Array.isArray(hostelsData) ? hostelsData : hostelsData?.data || []

  const queryArgs = useMemo(() => {
    const q = {}
    if (date) q.date = date
    if (selectedHostel) q.hostelId = selectedHostel
    return q
  }, [date, selectedHostel])

  const { data, isLoading, refetch } = useGetHostelAttendanceQuery(queryArgs)
  const [markHostelAttendance, { isLoading: marking }] = useMarkHostelAttendanceMutation()

  const records = Array.isArray(data) ? data : data?.data || data?.attendance || []

  const presentCount = records.filter((r) => r.status === 'Present').length
  const absentCount = records.filter((r) => r.status === 'Absent').length
  const lateCount = records.filter((r) => r.status === 'Late').length

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }))
  }

  const handleSubmitAttendance = async () => {
    if (!selectedHostel) return toast.error('Please select a hostel')
    const entries = Object.entries(attendanceMap).filter(([_, status]) => status)
    if (entries.length === 0) return toast.error('Mark at least one student')
    try {
      await markHostelAttendance({
        date,
        hostelId: selectedHostel,
        records: entries.map(([studentId, status]) => ({ studentId, status })),
      }).unwrap()
      toast.success('Attendance submitted successfully')
      setAttendanceMap({})
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to submit attendance')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hostel Attendance</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Mark and manage daily hostel attendance
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleSubmitAttendance} disabled={marking} className="gap-2">
            <CheckCircle className="h-4 w-4" />
            {marking ? 'Submitting...' : 'Submit Attendance'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Present
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Absent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Late
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lateCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedHostel}
          onChange={(e) => setSelectedHostel(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background"
        >
          <option value="">Select Hostel</option>
          {hostels.map((h) => (
            <option key={h._id} value={h._id}>
              {h.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Existing Status</TableHead>
                <TableHead>Mark Attendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    {selectedHostel ? 'No students found for this hostel.' : 'Select a hostel and date to view records.'}
                  </TableCell>
                </TableRow>
              ) : (
                records.map((rec) => (
                  <TableRow key={rec._id}>
                    <TableCell className="font-medium">
                      {rec.student?.name || rec.student?.firstName || 'Unknown'}
                    </TableCell>
                    <TableCell>{rec.room || rec.roomNumber || '-'}</TableCell>
                    <TableCell>
                      {rec.status && (
                        <Badge className={ATTENDANCE_STATUSES.find((s) => s.value === rec.status)?.color || ''}>
                          {rec.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {ATTENDANCE_STATUSES.map((s) => (
                          <Button
                            key={s.value}
                            variant={attendanceMap[rec.student?._id] === s.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleStatusChange(rec.student?._id, s.value)}
                            className={attendanceMap[rec.student?._id] === s.value ? s.color : ''}
                          >
                            <s.icon className="h-4 w-4 mr-1" />
                            {s.label}
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

export default HostelAttendancePage
