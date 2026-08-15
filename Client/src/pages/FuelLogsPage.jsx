import React, { useState, useMemo } from 'react'
import { Fuel, Plus, Search, RefreshCw, AlertCircle, X, Droplets, TrendingUp } from 'lucide-react'
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
  useGetFuelLogsQuery,
  useCreateFuelLogMutation,
  useGetVehiclesQuery,
} from '@/services/api'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n || 0)

const fmtDate = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const FuelLogModal = ({ onClose, onSuccess, vehicles }) => {
  const [form, setForm] = useState({
    vehicle: '',
    date: new Date().toISOString().split('T')[0],
    liters: '',
    cost: '',
    odometer: '',
    notes: '',
  })

  const [createFuelLog, { isLoading }] = useCreateFuelLogMutation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.vehicle) return toast.error('Vehicle is required')
    if (!form.liters || Number(form.liters) <= 0) return toast.error('Enter valid liters')
    if (!form.cost || Number(form.cost) <= 0) return toast.error('Enter valid cost')
    try {
      await createFuelLog({
        ...form,
        liters: Number(form.liters),
        cost: Number(form.cost),
        odometer: Number(form.odometer) || undefined,
      }).unwrap()
      toast.success('Fuel log created')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create fuel log')
    }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>New Fuel Log</DialogTitle>
        <DialogDescription>Record fuel consumption for a vehicle</DialogDescription>
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="liters">Liters *</Label>
            <Input
              id="liters"
              type="number"
              min="0"
              step="0.01"
              value={form.liters}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.]/g, '')
                setForm({ ...form, liters: value })
              }}
              placeholder="0.00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost">Cost *</Label>
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
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="odometer">Odometer (km)</Label>
          <Input
            id="odometer"
            type="number"
            min="0"
            value={form.odometer}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '')
              setForm({ ...form, odometer: value })
            }}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Input
            id="notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Optional notes"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Fuel Log'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

const FuelLogsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [vehicleFilter, setVehicleFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: logsData, isLoading, refetch } = useGetFuelLogsQuery()
  const { data: vehiclesData } = useGetVehiclesQuery()

  const logs = Array.isArray(logsData) ? logsData : logsData?.data || logsData?.fuelLogs || []
  const vehicles = Array.isArray(vehiclesData) ? vehiclesData : vehiclesData?.data || []

  const filteredLogs = useMemo(() => {
    if (!logs) return []
    return logs.filter((log) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (log.vehicle?.name || log.vehicle?.plateNumber || '').toLowerCase().includes(q) ||
          (log.notes || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (vehicleFilter && log.vehicle?._id !== vehicleFilter) return false
      return true
    })
  }, [logs, searchTerm, vehicleFilter])

  const totalCost = filteredLogs.reduce((sum, log) => sum + (log.cost || 0), 0)
  const totalLiters = filteredLogs.reduce((sum, log) => sum + (log.liters || 0), 0)

  const handleCreate = () => {
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fuel Logs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track vehicle fuel consumption and costs
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Fuel Log
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredLogs.length}</div>
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Liters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalLiters.toFixed(2)} L</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by vehicle, notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={vehicleFilter}
          onChange={(e) => setVehicleFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background"
        >
          <option value="">All Vehicles</option>
          {vehicles.map((v) => (
            <option key={v._id} value={v._id}>
              {v.name || v.plateNumber || v.registrationNumber}
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
                <TableHead>Date</TableHead>
                <TableHead>Liters</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Odometer</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No fuel logs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="font-medium">
                      {log.vehicle?.name || log.vehicle?.plateNumber || '-'}
                    </TableCell>
                    <TableCell>{fmtDate(log.date)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        {log.liters?.toFixed(2)} L
                      </div>
                    </TableCell>
                    <TableCell>{fmt(log.cost)}</TableCell>
                    <TableCell>{log.odometer?.toLocaleString() || '-'} km</TableCell>
                    <TableCell className="text-gray-500">{log.notes || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {isModalOpen && (
        <FuelLogModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => refetch()}
          vehicles={vehicles}
        />
      )}
    </div>
  )
}

export default FuelLogsPage
