import { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Plus, Pencil, Trash2, Download, Printer, Search, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
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
import { toast } from 'sonner'
import {
  useGetCertificatesQuery,
  useGenerateCertificateMutation,
  useUpdateCertificateMutation,
  useDeleteCertificateMutation,
  useGetStudentsQuery,
  useGetAcademicYearsQuery,
} from '@/services/api'

const CERTIFICATE_TYPES = [
  { value: 'achievement', label: 'Achievement', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
  { value: 'completion', label: 'Completion', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
  { value: 'graduation', label: 'Graduation', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
  { value: 'report_card', label: 'Report Card', color: 'text-slate-600 bg-slate-50 dark:bg-slate-900/20' },
]

const CertificateModal = ({ isOpen, initial, students, onClose, onSuccess }) => {
  const [form, setForm] = useState(initial || {
    studentId: '',
    type: 'achievement',
    title: '',
    achievementName: '',
  })
  const [generateCertificate, { isLoading: creating }] = useGenerateCertificateMutation()
  const [updateCertificate, { isLoading: updating }] = useUpdateCertificateMutation()

  const isEdit = Boolean(initial)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validations
    if (!form.studentId.trim()) {
      toast.error('Student is required')
      return
    }
    if (!form.title.trim() || form.title.length < 3) {
      toast.error('Title must be at least 3 characters')
      return
    }
    
    try {
      if (isEdit) {
        await updateCertificate({ id: initial._id, ...form }).unwrap()
        toast.success('Certificate updated successfully')
      } else {
        const result = await generateCertificate(form).unwrap()
        // If response is a blob (PDF), trigger download
        if (result instanceof Blob) {
          const url = window.URL.createObjectURL(result)
          const a = document.createElement('a')
          a.href = url
          a.download = `certificate-${form.title || 'cert'}.pdf`
          a.click()
          window.URL.revokeObjectURL(url)
        }
        toast.success('Certificate generated successfully')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.userMessage || err?.data?.message || 'Failed to save certificate')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Certificate' : 'Generate Certificate'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update certificate information' : 'Generate a new certificate for a student'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student">Student *</Label>
            <select
              id="student"
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
              required
            >
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name || `${student.firstName} ${student.lastName || ''}`} ({student.customId})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Certificate Type *</Label>
            <select
              id="type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
              required
            >
              {CERTIFICATE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Certificate Title *</Label>
            <input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Certificate of Achievement"
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="achievementName">Achievement / Description</Label>
            <input
              id="achievementName"
              value={form.achievementName}
              onChange={(e) => setForm({ ...form, achievementName: e.target.value })}
              placeholder="Outstanding Academic Performance — Grade 1"
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating || updating}>
              {creating || updating ? 'Saving...' : isEdit ? 'Update Certificate' : 'Generate Certificate'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const DeleteConfirmDialog = ({ isOpen, certificate, onClose, onSuccess }) => {
  const [deleteCertificate, { isLoading }] = useDeleteCertificateMutation()

  const handleDelete = async () => {
    try {
      await deleteCertificate(certificate._id).unwrap()
      toast.success('Certificate deleted')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete certificate')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle>Delete Certificate</DialogTitle>
          <DialogDescription className="mt-2">
            Are you sure you want to delete <span className="font-bold">"{certificate.title}"</span>?
            This action cannot be undone.
          </DialogDescription>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function CertificatesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const { data: certificatesData, isLoading, refetch } = useGetCertificatesQuery()
  const { data: studentsData } = useGetStudentsQuery()

  const certificates = Array.isArray(certificatesData) ? certificatesData : certificatesData?.data || []
  const students = Array.isArray(studentsData) ? studentsData : studentsData?.data || []

  const filteredCertificates = useMemo(() => {
    const s = searchTerm.toLowerCase()
    return certificates.filter((c) =>
      c.title?.toLowerCase().includes(s) ||
      c.student?.name?.toLowerCase().includes(s) ||
      c.type?.toLowerCase().includes(s) ||
      c.verificationNumber?.toLowerCase().includes(s)
    )
  }, [certificates, searchTerm])

  const stats = useMemo(() => ({
    total: certificates.length,
    achievement: certificates.filter((c) => c.type === 'achievement').length,
    graduation: certificates.filter((c) => c.type === 'graduation').length,
    completion: certificates.filter((c) => c.type === 'completion').length,
  }), [certificates])

  const handleAdd = () => {
    setEditRecord(null)
    setIsModalOpen(true)
  }

  const handleEdit = (certificate) => {
    setEditRecord({
      ...certificate,
      studentId: certificate.student?._id || '',
      type: certificate.type || 'achievement',
      title: certificate.title || '',
      achievementName: certificate.content?.achievementName || '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = (certificate) => {
    setDeleteRecord(certificate)
  }

  const handlePrint = (cert) => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Certificate - ${cert.title}</title>
          <style>
            body { font-family: 'Georgia', serif; text-align: center; padding: 60px; background: #fff; }
            .border { border: 8px double #4f46e5; padding: 40px; margin: 20px; }
            h1 { color: #4f46e5; font-size: 2.5em; margin-bottom: 10px; }
            h2 { font-size: 1.8em; color: #1e293b; margin: 20px 0; }
            p { color: #475569; font-size: 1.1em; line-height: 1.8; }
            .verification { margin-top: 40px; font-size: 0.8em; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="border">
            <h1>${cert.title}</h1>
            <p>This is to certify that</p>
            <h2>${cert.student?.name || 'Student'}</h2>
            <p>has successfully ${cert.type === 'achievement' ? 'achieved' : cert.type === 'completion' ? 'completed' : 'graduated from'} <br/>${cert.content?.achievementName || ''}</p>
            <p class="verification">Verification: ${cert.verificationNumber}</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const handleDownload = (cert) => {
    toast.info('Download functionality - PDF generation')
  }

  const getCertType = (type) => {
    return CERTIFICATE_TYPES.find((t) => t.value === type) || CERTIFICATE_TYPES[0]
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="text-indigo-600" size={28} />
            Certificates
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Generate and manage achievement certificates for students.</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Generate Certificate
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'indigo' },
          { label: 'Achievement', value: stats.achievement, color: 'amber' },
          { label: 'Graduation', value: stats.graduation, color: 'emerald' },
          { label: 'Completion', value: stats.completion, color: 'slate' },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-6">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
              <p className={`text-2xl font-bold mt-1 text-${color}-600 dark:text-${color}-400`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search by student name, type, or verification number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Verification #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCertificates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No certificates found. Generate your first certificate to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCertificates.map((certificate) => {
                  const certType = getCertType(certificate.type)
                  return (
                    <TableRow key={certificate._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={certificate.student?.profileImage} />
                            <AvatarFallback className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                              {certificate.student?.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{certificate.student?.name || 'Unknown'}</p>
                            <p className="text-xs text-indigo-600 dark:text-indigo-400">{certificate.student?.customId || ''}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{certificate.title}</p>
                        {certificate.content?.achievementName && (
                          <p className="text-xs text-gray-500">{certificate.content.achievementName}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={certType.color}>{certType.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                          {certificate.verificationNumber}
                        </code>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-500">
                          {new Date(certificate.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePrint(certificate)}
                            title="Print"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(certificate)}
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(certificate)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(certificate)}
                            className="text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <CertificateModal
            isOpen={isModalOpen}
            initial={editRecord}
            students={students}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => {
              refetch()
              setIsModalOpen(false)
            }}
          />
        </Dialog>
      )}

      {deleteRecord && (
        <Dialog open={!!deleteRecord} onOpenChange={() => setDeleteRecord(null)}>
          <DeleteConfirmDialog
            isOpen={!!deleteRecord}
            certificate={deleteRecord}
            onClose={() => setDeleteRecord(null)}
            onSuccess={() => {
              refetch()
              setDeleteRecord(null)
            }}
          />
        </Dialog>
      )}
    </div>
  )
}
