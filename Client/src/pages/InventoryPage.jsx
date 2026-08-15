import React, { useState, useMemo } from 'react'
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  useGetInventoryQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
  useUpdateStockMutation,
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
import InventoryFormModal from '@/components/inventory/InventoryFormModal'
import StockUpdateModal from '@/components/inventory/StockUpdateModal'

const InventoryPage = () => {
  const { userInfo } = useSelector((state) => state.auth)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isStockModalOpen, setIsStockModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const { data: inventory, isLoading, isError, error, refetch } = useGetInventoryQuery()
  
  const [createItem, { isLoading: isCreating }] = useCreateInventoryItemMutation()
  const [updateItem, { isLoading: isUpdating }] = useUpdateInventoryItemMutation()
  const [deleteItem, { isLoading: isDeleting }] = useDeleteInventoryItemMutation()
  const [updateStock, { isLoading: isUpdatingStock }] = useUpdateStockMutation()

  const filteredInventory = useMemo(() => {
    if (!inventory) return []
    const list = Array.isArray(inventory) ? inventory : inventory.data || []
    return list.filter((item) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (item.name || '').toLowerCase().includes(q) ||
          (item.sku || '').toLowerCase().includes(q) ||
          (item.location || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
      if (statusFilter !== 'all') {
        if (statusFilter === 'low' && item.quantity > item.minStock) return false
        if (statusFilter === 'out' && item.quantity > 0) return false
      }
      return true
    })
  }, [inventory, searchTerm, categoryFilter, statusFilter])

  const handleCreateItem = async (data) => {
    try {
      await createItem(data).unwrap()
      toast.success('Item added successfully')
      setIsModalOpen(false)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to add item')
    }
  }

  const handleUpdateItem = async (data) => {
    try {
      await updateItem({ id: selectedItem._id, ...data }).unwrap()
      toast.success('Item updated successfully')
      setIsModalOpen(false)
      setSelectedItem(null)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update item')
    }
  }

  const handleDeleteItem = async (item) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return
    try {
      await deleteItem(item._id).unwrap()
      toast.success('Item deleted successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete item')
    }
  }

  const handleUpdateStock = async (data) => {
    try {
      await updateStock({ id: selectedItem._id, ...data }).unwrap()
      toast.success('Stock updated successfully')
      setIsStockModalOpen(false)
      setSelectedItem(null)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update stock')
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

  const openStockModal = (item) => {
    setSelectedItem(item)
    setIsStockModalOpen(true)
  }

  const getStockStatusBadge = (item) => {
    if (item.quantity === 0) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Out of Stock</Badge>
    }
    if (item.quantity <= item.minStock) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Low Stock</Badge>
    }
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">In Stock</Badge>
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            {error?.data?.message || 'Failed to load inventory. Please try again.'}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage school assets and inventory
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              In Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {inventory?.filter((i) => i.quantity > i.minStock).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {inventory?.filter((i) => i.quantity > 0 && i.quantity <= i.minStock).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Out of Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {inventory?.filter((i) => i.quantity === 0).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="furniture">Furniture</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="supplies">Supplies</SelectItem>
              <SelectItem value="equipment">Equipment</SelectItem>
              <SelectItem value="books">Books</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="out">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No items found
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.sku || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {item.category || 'General'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.quantity || 0}</span>
                      {item.quantity <= item.minStock && item.quantity > 0 && (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="text-xs text-gray-400">Min: {item.minStock || 0}</div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {item.location || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {getStockStatusBadge(item)}
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
                        <DropdownMenuItem onClick={() => openStockModal(item)}>
                          <ArrowUp className="h-4 w-4 mr-2" />
                          Update Stock
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteItem(item)}
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

      {/* Inventory Form Modal */}
      <InventoryFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedItem(null)
        }}
        onSubmit={selectedItem ? handleUpdateItem : handleCreateItem}
        defaultValues={selectedItem}
        isEdit={!!selectedItem}
        isLoading={isCreating || isUpdating}
      />

      {/* Stock Update Modal */}
      <StockUpdateModal
        isOpen={isStockModalOpen}
        onClose={() => {
          setIsStockModalOpen(false)
          setSelectedItem(null)
        }}
        onSubmit={handleUpdateStock}
        item={selectedItem}
        isLoading={isUpdatingStock}
      />
    </div>
  )
}

export default InventoryPage
