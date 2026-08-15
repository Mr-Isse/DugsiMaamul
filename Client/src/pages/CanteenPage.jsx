import React, { useState, useMemo } from 'react'
import {
  Utensils,
  Plus,
  Search,
  Edit2,
  Trash2,
  MoreVertical,
  ShoppingBag,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  useGetMenuItemsQuery,
  useGetOrdersQuery,
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
  useUpdateOrderStatusMutation,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import MenuItemModal from '@/components/canteen/MenuItemModal'

const CanteenPage = () => {
  const { userInfo } = useSelector((state) => state.auth)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('menu')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const { data: menuItems, isLoading: menuLoading, isError: menuError, refetch: refetchMenu } = useGetMenuItemsQuery()
  const { data: orders, isLoading: ordersLoading, isError: ordersError, refetch: refetchOrders } = useGetOrdersQuery()
  
  const [createMenuItem, { isLoading: isCreating }] = useCreateMenuItemMutation()
  const [updateMenuItem, { isLoading: isUpdating }] = useUpdateMenuItemMutation()
  const [deleteMenuItem, { isLoading: isDeleting }] = useDeleteMenuItemMutation()
  const [updateOrderStatus, { isLoading: isUpdatingStatus }] = useUpdateOrderStatusMutation()

  const filteredMenuItems = useMemo(() => {
    if (!menuItems) return []
    const list = Array.isArray(menuItems) ? menuItems : menuItems.data || []
    return list.filter((item) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (item.name || '').toLowerCase().includes(q) ||
          (item.description || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
      return true
    })
  }, [menuItems, searchTerm, categoryFilter])

  const filteredOrders = useMemo(() => {
    if (!orders) return []
    const list = Array.isArray(orders) ? orders : orders.data || []
    return list.filter((order) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (order.orderNumber || '').toLowerCase().includes(q) ||
          (order.studentName || '').toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [orders, searchTerm])

  const handleCreateMenuItem = async (data) => {
    try {
      await createMenuItem(data).unwrap()
      toast.success('Menu item added successfully')
      setIsModalOpen(false)
      refetchMenu()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to add menu item')
    }
  }

  const handleUpdateMenuItem = async (data) => {
    try {
      await updateMenuItem({ id: selectedItem._id, ...data }).unwrap()
      toast.success('Menu item updated successfully')
      setIsModalOpen(false)
      setSelectedItem(null)
      refetchMenu()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update menu item')
    }
  }

  const handleDeleteMenuItem = async (item) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return
    try {
      await deleteMenuItem(item._id).unwrap()
      toast.success('Menu item deleted successfully')
      refetchMenu()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete menu item')
    }
  }

  const handleUpdateOrderStatus = async (order, status) => {
    try {
      await updateOrderStatus({ id: order._id, status }).unwrap()
      toast.success('Order status updated successfully')
      refetchOrders()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update order status')
    }
  }

  const openCreateModal = () => {
    setSelectedItem(null)
    setIsModalOpen(true)
  }

  const openEditModal = (item) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
      case 'preparing':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Preparing</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (menuError || ordersError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Failed to load canteen data. Please try again.
          </p>
          <Button onClick={() => { refetchMenu(); refetchOrders() }} className="mt-2" variant="outline" size="sm">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Canteen Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage menu items and orders
          </p>
        </div>
        {activeTab === 'menu' && (
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Menu Item
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Menu Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{menuItems?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Today's Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {orders?.filter((o) => {
                const today = new Date().toDateString()
                return new Date(o.createdAt).toDateString() === today
              }).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {orders?.filter((o) => o.status === 'pending').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Revenue Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${orders?.filter((o) => {
                const today = new Date().toDateString()
                return new Date(o.createdAt).toDateString() === today
              }).reduce((sum, o) => sum + (o.total || 0), 0).toFixed(2) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        {/* Menu Tab */}
        <TabsContent value="menu" className="space-y-4">
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="snacks">Snacks</SelectItem>
                <SelectItem value="beverages">Beverages</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menuLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredMenuItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No menu items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMenuItems.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Utensils className="h-4 w-4 text-gray-500" />
                          <div className="font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {item.category || 'General'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${item.price?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell>
                        <Badge className={item.available ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-red-100 text-red-800 hover:bg-red-100'}>
                          {item.available ? 'Available' : 'Unavailable'}
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
                            <DropdownMenuItem onClick={() => openEditModal(item)}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteMenuItem(item)}
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

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>
                        <Badge variant="secondary">#{order.orderNumber || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {order.studentName || 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 max-w-xs truncate">
                        {order.items?.map((i) => i.name).join(', ') || 'N/A'}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${order.total?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell>
                        {getOrderStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {order.status === 'pending' && (
                              <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order, 'preparing')}>
                                <Clock className="h-4 w-4 mr-2" />
                                Mark Preparing
                              </DropdownMenuItem>
                            )}
                            {order.status === 'preparing' && (
                              <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order, 'completed')}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark Completed
                              </DropdownMenuItem>
                            )}
                            {(order.status === 'pending' || order.status === 'preparing') && (
                              <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order, 'cancelled')}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            )}
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

      {/* Menu Item Modal */}
      <MenuItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedItem(null)
        }}
        onSubmit={selectedItem ? handleUpdateMenuItem : handleCreateMenuItem}
        defaultValues={selectedItem}
        isEdit={!!selectedItem}
        isLoading={isCreating || isUpdating}
      />
    </div>
  )
}

export default CanteenPage
