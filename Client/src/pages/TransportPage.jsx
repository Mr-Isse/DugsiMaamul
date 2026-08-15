import React, { useState, useMemo } from 'react'
import {
  Bus,
  Plus,
  Search,
  Edit2,
  Trash2,
  MoreVertical,
  Route,
  MapPin,
  Users,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  useGetVehiclesQuery,
  useGetRoutesQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
  useCreateRouteMutation,
  useUpdateRouteMutation,
  useDeleteRouteMutation,
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
import VehicleFormModal from '@/components/transport/VehicleFormModal'
import RouteFormModal from '@/components/transport/RouteFormModal'

const TransportPage = () => {
  const { userInfo } = useSelector((state) => state.auth)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('vehicles')
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false)
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [selectedRoute, setSelectedRoute] = useState(null)

  const { data: vehicles, isLoading: vehiclesLoading, isError: vehiclesError, refetch: refetchVehicles } = useGetVehiclesQuery()
  const { data: routes, isLoading: routesLoading, isError: routesError, refetch: refetchRoutes } = useGetRoutesQuery()
  
  const [createVehicle, { isLoading: isCreatingVehicle }] = useCreateVehicleMutation()
  const [updateVehicle, { isLoading: isUpdatingVehicle }] = useUpdateVehicleMutation()
  const [deleteVehicle, { isLoading: isDeletingVehicle }] = useDeleteVehicleMutation()
  const [createRoute, { isLoading: isCreatingRoute }] = useCreateRouteMutation()
  const [updateRoute, { isLoading: isUpdatingRoute }] = useUpdateRouteMutation()
  const [deleteRoute, { isLoading: isDeletingRoute }] = useDeleteRouteMutation()

  const filteredVehicles = useMemo(() => {
    if (!vehicles) return []
    const list = Array.isArray(vehicles) ? vehicles : vehicles.data || []
    return list.filter((v) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (v.plateNumber || '').toLowerCase().includes(q) ||
          (v.model || '').toLowerCase().includes(q) ||
          (v.driver?.name || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (statusFilter !== 'all' && v.status !== statusFilter) return false
      return true
    })
  }, [vehicles, searchTerm, statusFilter])

  const filteredRoutes = useMemo(() => {
    if (!routes) return []
    const list = Array.isArray(routes) ? routes : routes.data || []
    return list.filter((r) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (r.name || '').toLowerCase().includes(q) ||
          (r.startPoint || '').toLowerCase().includes(q) ||
          (r.endPoint || '').toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [routes, searchTerm])

  const handleCreateVehicle = async (data) => {
    try {
      await createVehicle(data).unwrap()
      toast.success('Vehicle added successfully')
      setIsVehicleModalOpen(false)
      refetchVehicles()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to add vehicle')
    }
  }

  const handleUpdateVehicle = async (data) => {
    try {
      await updateVehicle({ id: selectedVehicle._id, ...data }).unwrap()
      toast.success('Vehicle updated successfully')
      setIsVehicleModalOpen(false)
      setSelectedVehicle(null)
      refetchVehicles()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update vehicle')
    }
  }

  const handleDeleteVehicle = async (vehicle) => {
    if (!confirm(`Are you sure you want to delete this vehicle?`)) return
    try {
      await deleteVehicle(vehicle._id).unwrap()
      toast.success('Vehicle deleted successfully')
      refetchVehicles()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete vehicle')
    }
  }

  const handleCreateRoute = async (data) => {
    try {
      await createRoute(data).unwrap()
      toast.success('Route created successfully')
      setIsRouteModalOpen(false)
      refetchRoutes()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create route')
    }
  }

  const handleUpdateRoute = async (data) => {
    try {
      await updateRoute({ id: selectedRoute._id, ...data }).unwrap()
      toast.success('Route updated successfully')
      setIsRouteModalOpen(false)
      setSelectedRoute(null)
      refetchRoutes()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update route')
    }
  }

  const handleDeleteRoute = async (route) => {
    if (!confirm(`Are you sure you want to delete "${route.name}"?`)) return
    try {
      await deleteRoute(route._id).unwrap()
      toast.success('Route deleted successfully')
      refetchRoutes()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete route')
    }
  }

  const openCreateVehicleModal = () => {
    setSelectedVehicle(null)
    setIsVehicleModalOpen(true)
  }

  const openEditVehicleModal = (vehicle) => {
    setSelectedVehicle(vehicle)
    setIsVehicleModalOpen(true)
  }

  const openCreateRouteModal = () => {
    setSelectedRoute(null)
    setIsRouteModalOpen(true)
  }

  const openEditRouteModal = (route) => {
    setSelectedRoute(route)
    setIsRouteModalOpen(true)
  }

  const getVehicleStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Maintenance</Badge>
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (vehiclesError || routesError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Failed to load transport data. Please try again.
          </p>
          <Button onClick={() => { refetchVehicles(); refetchRoutes() }} className="mt-2" variant="outline" size="sm">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transport Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage school vehicles and transport routes
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Active Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {vehicles?.filter((v) => v.status === 'active').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Routes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routes?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Students Transported
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {routes?.reduce((sum, r) => sum + (r.assignedStudents || 0), 0) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {activeTab === 'vehicles' && (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
        </TabsList>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openCreateVehicleModal} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Vehicle
            </Button>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plate Number</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehiclesLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No vehicles found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Bus className="h-4 w-4 text-gray-500" />
                          <Badge variant="secondary">{vehicle.plateNumber}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {vehicle.model || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <Users className="h-3 w-3 mr-1" />
                          {vehicle.capacity || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {vehicle.driver?.name || 'Not Assigned'}
                      </TableCell>
                      <TableCell>
                        {getVehicleStatusBadge(vehicle.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditVehicleModal(vehicle)}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteVehicle(vehicle)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Routes Tab */}
        <TabsContent value="routes" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openCreateRouteModal} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Route
            </Button>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route Name</TableHead>
                  <TableHead>Start Point</TableHead>
                  <TableHead>End Point</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routesLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredRoutes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No routes found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoutes.map((route) => (
                    <TableRow key={route._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Route className="h-4 w-4 text-gray-500" />
                          <div className="font-medium text-gray-900 dark:text-white">
                            {route.name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {route.startPoint || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {route.endPoint || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {route.vehicle?.plateNumber || 'Not Assigned'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {route.assignedStudents || 0} students
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
                            <DropdownMenuItem onClick={() => openEditRouteModal(route)}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteRoute(route)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Vehicle Form Modal */}
      <VehicleFormModal
        isOpen={isVehicleModalOpen}
        onClose={() => {
          setIsVehicleModalOpen(false)
          setSelectedVehicle(null)
        }}
        onSubmit={selectedVehicle ? handleUpdateVehicle : handleCreateVehicle}
        defaultValues={selectedVehicle}
        isEdit={!!selectedVehicle}
        isLoading={isCreatingVehicle || isUpdatingVehicle}
      />

      {/* Route Form Modal */}
      <RouteFormModal
        isOpen={isRouteModalOpen}
        onClose={() => {
          setIsRouteModalOpen(false)
          setSelectedRoute(null)
        }}
        onSubmit={selectedRoute ? handleUpdateRoute : handleCreateRoute}
        defaultValues={selectedRoute}
        isEdit={!!selectedRoute}
        isLoading={isCreatingRoute || isUpdatingRoute}
        vehicles={vehicles}
      />
    </div>
  )
}

export default TransportPage
