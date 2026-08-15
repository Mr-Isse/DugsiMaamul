import React, { useState, useMemo } from 'react'
import {
  Book,
  Plus,
  Search,
  Edit2,
  Trash2,
  MoreVertical,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  useGetBooksQuery,
  useGetStudentsQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useIssueBookMutation,
  useReturnBookMutation,
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
import BookFormModal from '@/components/library/BookFormModal'
import IssueBookModal from '@/components/library/IssueBookModal'

const LibraryPage = () => {
  const { userInfo } = useSelector((state) => state.auth)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)

  const { data: books, isLoading, isError, error, refetch } = useGetBooksQuery()
  const { data: students } = useGetStudentsQuery()
  
  const [createBook, { isLoading: isCreating }] = useCreateBookMutation()
  const [updateBook, { isLoading: isUpdating }] = useUpdateBookMutation()
  const [deleteBook, { isLoading: isDeleting }] = useDeleteBookMutation()
  const [issueBook, { isLoading: isIssuing }] = useIssueBookMutation()
  const [returnBook, { isLoading: isReturning }] = useReturnBookMutation()

  const filteredBooks = useMemo(() => {
    if (!books) return []
    const list = Array.isArray(books) ? books : books.data || []
    return list.filter((b) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (b.title || '').toLowerCase().includes(q) ||
          (b.author || '').toLowerCase().includes(q) ||
          (b.isbn || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (statusFilter !== 'all') {
        if (statusFilter === 'available' && b.status !== 'available') return false
        if (statusFilter === 'issued' && b.status !== 'issued') return false
      }
      return true
    })
  }, [books, searchTerm, statusFilter])

  const handleCreateBook = async (data) => {
    try {
      await createBook(data).unwrap()
      toast.success('Book added successfully')
      setIsModalOpen(false)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to add book')
    }
  }

  const handleUpdateBook = async (data) => {
    try {
      await updateBook({ id: selectedBook._id, ...data }).unwrap()
      toast.success('Book updated successfully')
      setIsModalOpen(false)
      setSelectedBook(null)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update book')
    }
  }

  const handleDeleteBook = async (book) => {
    if (!confirm(`Are you sure you want to delete "${book.title}"?`)) return
    try {
      await deleteBook(book._id).unwrap()
      toast.success('Book deleted successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete book')
    }
  }

  const handleIssueBook = async (data) => {
    try {
      await issueBook(data).unwrap()
      toast.success('Book issued successfully')
      setIsIssueModalOpen(false)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to issue book')
    }
  }

  const handleReturnBook = async (book) => {
    if (!confirm(`Return "${book.title}" from ${book.issuedTo?.name || 'student'}?`)) return
    try {
      await returnBook({ bookId: book._id }).unwrap()
      toast.success('Book returned successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to return book')
    }
  }

  const openCreateModal = () => {
    setSelectedBook(null)
    setIsModalOpen(true)
  }

  const openEditModal = (book) => {
    setSelectedBook(book)
    setIsModalOpen(true)
  }

  const openIssueModal = (book) => {
    setSelectedBook(book)
    setIsIssueModalOpen(true)
  }

  const getStatusBadge = (book) => {
    if (book.status === 'issued') {
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Issued</Badge>
    }
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Available</Badge>
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            {error?.data?.message || 'Failed to load books. Please try again.'}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Library</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage library books and circulation
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Book
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Books
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{books?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {books?.filter((b) => b.status === 'available').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Issued
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {books?.filter((b) => b.status === 'issued').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {books?.filter((b) => b.status === 'issued' && b.isOverdue).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="issued">Issued</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Book Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>ISBN</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issued To</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredBooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No books found
                </TableCell>
              </TableRow>
            ) : (
              filteredBooks.map((book) => (
                <TableRow key={book._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Book className="h-4 w-4 text-gray-500" />
                      <div className="font-medium text-gray-900 dark:text-white">
                        {book.title}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {book.author || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{book.isbn || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{book.category || 'General'}</Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(book)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {book.issuedTo ? (
                      <div>
                        <div>{book.issuedTo.name}</div>
                        <div className="text-xs text-gray-400">
                          Due: {book.dueDate ? new Date(book.dueDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditModal(book)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {book.status === 'available' ? (
                          <DropdownMenuItem onClick={() => openIssueModal(book)}>
                            <ArrowRightLeft className="h-4 w-4 mr-2" />
                            Issue Book
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleReturnBook(book)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Return Book
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteBook(book)}
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

      {/* Book Form Modal */}
      <BookFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedBook(null)
        }}
        onSubmit={selectedBook ? handleUpdateBook : handleCreateBook}
        defaultValues={selectedBook}
        isEdit={!!selectedBook}
        isLoading={isCreating || isUpdating}
      />

      {/* Issue Book Modal */}
      <IssueBookModal
        isOpen={isIssueModalOpen}
        onClose={() => {
          setIsIssueModalOpen(false)
          setSelectedBook(null)
        }}
        onSubmit={handleIssueBook}
        book={selectedBook}
        isLoading={isIssuing}
        students={students}
      />
    </div>
  )
}

export default LibraryPage
