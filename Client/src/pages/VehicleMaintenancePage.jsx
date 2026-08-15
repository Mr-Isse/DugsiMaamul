import React, { useState, useMemo } from 'react'
import { Wrench, Plus, Search, Edit2, RefreshCw, AlertCircle, X, Clock, CheckCircle } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  useGetVehicleMaintenanceQuery,
  useCreateVehicleMaintenanceMutation,
  useUpdateVehicleMaintenanceMutation,
  useGetVehiclesQuery,
} from '@/services/api'

const MAINTENANCE_TYPES = ['Oil Change', 'Tire Rotation', 'Brake Service', 'Engine Repair', 'Transmission', 'Battery', 'Inspection', 'Other']
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']
const STATUSES = ['Scheduled', 'In Progress', 'Completed', 'Cancelled']

const STATUS_STYLES = {
  Scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'In Progress': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Cancelled: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
}

const PRIORITY_STYLES = {
  Low: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  Medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  High: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n || 0)

const fmtDate = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const MaintenanceModal = ({ initial, onClose, onSuccess, vehicles }) => {
  const [form, setForm] = useState({
    vehicle: initial?.vehicle?._id || initial?.vehicle || '',
    maintenanceType: initial?.maintenanceType || 'Oil Change',
    date: initial?.date ? new Date(initial.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    cost: initial?.cost || '',
    priority: initial?.priority || 'Medium',
    status: initial?.status || 'Scheduled',
    description: initial?.description || '',
  })

  const [createMaintenance, { isLoading: creating }] = useCreateVehicleMaintenanceMutation()
  const [updateMaintenance, { isLoading: updating }] = useUpdateVehicleMaintenanceMutation()

  const isEdit = Boolean(initial)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.vehicle) return toast.error('Vehicle is required')
    try {
      const payload = { ...form, cost: form.cost ? Number(form.cost) : undefined }
      if (isEdit) {
        await updateMaintenance({ id: initial._id, ...payload }).unwrap()
        toast.success('Maintenance updated')
      } else {
        await createMaintenance(payload).unwrap()
        toast.success('Maintenance created')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save maintenance record')
    }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Maintenance' : 'New Maintenance'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Update maintenance record details' : 'Schedule vehicle maintenance'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="vehicle">Vehicle *</Label>
          <select
            id="vehicle"
            value={form.vehicle}
            onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
            className="w-full px-3 py-2 rounded-md border border-input bg-background"
            required
          >
            <option value="">Select vehicle</option>
            {vehicles.map((v) => (
              <option key={v._id} value={v._id}>
                {v.name || v.plateNumber || v.registrationNumber}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maintenanceType">Type *</Label>
            <select
              id="maintenanceType"
              value={form.maintenanceType}
              onChange={(e) => setForm({ ...form, maintenanceType: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
              required
            >
              {MAINTENANCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cost">Cost</Label>
            <Input
              id="cost"
              type="number"
              min="0"
              step="0.01"
              value={form.cost}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.]/g, '')
                setForm({ ...form, cost: value })
              }}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <select
              id="priority"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full px-3 py-2 rounded-md border border-input bg-background"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Maintenance details"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={creating || updating}>
            {creating || updating ? 'Saving...' : 'Save Maintenance'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

const VehicleMaintenancePage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)

  const { data: maintenanceData, isLoading, refetch } = useGetVehicleMaintenanceQuery()
  const { data: vehiclesData } = useGetVehiclesQuery()

  const maintenance = Array.isArray(maintenanceData) ? maintenanceData : maintenanceData?.data || []
  const vehicles = Array.isArray(vehiclesData) ? vehiclesData : vehiclesData?.data || []

  const filteredMaintenance = useMemo(() => {
    if (!maintenance) return []
    return maintenance.filter((m) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (m.vehicle?.name || m.vehicle?.plateNumber || '').toLowerCase().includes(q) ||
          (m.maintenanceType || '').toLowerCase().includes(q) ||
          (m.description || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (statusFilter && m.status !== statusFilter) return false
      if (priorityFilter && m.priority !== priorityFilter) return false
      return true
    })
  }, [maintenance, searchTerm, statusFilter, priorityFilter])

  const totalCost = filteredMaintenance.reduce((sum, m) => sum + (m.cost || 0), 0)
  const pendingCount = filteredMaintenance.filter((m) => m.status === 'Scheduled' || m.status === 'In Progress').length
  const completedCount = filteredMaintenance.filter((m) => m.status === 'Completed').length

  const handleCreate = () => {
    setEditRecord(null)
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditRecord(record)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicle Maintenance</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track and schedule vehicle maintenance
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Schedule Maintenance
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredMaintenance.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{fmt(totalCost)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by vehicle, type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background"
        >
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
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
                <TableHead>Vehicle</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaintenance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No maintenance records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredMaintenance.map((m) => (
                  <TableRow key={m._id}>
                    <TableCell className="font-medium">
                      {m.vehicle?.name || m.vehicle?.plateNumber || '-'}
                    </TableCell>
                    <TableCell>{m.maintenanceType}</TableCell>
                    <TableCell>{fmtDate(m.date)}</TableCell>
                    <TableCell>{fmt(m.cost)}</TableCell>
                    <TableCell>
                      <Badge className={PRIORITY_STYLES[m.priority] || PRIORITY_STYLES.Medium}>
                        {m.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_STYLES[m.status] || STATUS_STYLES.Scheduled}>
                        {m.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(m)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {isModalOpen && (
        <MaintenanceModal
          initial={editRecord}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => refetch()}
          vehicles={vehicles}
        />
      )}
    </div>
  )
}

export default VehicleMaintenancePage
