import React, { useState, useMemo } from 'react';
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  Printer,
  Download,
  Search,
  X,
  FileText,
  GraduationCap,
  Star,
  CheckCircle,
} from 'lucide-react';
import {
  useGetCertificatesQuery,
  useGenerateCertificateMutation,
  useUpdateCertificateMutation,
  useDeleteCertificateMutation,
  useGetStudentsQuery,
} from '../store/adminApiSlice';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '../components/ui/skeleton';
import ConfirmModal from '../components/ConfirmModal';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/Input';
import { cn } from '../lib/utils';

const CERT_TYPES = [
  { value: 'achievement', label: 'Achievement', icon: Star, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
  { value: 'completion', label: 'Completion', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
  { value: 'graduation', label: 'Graduation', icon: GraduationCap, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
  { value: 'report_card', label: 'Report Card', icon: FileText, color: 'text-slate-600 bg-slate-50 dark:bg-slate-900/20' },
];

const initialForm = {
  studentId: '',
  type: 'achievement',
  title: '',
  achievementName: '',
};

const CertificatesManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const { data: certificates = [], isLoading, refetch } = useGetCertificatesQuery();
  const { data: studentsRaw } = useGetStudentsQuery();
  const [generateCertificate, { isLoading: isGenerating }] = useGenerateCertificateMutation();
  const [updateCertificate, { isLoading: isUpdating }] = useUpdateCertificateMutation();
  const [deleteCertificate, { isLoading: isDeleting }] = useDeleteCertificateMutation();

  const students = useMemo(() => {
    if (Array.isArray(studentsRaw)) return studentsRaw;
    if (Array.isArray(studentsRaw?.data)) return studentsRaw.data;
    return [];
  }, [studentsRaw]);

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return certificates.filter((c) =>
      c.title?.toLowerCase().includes(s) ||
      c.student?.name?.toLowerCase().includes(s) ||
      c.type?.toLowerCase().includes(s) ||
      c.verificationNumber?.toLowerCase().includes(s)
    );
  }, [certificates, searchTerm]);

  const stats = useMemo(() => ({
    total: certificates.length,
    achievement: certificates.filter((c) => c.type === 'achievement').length,
    graduation: certificates.filter((c) => c.type === 'graduation').length,
    completion: certificates.filter((c) => c.type === 'completion').length,
  }), [certificates]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const result = await generateCertificate(formData).unwrap();
      // If response is a blob (PDF), trigger download
      if (result instanceof Blob) {
        const url = window.URL.createObjectURL(result);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-${formData.title || 'cert'}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
      toast.success('Certificate generated successfully');
      setIsModalOpen(false);
      setFormData(initialForm);
      refetch();
    } catch (err) {
      toast.error(err?.data?.userMessage || err?.data?.message || 'Failed to generate certificate');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateCertificate({ id: selectedCert._id, ...formData }).unwrap();
      toast.success('Certificate updated');
      setIsEditModalOpen(false);
      setSelectedCert(null);
      setFormData(initialForm);
    } catch (err) {
      toast.error(err?.data?.userMessage || 'Failed to update certificate');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCertificate(selectedCert._id).unwrap();
      toast.success('Certificate deleted');
      setIsDeleteModalOpen(false);
      setSelectedCert(null);
    } catch (err) {
      toast.error(err?.data?.userMessage || 'Failed to delete certificate');
    }
  };

  const handlePrint = (cert) => {
    const printWindow = window.open('', '_blank');
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
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleEditClick = (cert) => {
    setSelectedCert(cert);
    setFormData({
      studentId: cert.student?._id || '',
      type: cert.type || 'achievement',
      title: cert.title || '',
      achievementName: cert.content?.achievementName || '',
    });
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <StatsGridSkeleton count={4} />
        <TableSkeleton rows={6} />
      </div>
    );
  }

  const FormContent = ({ onSubmit, submitting, title }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 dark:border-gray-800"
      >
        <div className="px-8 py-8 bg-indigo-600 flex items-center justify-between relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-white/20 rounded-lg"><Award size={16} className="text-white" /></div>
              <span className="text-white/70 text-[10px] font-black uppercase tracking-widest">Certificate</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">{title}</h2>
          </div>
          <button onClick={() => { setIsModalOpen(false); setIsEditModalOpen(false); }} className="relative z-10 p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X size={24} className="text-white" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Student <span className="text-indigo-600">*</span></label>
              <select
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500/30 rounded-2xl text-sm font-bold transition-all outline-none"
              >
                <option value="">Select Student</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>{s.name} — {s.customId}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Certificate Type <span className="text-indigo-600">*</span></label>
              <div className="grid grid-cols-2 gap-3">
                {CERT_TYPES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: value })}
                    className={cn(
                      'h-12 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all',
                      formData.type === value
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-500 border-transparent hover:border-indigo-200'
                    )}
                  >
                    <Icon size={14} />{label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Certificate Title <span className="text-indigo-600">*</span></label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500/30 rounded-2xl text-sm font-bold transition-all outline-none"
                placeholder="Certificate of Achievement"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Achievement / Description</label>
              <input
                type="text"
                value={formData.achievementName}
                onChange={(e) => setFormData({ ...formData, achievementName: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500/30 rounded-2xl text-sm font-bold transition-all outline-none"
                placeholder="Outstanding Academic Performance — Grade 1"
              />
            </div>

            <div className="pt-6 border-t border-gray-50 dark:border-gray-800">
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-8 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Award size={18} />{title}</>}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Award className="text-indigo-600" size={32} />
            Certificates
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-1">Generate and manage achievement certificates for students.</p>
        </div>
        <Button
          onClick={() => { setFormData(initialForm); setIsModalOpen(true); }}
          className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-indigo-600/20"
        >
          <Plus size={16} />
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
          <Card key={label} className="rounded-[2.5rem] border-none shadow-sm">
            <CardContent className="p-6">
              <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{label}</p>
              <p className={`text-3xl font-black mt-1 text-${color}-600 dark:text-${color}-400`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <Input
              placeholder="Search by student name, type, or verification number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-14 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-bold text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card className="rounded-[2.5rem] border-none shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-24">
            <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-6">
              <Award className="text-indigo-600 dark:text-indigo-400" size={36} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No Certificates Found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold mb-6">
              {searchTerm ? 'Try adjusting your search' : 'Generate your first certificate to get started'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsModalOpen(true)} className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2">
                <Plus size={16} /> Generate Certificate
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead className="pl-8">Student</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Verification #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right pr-8">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((cert) => {
                  const certType = CERT_TYPES.find((t) => t.value === cert.type) || CERT_TYPES[0];
                  const Icon = certType.icon;
                  return (
                    <TableRow key={cert._id} className="group">
                      <TableCell className="pl-8">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 rounded-2xl">
                            <AvatarImage src={cert.student?.profileImage?.url || cert.student?.profileImage} />
                            <AvatarFallback className="font-black text-sm bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                              {cert.student?.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{cert.student?.name || 'Unknown'}</p>
                            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{cert.student?.customId || ''}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{cert.title}</p>
                        {cert.content?.achievementName && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{cert.content.achievementName}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn('gap-1.5 text-[9px] font-black uppercase tracking-widest', certType.color)}>
                          <Icon size={10} />{certType.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                          {cert.verificationNumber}
                        </code>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          {new Date(cert.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-indigo-600" onClick={() => handlePrint(cert)} title="Print">
                            <Printer size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-indigo-600" onClick={() => handleEditClick(cert)} title="Edit">
                            <Edit2 size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-red-600" onClick={() => { setSelectedCert(cert); setIsDeleteModalOpen(true); }} title="Delete">
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <FormContent onSubmit={handleCreate} submitting={isGenerating} title="Generate Certificate" />
        )}
        {isEditModalOpen && (
          <FormContent onSubmit={handleUpdate} submitting={isUpdating} title="Edit Certificate" />
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      {isDeleteModalOpen && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => { setIsDeleteModalOpen(false); setSelectedCert(null); }}
          onConfirm={handleDelete}
          title="Delete Certificate"
          message={`Are you sure you want to delete the certificate for "${selectedCert?.student?.name}"? This action cannot be undone.`}
          confirmText="Delete Certificate"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};

export default CertificatesManagement;
