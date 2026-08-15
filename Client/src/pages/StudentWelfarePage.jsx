import React, { useState, useMemo } from 'react'
import {
  Heart,
  Shield,
  Plus,
  Search,
  Edit2,
  Trash2,
  MoreVertical,
  AlertTriangle,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  useGetHealthRecordsQuery,
  useGetDisciplineRecordsQuery,
  useGetStudentsQuery,
  useCreateHealthRecordMutation,
  useUpdateHealthRecordMutation,
  useDeleteHealthRecordMutation,
  useCreateDisciplineRecordMutation,
  useUpdateDisciplineRecordMutation,
  useDeleteDisciplineRecordMutation,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import HealthRecordModal from '@/components/studentWelfare/HealthRecordModal'
import DisciplineRecordModal from '@/components/studentWelfare/DisciplineRecordModal'

const StudentWelfarePage = () => {
  const { userInfo } = useSelector((state) => state.auth)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('health')
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false)
  const [isDisciplineModalOpen, setIsDisciplineModalOpen] = useState(false)
  const [selectedHealthRecord, setSelectedHealthRecord] = useState(null)
  const [selectedDisciplineRecord, setSelectedDisciplineRecord] = useState(null)

  const { data: healthRecords, isLoading: healthLoading, isError: healthError, refetch: refetchHealth } = useGetHealthRecordsQuery()
  const { data: disciplineRecords, isLoading: disciplineLoading, isError: disciplineError, refetch: refetchDiscipline } = useGetDisciplineRecordsQuery()
  const { data: students } = useGetStudentsQuery()
  
  const [createHealthRecord, { isLoading: isCreatingHealth }] = useCreateHealthRecordMutation()
  const [updateHealthRecord, { isLoading: isUpdatingHealth }] = useUpdateHealthRecordMutation()
  const [deleteHealthRecord, { isLoading: isDeletingHealth }] = useDeleteHealthRecordMutation()
  const [createDisciplineRecord, { isLoading: isCreatingDiscipline }] = useCreateDisciplineRecordMutation()
  const [updateDisciplineRecord, { isLoading: isUpdatingDiscipline }] = useUpdateDisciplineRecordMutation()
  const [deleteDisciplineRecord, { isLoading: isDeletingDiscipline }] = useDeleteDisciplineRecordMutation()

  const filteredHealthRecords = useMemo(() => {
    if (!healthRecords) return []
    const list = Array.isArray(healthRecords) ? healthRecords : healthRecords.data || []
    return list.filter((r) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const student = students?.find((s) => s._id === r.student)
        const match =
          (student?.name || '').toLowerCase().includes(q) ||
          (r.type || '').toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [healthRecords, searchTerm, students])

  const filteredDisciplineRecords = useMemo(() => {
    if (!disciplineRecords) return []
    const list = Array.isArray(disciplineRecords) ? disciplineRecords : disciplineRecords.data || []
    return list.filter((r) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const student = students?.find((s) => s._id === r.student)
        const match =
          (student?.name || '').toLowerCase().includes(q) ||
          (r.type || '').toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [disciplineRecords, searchTerm, students])

  const handleCreateHealthRecord = async (data) => {
    try {
      await createHealthRecord(data).unwrap()
      toast.success('Health record created successfully')
      setIsHealthModalOpen(false)
      refetchHealth()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create health record')
    }
  }

  const handleUpdateHealthRecord = async (data) => {
    try {
      await updateHealthRecord({ id: selectedHealthRecord._id, ...data }).unwrap()
      toast.success('Health record updated successfully')
      setIsHealthModalOpen(false)
      setSelectedHealthRecord(null)
      refetchHealth()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update health record')
    }
  }

  const handleDeleteHealthRecord = async (record) => {
    if (!confirm('Are you sure you want to delete this health record?')) return
    try {
      await deleteHealthRecord(record._id).unwrap()
      toast.success('Health record deleted successfully')
      refetchHealth()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete health record')
    }
  }

  const handleCreateDisciplineRecord = async (data) => {
    try {
      await createDisciplineRecord(data).unwrap()
      toast.success('Discipline record created successfully')
      setIsDisciplineModalOpen(false)
      refetchDiscipline()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create discipline record')
    }
  }

  const handleUpdateDisciplineRecord = async (data) => {
    try {
      await updateDisciplineRecord({ id: selectedDisciplineRecord._id, ...data }).unwrap()
      toast.success('Discipline record updated successfully')
      setIsDisciplineModalOpen(false)
      setSelectedDisciplineRecord(null)
      refetchDiscipline()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update discipline record')
    }
  }

  const handleDeleteDisciplineRecord = async (record) => {
    if (!confirm('Are you sure you want to delete this discipline record?')) return
    try {
      await deleteDisciplineRecord(record._id).unwrap()
      toast.success('Discipline record deleted successfully')
      refetchDiscipline()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete discipline record')
    }
  }

  const openCreateHealthModal = () => {
    setSelectedHealthRecord(null)
    setIsHealthModalOpen(true)
  }

  const openEditHealthModal = (record) => {
    setSelectedHealthRecord(record)
    setIsHealthModalOpen(true)
  }

  const openCreateDisciplineModal = () => {
    setSelectedDisciplineRecord(null)
    setIsDisciplineModalOpen(true)
  }

  const openEditDisciplineModal = (record) => {
    setSelectedDisciplineRecord(record)
    setIsDisciplineModalOpen(true)
  }

  if (healthError || disciplineError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Failed to load student welfare data. Please try again.
          </p>
          <Button onClick={() => { refetchHealth(); refetchDiscipline() }} className="mt-2" variant="outline" size="sm">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Welfare</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage student health and discipline records
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Health Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthRecords?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Discipline Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{disciplineRecords?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {(healthRecords?.filter((r) => {
                const date = new Date(r.date)
                const now = new Date()
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
              }).length || 0) + (disciplineRecords?.filter((r) => {
                const date = new Date(r.date)
                const now = new Date()
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
              }).length || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {disciplineRecords?.filter((r) => r.status === 'pending').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search records..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="health">Health Records</TabsTrigger>
          <TabsTrigger value="discipline">Discipline Records</TabsTrigger>
        </TabsList>

        {/* Health Records Tab */}
        <TabsContent value="health" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openCreateHealthModal} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Health Record
            </Button>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {healthLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredHealthRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No health records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHealthRecords.map((record) => {
                    const student = students?.find((s) => s._id === record.student)
                    return (
                      <TableRow key={record._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-gray-500" />
                            <div className="font-medium text-gray-900 dark:text-white">
                              {student?.name || 'Unknown'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {record.type || 'General'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 max-w-xs truncate">
                          {record.description || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge className={record.status === 'resolved' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'}>
                            {record.status?.charAt(0).toUpperCase() + record.status?.slice(1) || 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditHealthModal(record)}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteHealthRecord(record)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Discipline Records Tab */}
        <TabsContent value="discipline" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openCreateDisciplineModal} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Discipline Record
            </Button>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disciplineLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredDisciplineRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No discipline records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDisciplineRecords.map((record) => {
                    const student = students?.find((s) => s._id === record.student)
                    return (
                      <TableRow key={record._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-gray-500" />
                            <div className="font-medium text-gray-900 dark:text-white">
                              {student?.name || 'Unknown'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {record.type || 'General'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 max-w-xs truncate">
                          {record.description || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={record.severity === 'high' ? 'destructive' : 'secondary'}
                            className="capitalize"
                          >
                            {record.severity || 'Low'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={record.status === 'resolved' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'}>
                            {record.status?.charAt(0).toUpperCase() + record.status?.slice(1) || 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDisciplineModal(record)}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteDisciplineRecord(record)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Health Record Modal */}
      <HealthRecordModal
        isOpen={isHealthModalOpen}
        onClose={() => {
          setIsHealthModalOpen(false)
          setSelectedHealthRecord(null)
        }}
        onSubmit={selectedHealthRecord ? handleUpdateHealthRecord : handleCreateHealthRecord}
        defaultValues={selectedHealthRecord}
        isEdit={!!selectedHealthRecord}
        isLoading={isCreatingHealth || isUpdatingHealth}
        students={students}
      />

      {/* Discipline Record Modal */}
      <DisciplineRecordModal
        isOpen={isDisciplineModalOpen}
        onClose={() => {
          setIsDisciplineModalOpen(false)
          setSelectedDisciplineRecord(null)
        }}
        onSubmit={selectedDisciplineRecord ? handleUpdateDisciplineRecord : handleCreateDisciplineRecord}
        defaultValues={selectedDisciplineRecord}
        isEdit={!!selectedDisciplineRecord}
        isLoading={isCreatingDiscipline || isUpdatingDiscipline}
        students={students}
      />
    </div>
  )
}

export default StudentWelfarePage
