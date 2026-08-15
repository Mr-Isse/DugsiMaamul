import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Check,
  Users,
  Layers,
  Globe,
  Search,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  useGetClassesQuery,
  useCreateClassMutation,
} from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

const ClassesPage = () => {
  const navigate = useNavigate()
  const { selectedBranch } = useSelector((state) => state.branch)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    className: '',
    section: '',
    maxStudents: '',
  })
  const [showErrors, setShowErrors] = useState(false)

  const { data: classes, isLoading } = useGetClassesQuery()
  const [createClass, { isLoading: isCreating }] = useCreateClassMutation()

  const filteredClasses = useMemo(() => {
    const list = classes || []
    const q = searchTerm.trim().toLowerCase()
    if (!q) return list
    return list.filter(c => 
      String(c.name || '').toLowerCase().includes(q) || 
      String(c.section || '').toLowerCase().includes(q)
    )
  }, [classes, searchTerm])

  const resetForm = () => {
    setFormData({ className: '', section: '', maxStudents: '' })
    setShowErrors(false)
  }

  const handleCreateClass = async (e) => {
    e.preventDefault()
    setShowErrors(true)
    
    // OLD validation: alphanumeric with spaces for className
    if (!formData.className.trim()) {
      toast.error('Class name is required')
      return
    }
    if (!/^[a-zA-Z0-9\s]+$/.test(formData.className)) {
      toast.error('Class name can only contain letters, numbers, and spaces')
      return
    }
    
    // OLD validation: A-D only for section
    if (!formData.section.trim()) {
      toast.error('Section is required')
      return
    }
    if (!/^[ABCD]$/.test(formData.section.toUpperCase())) {
      toast.error('Section must be A, B, C, or D only')
      return
    }
    
    // OLD validation: digits only for maxStudents
    if (!formData.maxStudents.trim()) {
      toast.error('Maximum students is required')
      return
    }
    if (!/^\d+$/.test(formData.maxStudents)) {
      toast.error('Maximum students must be a number')
      return
    }
    const maxStudentsNum = Number(formData.maxStudents)
    if (maxStudentsNum < 1 || maxStudentsNum > 99999) {
      toast.error('Maximum students must be between 1 and 99999')
      return
    }
    
    try {
      await createClass({
        name: formData.className.trim(),
        section: formData.section.trim().toUpperCase(),
        maxStudents: maxStudentsNum,
      }).unwrap()
      toast.success('Class created successfully')
      setIsModalOpen(false)
      resetForm()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create class')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Classes Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Organize student groups, sections, and assign class teachers.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus size={16} />
          Create Class
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Search by class name or section..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 animate-pulse space-y-3">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
          ))
        ) : filteredClasses && filteredClasses.length > 0 ? (
          filteredClasses.map((cls) => (
            <button
              key={cls._id}
              type="button"
              onClick={() => navigate(`/dashboard/classes/${cls._id}`)}
              className="text-left bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  {!selectedBranch && (
                    <div className="flex items-center gap-1.5 mb-2 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg w-fit">
                      <Globe size={10} />
                      {cls.branch?.name || 'Main Branch'}
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {cls.name} <span className="text-slate-400">•</span> Section {cls.section}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Max students: {cls.maxStudents ?? '-'}</p>
                </div>
                <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                  <Layers size={20} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Users size={16} className="text-slate-400" />
                <span>{cls.assignedSubjectCount ?? 0} subjects assigned</span>
              </div>
            </button>
          ))
        ) : (
          <div className="col-span-full py-16 text-center">
            <Layers size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No classes found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Create your first class to get started.</p>
          </div>
        )}
      </div>

      {/* Create Class Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create New Class</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateClass} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="className">Class Name</Label>
              <Input
                id="className"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                placeholder="e.g. Grade Ten"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="section">Section (A-D only)</Label>
              <Input
                id="section"
                maxLength={1}
                value={formData.section}
                onChange={(e) => {
                  const c = e.target.value.toUpperCase().replace(/[^ABCD]/g, '').slice(0, 1)
                  setFormData({ ...formData, section: c })
                }}
                placeholder="A, B, C, OR D"
                className="uppercase"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxStudents">Maximum Students</Label>
              <Input
                id="maxStudents"
                type="number"
                value={formData.maxStudents}
                onChange={(e) => {
                  const next = e.target.value.replace(/[^\d]/g, '')
                  setFormData({ ...formData, maxStudents: next })
                }}
                placeholder="e.g. 40"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating} className="flex-1">
                {isCreating ? 'Creating...' : (
                  <>
                    <Check size={18} className="mr-2" />
                    Create Class
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ClassesPage
