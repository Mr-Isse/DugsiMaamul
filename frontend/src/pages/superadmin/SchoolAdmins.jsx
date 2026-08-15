import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Power, PowerOff, Search, UserCog, Mail, School, ShieldCheck, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetSchoolAdminsQuery,
  useDeleteSchoolAdminMutation,
  useToggleSchoolAdminStatusMutation,
} from '../../store/superAdminApiSlice';
import { PageHeader, Panel, superAdminBtnPrimary, superAdminInputClass } from '../../components/superadmin/SuperAdminShell';
import ConfirmModal from '../../components/ConfirmModal';

const SchoolAdmins = () => {
  const [search, setSearch] = useState('');
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    admin: null,
  });
  const { data: admins = [], isLoading, isFetching } = useGetSchoolAdminsQuery();
  const [deleteAdmin] = useDeleteSchoolAdminMutation();
  const [toggleStatus] = useToggleSchoolAdminStatusMutation();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return admins;
    return admins.filter(
      (a) =>
        a.email?.toLowerCase().includes(q) ||
        a.school?.name?.toLowerCase().includes(q) ||
        a.school?.subdomain?.toLowerCase().includes(q)
    );
  }, [admins, search]);

  const handleToggle = async (admin) => {
    try {
      await toggleStatus(admin._id).unwrap();
      toast.success('Status updated successfully');
    } catch (err) {
      toast.error(err?.data?.userMessage || 'Update failed');
    }
  };

  const handleDelete = async (admin) => {
    setConfirmModal({
      isOpen: true,
      admin,
    });
  };

  const confirmDelete = async () => {
    try {
      await deleteAdmin(confirmModal.admin._id).unwrap();
      toast.success('Admin deleted successfully');
    } catch (err) {
      toast.error(err?.data?.userMessage || 'Delete failed');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Platform Administrators"
        subtitle="Manage administrative accounts for school tenants"
        action={
          <Link to="/admin/admins/register" className={superAdminBtnPrimary}>
            <Plus className="w-4 h-4" /> Issue Credentials
          </Link>
        }
      />

      <Panel className="p-4 mb-6">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email, school or tenant..."
            className={`${superAdminInputClass} pl-12`}
          />
        </div>
      </Panel>

      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] p-20 text-center border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/40">
             <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
             <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Fetching admin records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] p-20 text-center border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/40">
             <UserCog className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
             <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">No Administrators Found</p>
             <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Try adjusting your search criteria</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <Panel className="overflow-hidden border-none shadow-xl shadow-slate-200/50 dark:shadow-slate-900/40">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Admin Email</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Linked School</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y divide-slate-100 dark:divide-slate-800 ${isFetching ? 'opacity-60' : ''}`}>
                    {filtered.map((admin) => (
                      <tr key={admin._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-inner group-hover:scale-110 transition-transform">
                               <Mail className="w-4 h-4" />
                            </div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{admin.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                              <School className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                              {admin.schoolProfileCompleted
                                ? admin.school?.name || admin.school?.subdomain || 'Linked'
                                : <span className="text-amber-500 uppercase tracking-tighter text-[10px]">Profile Pending</span>}
                            </div>
                            {admin.school?.subdomain && (
                              <span className="text-indigo-600 dark:text-indigo-400 font-black uppercase text-[9px] tracking-widest bg-indigo-500/10 px-1.5 py-0.5 rounded w-fit border border-indigo-500/20">
                                {admin.school.subdomain}.platform
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                           <span
                            className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                              admin.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {admin.status === 'active' ? (
                              <><ShieldCheck className="w-3 h-3" /> Active</>
                            ) : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleToggle(admin)}
                              className={`p-2 rounded-xl transition-all ${
                                admin.status === 'active'
                                  ? 'text-rose-500 dark:text-rose-400 hover:bg-rose-500/10'
                                  : 'text-emerald-500 dark:text-emerald-400 hover:bg-emerald-500/10'
                              }`}
                              title={admin.status === 'active' ? 'Disable Access' : 'Enable Access'}
                            >
                              {admin.status === 'active' ? (
                                <PowerOff className="w-4 h-4" />
                              ) : (
                                <Power className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(admin)}
                              className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                              title="Delete Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Panel>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-4">
              {filtered.map((admin) => (
                <div key={admin._id} className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/40 active:scale-[0.98] transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-inner">
                        <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white leading-tight truncate">{admin.email}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                           <span
                            className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                              admin.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {admin.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 mb-4">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Linked School</p>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                        <School className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        {admin.schoolProfileCompleted
                          ? admin.school?.name || admin.school?.subdomain || 'Linked'
                          : <span className="text-amber-500 uppercase tracking-tighter text-[9px]">Profile Pending</span>}
                      </div>
                      {admin.school?.subdomain && (
                        <span className="text-indigo-600 dark:text-indigo-400 font-black uppercase text-[8px] tracking-widest bg-indigo-500/10 px-1.5 py-0.5 rounded w-fit border border-indigo-500/20">
                          {admin.school.subdomain}.platform
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex gap-2">
                       <button
                        type="button"
                        onClick={() => handleToggle(admin)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                          admin.status === 'active'
                            ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {admin.status === 'active' ? 'Disable Access' : 'Enable Access'}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(admin)}
                      className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmDelete}
        title="Delete Admin"
        message={`Are you sure you want to delete ${confirmModal.admin?.email}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default SchoolAdmins;
