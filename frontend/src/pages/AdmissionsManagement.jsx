import React, { useState } from 'react';
import {
  useGetAdmissionsQuery,
  useUpdateAdmissionStatusMutation,
  useGetClassesQuery
} from '../store/adminApiSlice';
import { FileText, Plus, CheckCircle2, XCircle, Eye, User, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { DugsiEmptyState, DugsiHeader, DugsiLoading, DugsiPage, DugsiStatCard, dugsiFieldClass, dugsiLabelClass } from '../components/DugsiUI';

const AdmissionsManagement = () => {
  const { data: admissionsData, isLoading } = useGetAdmissionsQuery();
  const { data: classesData } = useGetClassesQuery();
  const [updateAdmissionStatus] = useUpdateAdmissionStatusMutation();

  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', reviewNotes: '' });

  const admissions = admissionsData || [];
  const classes = classesData?.data || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'under_review': return 'bg-blue-100 text-blue-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleStatusUpdate = async (admission, nextStatus = statusUpdate.status) => {
    try {
      await updateAdmissionStatus({ 
        id: admission._id, 
        status: nextStatus, 
        reviewNotes: statusUpdate.reviewNotes 
      }).unwrap();
      toast.success('Admission status updated');
      setSelectedAdmission(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update status');
    }
  };

  return (
    <DugsiPage>
      <DugsiHeader icon={FileText} title="Admissions" description="Manage student admission applications." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DugsiStatCard icon={FileText} label="Pending" value={admissions.filter(a => a.status === 'pending').length} tone="amber" />
        <DugsiStatCard icon={User} label="Approved" value={admissions.filter(a => a.status === 'approved').length} tone="emerald" />
        <DugsiStatCard icon={FileText} label="Rejected" value={admissions.filter(a => a.status === 'rejected').length} tone="rose" />
      </div>

      {isLoading ? (
        <DugsiLoading />
      ) : admissions.length === 0 ? (
        <DugsiEmptyState icon={FileText} title="No Admissions Yet" description="Add your first admission to get started." />
      ) : (
        <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] border-none shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Student Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Class</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Parent Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {admissions.map(admission => (
                <tr key={admission._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                        <User className="text-indigo-600 dark:text-indigo-400" size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{admission.studentName}</p>
                        <p className="text-sm text-slate-500">{admission.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600 dark:text-slate-300">
                      {admission.class?.name} - {admission.class?.section}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {admission.parentName}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(admission.status)}`}>
                      {admission.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedAdmission(admission)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {selectedAdmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">Admission Details</h2>
              <button onClick={() => setSelectedAdmission(null)} className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400">
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Application Number</p>
                  <p className="font-medium text-slate-800 dark:text-white">{selectedAdmission.applicationNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Class Applying For</p>
                  <p className="font-medium text-slate-800 dark:text-white">
                    {selectedAdmission.class?.name} - {selectedAdmission.class?.section}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Student Name</p>
                <p className="font-medium text-slate-800 dark:text-white">{selectedAdmission.studentName}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                  <p className="font-medium text-slate-800 dark:text-white">{selectedAdmission.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Phone</p>
                  <p className="font-medium text-slate-800 dark:text-white">{selectedAdmission.phone}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Date of Birth</p>
                  <p className="font-medium text-slate-800 dark:text-white">
                    {selectedAdmission.dateOfBirth ? new Date(selectedAdmission.dateOfBirth).toLocaleDateString() : 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Gender</p>
                  <p className="font-medium text-slate-800 dark:text-white">{selectedAdmission.gender}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Parent Name</p>
                  <p className="font-medium text-slate-800 dark:text-white">{selectedAdmission.parentName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Parent Phone</p>
                  <p className="font-medium text-slate-800 dark:text-white">{selectedAdmission.parentPhone}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Address</p>
                <p className="font-medium text-slate-800 dark:text-white">{selectedAdmission.address}</p>
              </div>
              
              {selectedAdmission.previousSchool && (
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Previous School</p>
                  <p className="font-medium text-slate-800 dark:text-white">{selectedAdmission.previousSchool}</p>
                </div>
              )}
              
              {selectedAdmission.documents?.length > 0 && (
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Documents</p>
                  <div className="space-y-2">
                    {selectedAdmission.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700">
                        <FileText size={16} />
                        <a href={doc.url} target="_blank" rel="noreferrer" className="text-sm">{doc.name}</a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {selectedAdmission.status !== 'approved' && selectedAdmission.status !== 'rejected' && (
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <label className={dugsiLabelClass}>Review Notes</label>
                  <textarea 
                    value={statusUpdate.reviewNotes}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, reviewNotes: e.target.value })}
                    className={dugsiFieldClass}
                    placeholder="Add review notes..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setStatusUpdate({ ...statusUpdate, status: 'approved' });
                      handleStatusUpdate(selectedAdmission, 'approved');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors"
                  >
                    <CheckCircle2 size={20} />
                    Approve Admission
                  </button>
                  <button 
                    onClick={() => {
                      setStatusUpdate({ ...statusUpdate, status: 'rejected' });
                      handleStatusUpdate(selectedAdmission, 'rejected');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors"
                  >
                    <XCircle size={20} />
                    Reject Admission
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DugsiPage>
  );
};

export default AdmissionsManagement;
