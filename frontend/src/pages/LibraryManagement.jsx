import React, { useMemo, useState } from 'react';
import { BookOpenCheck, Plus, Loader2, BookText, UserRound } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Tooltip } from 'recharts';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';
import {
  useCreateLibraryBookMutation,
  useGetLibraryBooksQuery,
  useGetStudentsQuery,
  useIssueLibraryBookMutation,
  useReturnLibraryBookMutation,
} from '../store/adminApiSlice';
import { Button } from '../components/ui/button';
import { PageLayout, PageHeader, ContentCard, StatsGrid2 } from '../components/PageLayout';
import { DataTable, SearchInput } from '../components/DataTable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/Dialog';

const initialBook = { title: '', author: '', isbn: '', category: '', quantity: 1, price: '', rackNumber: '' };
const initialIssue = { userId: '', dueDate: '', remarks: '' };

function LibraryManagement() {
  const { data: booksPayload, isLoading, refetch } = useGetLibraryBooksQuery();
  const { data: studentsPayload } = useGetStudentsQuery();
  const [createBook, { isLoading: creatingBook }] = useCreateLibraryBookMutation();
  const [issueBook, { isLoading: issuingBook }] = useIssueLibraryBookMutation();
  const [returnBook] = useReturnLibraryBookMutation();

  const [showBookModal, setShowBookModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookForm, setBookForm] = useState(initialBook);
  const [issueForm, setIssueForm] = useState(initialIssue);
  const [searchQuery, setSearchQuery] = useState('');

  const books = useMemo(() => {
    if (Array.isArray(booksPayload?.data)) return booksPayload.data;
    if (Array.isArray(booksPayload)) return booksPayload;
    return [];
  }, [booksPayload]);

  const students = useMemo(() => {
    if (Array.isArray(studentsPayload?.data)) return studentsPayload.data;
    if (Array.isArray(studentsPayload)) return studentsPayload;
    return [];
  }, [studentsPayload]);

  const filteredBooks = useMemo(() => {
    if (!searchQuery) return books;
    const q = searchQuery.toLowerCase();
    return books.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
  }, [books, searchQuery]);

  const columns = [
    {
      header: 'Book',
      key: 'title',
      render: (book) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <BookText className="text-indigo-600" size={18} />
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-white">{book.title}</p>
            <p className="text-sm text-slate-500">{book.author}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      key: 'category',
      render: (book) => (
        <span className="text-slate-600 dark:text-slate-300">{book.category || 'General'}</span>
      ),
    },
    {
      header: 'Qty',
      key: 'quantity',
      render: (book) => (
        <span className="text-slate-600 dark:text-slate-300">{book.availableQuantity || 0}/{book.quantity || 0}</span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (book) => (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${Number(book.availableQuantity || 0) > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {Number(book.availableQuantity || 0) > 0 ? 'Available' : 'Out of Stock'}
        </span>
      ),
    },
    {
      header: '',
      key: 'actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (book) => (
        <button
          onClick={() => {
            setSelectedBook(book);
            setShowIssueModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
        >
          <UserRound size={16} />
          Issue
        </button>
      ),
    },
  ];

  const handleCreateBook = async (e) => {
    e.preventDefault();
    try {
      await createBook({ ...bookForm, quantity: Number(bookForm.quantity || 1), price: Number(bookForm.price || 0) }).unwrap();
      toast.success('Book added to the library');
      setShowBookModal(false);
      setBookForm(initialBook);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to add book');
    }
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    if (!selectedBook) return;
    try {
      await issueBook({ bookId: selectedBook._id, userId: issueForm.userId, dueDate: issueForm.dueDate, remarks: issueForm.remarks }).unwrap();
      toast.success(`${selectedBook.title} issued successfully`);
      setShowIssueModal(false);
      setSelectedBook(null);
      setIssueForm(initialIssue);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Could not issue the book');
    }
  };

  const handleReturnBook = async (bookId) => {
    try {
      await returnBook(bookId).unwrap();
      toast.success('Book returned');
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Could not return the book');
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Library Management"
        description="Track books, inventory, and borrowing activity"
        icon={BookOpenCheck}
        actions={
          <Button onClick={() => setShowBookModal(true)} className="gap-2">
            <Plus size={16} />
            Add Book
          </Button>
        }
      />

      <StatsGrid2 columns={3}>
        <ContentCard>
          <p className="text-sm text-slate-500">Total Books</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{books.length}</p>
        </ContentCard>
        <ContentCard>
          <p className="text-sm text-slate-500">Available Copies</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{books.reduce((sum, book) => sum + Number(book.availableQuantity || 0), 0)}</p>
        </ContentCard>
        <ContentCard>
          <p className="text-sm text-slate-500">Out of Stock</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{books.filter((book) => Number(book.availableQuantity || 0) <= 0).length}</p>
        </ContentCard>
      </StatsGrid2>

      <ContentCard>
        <h3 className="text-sm font-semibold mb-2 text-slate-800 dark:text-slate-100">Books by Category</h3>
        {isLoading ? <Skeleton className="h-40 w-full" /> : (
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={books.reduce((acc, b) => {
                const name = b.category || 'General';
                const idx = acc.findIndex(x => x.name === name);
                if (idx === -1) acc.push({ name, value: 1 }); else acc[idx].value += 1;
                return acc;
              }, [])} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ContentCard>

      <ContentCard>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by title or author..."
            className="flex-1 max-w-md"
          />
        </div>
        <DataTable
          columns={columns}
          data={filteredBooks}
          isLoading={isLoading}
          emptyTitle="No books found"
          emptyDescription={searchQuery ? 'Try adjusting your search.' : 'Add the first title to start tracking library inventory.'}
          emptyAction={
            !searchQuery ? (
              <Button onClick={() => setShowBookModal(true)} variant="outline" size="sm">
                <Plus size={14} className="mr-1" /> Add Book
              </Button>
            ) : undefined
          }
        />
      </ContentCard>

      <Dialog open={showBookModal} onOpenChange={setShowBookModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Book</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateBook} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input required value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} placeholder="Title" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900" />
              <input required value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} placeholder="Author" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <input value={bookForm.isbn} onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })} placeholder="ISBN" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900" />
              <input value={bookForm.category} onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })} placeholder="Category" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <input type="number" min="1" value={bookForm.quantity} onChange={(e) => setBookForm({ ...bookForm, quantity: e.target.value })} placeholder="Quantity" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900" />
              <input type="number" min="0" value={bookForm.price} onChange={(e) => setBookForm({ ...bookForm, price: e.target.value })} placeholder="Price" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900" />
              <input value={bookForm.rackNumber} onChange={(e) => setBookForm({ ...bookForm, rackNumber: e.target.value })} placeholder="Rack" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowBookModal(false)}>Cancel</Button>
              <Button type="submit" disabled={creatingBook}>{creatingBook ? <Loader2 className="animate-spin" size={18} /> : 'Save Book'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showIssueModal} onOpenChange={(open) => {
        if (!open) {
          setShowIssueModal(false);
          setSelectedBook(null);
          setIssueForm(initialIssue);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue {selectedBook?.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleIssueBook} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Student</label>
              <select required value={issueForm.userId} onChange={(e) => setIssueForm({ ...issueForm, userId: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900">
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>{student.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Due Date</label>
              <input required type="date" value={issueForm.dueDate} onChange={(e) => setIssueForm({ ...issueForm, dueDate: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Remarks</label>
              <textarea value={issueForm.remarks} onChange={(e) => setIssueForm({ ...issueForm, remarks: e.target.value })} rows="3" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowIssueModal(false); setSelectedBook(null); setIssueForm(initialIssue); }}>Cancel</Button>
              <Button type="submit" disabled={issuingBook}>{issuingBook ? <Loader2 className="animate-spin" size={18} /> : 'Issue Book'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

export default LibraryManagement;
