import React, { useMemo, useState } from 'react';
import { Skeleton } from '../components/ui/skeleton';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Percent, Plus, Loader2, BadgePercent, UserPlus, FileText } from 'lucide-react';
import { toast } from 'sonner';
import {
  useAssignDiscountMutation,
  useCreateDiscountMutation,
  useGetClassesQuery,
  useGetDiscountAssignmentsQuery,
  useGetDiscountReportsQuery,
  useGetDiscountsQuery,
  useGetStudentsQuery,
  useRemoveDiscountAssignmentMutation,
} from '../store/adminApiSlice';
import { DugsiButton, DugsiEmptyState, DugsiHeader, DugsiPage, dugsiFieldClass } from '../components/DugsiUI';

const initialDiscount = { name: '', type: 'custom', valueType: 'percentage', value: '', code: '', isActive: true };
const initialAssignment = {
  discountId: '',
  scope: 'student',
  studentId: '',
  studentIds: [],
  classId: '',
  grade: '',
  duration: 'permanent',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  reason: '',
};

function DiscountsManagement() {
  const { data: discountsPayload, isLoading, refetch } = useGetDiscountsQuery();
  const { data: assignmentsPayload, refetch: refetchAssignments } = useGetDiscountAssignmentsQuery({ active: true });
  const { data: reportsPayload } = useGetDiscountReportsQuery();
  const { data: studentsPayload } = useGetStudentsQuery();
  const { data: classesPayload } = useGetClassesQuery();
  const [createDiscount, { isLoading: saving }] = useCreateDiscountMutation();
  const [assignDiscount, { isLoading: assigning }] = useAssignDiscountMutation();
  const [removeDiscountAssignment] = useRemoveDiscountAssignmentMutation();
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [formData, setFormData] = useState(initialDiscount);
  const [assignmentData, setAssignmentData] = useState(initialAssignment);

  const discounts = useMemo(() => {
    if (Array.isArray(discountsPayload?.data)) return discountsPayload.data;
    if (Array.isArray(discountsPayload)) return discountsPayload;
    return [];
  }, [discountsPayload]);
  const assignments = useMemo(() => {
    if (Array.isArray(assignmentsPayload?.data)) return assignmentsPayload.data;
    if (Array.isArray(assignmentsPayload)) return assignmentsPayload;
    return [];
  }, [assignmentsPayload]);
  const students = useMemo(() => {
    if (Array.isArray(studentsPayload?.data)) return studentsPayload.data;
    if (Array.isArray(studentsPayload)) return studentsPayload;
    return [];
  }, [studentsPayload]);
  const classes = useMemo(() => {
    if (Array.isArray(classesPayload?.data)) return classesPayload.data;
    if (Array.isArray(classesPayload)) return classesPayload;
    return [];
  }, [classesPayload]);
  const reportSummary = reportsPayload?.summary || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createDiscount({ ...formData, value: Number(formData.value) }).unwrap();
      toast.success('Discount saved');
      setShowModal(false);
      setFormData(initialDiscount);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save discount');
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    try {
      await assignDiscount({
        ...assignmentData,
        studentIds: assignmentData.scope === 'students' ? assignmentData.studentIds : [],
        endDate: assignmentData.duration === 'custom' ? assignmentData.endDate : undefined,
      }).unwrap();
      toast.success('Discount assigned');
      setShowAssignModal(false);
      setAssignmentData(initialAssignment);
      refetchAssignments();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to assign discount');
    }
  };

  const handleRemoveAssignment = async (id) => {
    try {
      await removeDiscountAssignment(id).unwrap();
      toast.success('Discount assignment removed');
      refetchAssignments();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to remove assignment');
    }
  };

  if (isLoading) {
    return (
      <DugsiPage>
        <PageHeaderSkeleton />
        <div className="grid gap-4 md:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="space-y-4 mt-4">
          <TableSkeleton rows={4} columns={5} />
          <TableSkeleton rows={3} columns={5} />
        </div>
      </DugsiPage>
    );
  }

  return (
    <DugsiPage>
      <DugsiHeader
        icon={Percent}
        title="Discounts"
        description="Create student and fee discounts for your school."
        actions={(
          <div className="flex flex-wrap gap-2">
            <DugsiButton onClick={() => setShowAssignModal(true)}>
              <UserPlus size={16} />
              Assign Discount
            </DugsiButton>
            <DugsiButton onClick={() => setShowModal(true)}>
              <Plus size={16} />
              Add Discount
            </DugsiButton>
          </div>
        )}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[2rem] bg-white p-5 shadow-sm dark:bg-slate-950">
          <p className="text-sm text-slate-500">Discount Impact</p>
          <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-white">${Number(reportSummary.totalDiscount || 0).toLocaleString()}</p>
        </div>
        <div className="rounded-[2rem] bg-white p-5 shadow-sm dark:bg-slate-950">
          <p className="text-sm text-slate-500">Net Revenue</p>
          <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-white">${Number(reportSummary.netRevenue || 0).toLocaleString()}</p>
        </div>
        <div className="rounded-[2rem] bg-white p-5 shadow-sm dark:bg-slate-950">
          <p className="text-sm text-slate-500">Active Assignments</p>
          <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-white">{reportSummary.activeAssignmentCount || assignments.length}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mt-4">
        <div className="rounded-[2rem] bg-white p-5 shadow-sm dark:bg-slate-950">
          <p className="text-sm text-slate-500">Discount Impact</p>
          <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-white">${Number(reportSummary.totalDiscount || 0).toLocaleString()}</p>
          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2">By Type</h3>
            {isLoading ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={discounts.reduce((acc, d) => {
                    const idx = acc.findIndex(x => x.name === d.type);
                    if (idx === -1) acc.push({ name: d.type, value: 1 });
                    else acc[idx].value += 1;
                    return acc;
                  }, [])} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] border-none shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
        ) : discounts.length === 0 ? (
          <DugsiEmptyState icon={Percent} title="No Discounts Yet" description="Add your first discount to get started." />
        ) : (
          <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
            {discounts.map((discount) => (
              <div key={discount._id} className="rounded-[2rem] border border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">{discount.name}</p>
                    <p className="text-sm text-slate-500">{discount.type}</p>
                  </div>
                  <div className="rounded-full bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <BadgePercent size={16} />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">{discount.valueType === 'percentage' ? `${discount.value}%` : `${discount.value} USD`}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${discount.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                    {discount.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">Code: {discount.code || 'N/A'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] border-none shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 p-5">
          <FileText size={18} className="text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Active Discount Assignments</h2>
        </div>
        {assignments.length === 0 ? (
          <DugsiEmptyState icon={UserPlus} title="No Active Assignments" description="Assign a discount to students, a class, or a grade." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-5 py-3 text-xs font-bold uppercase text-slate-500">Discount</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase text-slate-500">Scope</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase text-slate-500">Duration</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase text-slate-500">Dates</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {assignments.map((assignment) => (
                  <tr key={assignment._id}>
                    <td className="px-5 py-4 font-semibold text-slate-800 dark:text-white">{assignment.discount?.name || assignment.discountSnapshot?.name}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {assignment.scope === 'class' ? `${assignment.class?.name || 'Class'} ${assignment.class?.section || ''}` : assignment.scope === 'grade' ? assignment.grade : `${assignment.students?.length || 0} student(s)`}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{assignment.duration?.replaceAll('_', ' ')}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {assignment.startDate ? new Date(assignment.startDate).toLocaleDateString() : '-'} - {assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : 'Permanent'}
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleRemoveAssignment(assignment._id)} className="text-sm font-semibold text-rose-600">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-[2.5rem] bg-white p-8 dark:bg-slate-800">
            <h2 className="mb-6 text-3xl font-black text-slate-900 dark:text-white">Create Discount</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Discount name" className={dugsiFieldClass} />
                <input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="Code" className={dugsiFieldClass} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className={dugsiFieldClass}>
                  <option value="custom">Custom</option>
                  <option value="scholarship">Scholarship</option>
                  <option value="sibling">Sibling</option>
                  <option value="staff_child">Staff Child</option>
                  <option value="special_needs">Special Needs</option>
                  <option value="merit">Merit Scholarship</option>
                  <option value="financial_aid">Financial Aid</option>
                </select>
                <select value={formData.valueType} onChange={(e) => setFormData({ ...formData, valueType: e.target.value })} className={dugsiFieldClass}>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed amount</option>
                </select>
              </div>
              <input required type="number" min="0" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} placeholder="Value" className={dugsiFieldClass} />
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                Active discount
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-12 rounded-2xl border border-slate-200 px-4 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:border-slate-700 dark:text-slate-300">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 h-12 rounded-2xl bg-indigo-600 px-4 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-50">{saving ? <Loader2 className="mx-auto animate-spin" size={18} /> : 'Save Discount'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-[2.5rem] bg-white p-8 dark:bg-slate-800">
            <h2 className="mb-6 text-3xl font-black text-slate-900 dark:text-white">Assign Discount</h2>
            <form onSubmit={handleAssignmentSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <select required value={assignmentData.discountId} onChange={(e) => setAssignmentData({ ...assignmentData, discountId: e.target.value })} className={dugsiFieldClass}>
                  <option value="">Select discount</option>
                  {discounts.filter((d) => d.isActive).map((discount) => (
                    <option key={discount._id} value={discount._id}>{discount.name}</option>
                  ))}
                </select>
                <select value={assignmentData.scope} onChange={(e) => setAssignmentData({ ...assignmentData, scope: e.target.value })} className={dugsiFieldClass}>
                  <option value="student">Single Student</option>
                  <option value="students">Multiple Students</option>
                  <option value="class">Entire Class</option>
                  <option value="grade">Entire Grade</option>
                </select>
              </div>

              {assignmentData.scope === 'student' && (
                <select required value={assignmentData.studentId} onChange={(e) => setAssignmentData({ ...assignmentData, studentId: e.target.value })} className={dugsiFieldClass}>
                  <option value="">Select student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>{student.name} {student.customId ? `(${student.customId})` : ''}</option>
                  ))}
                </select>
              )}
              {assignmentData.scope === 'students' && (
                <select multiple required value={assignmentData.studentIds} onChange={(e) => setAssignmentData({ ...assignmentData, studentIds: Array.from(e.target.selectedOptions).map((option) => option.value) })} className={`${dugsiFieldClass} min-h-40`}>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>{student.name} {student.customId ? `(${student.customId})` : ''}</option>
                  ))}
                </select>
              )}
              {assignmentData.scope === 'class' && (
                <select required value={assignmentData.classId} onChange={(e) => setAssignmentData({ ...assignmentData, classId: e.target.value })} className={dugsiFieldClass}>
                  <option value="">Select class</option>
                  {classes.map((klass) => (
                    <option key={klass._id} value={klass._id}>{klass.name} {klass.section || ''}</option>
                  ))}
                </select>
              )}
              {assignmentData.scope === 'grade' && (
                <input required value={assignmentData.grade} onChange={(e) => setAssignmentData({ ...assignmentData, grade: e.target.value })} placeholder="Grade name" className={dugsiFieldClass} />
              )}

              <div className="grid gap-4 md:grid-cols-3">
                <select value={assignmentData.duration} onChange={(e) => setAssignmentData({ ...assignmentData, duration: e.target.value })} className={dugsiFieldClass}>
                  <option value="one_month">One Month</option>
                  <option value="semester">One Semester</option>
                  <option value="academic_year">One Academic Year</option>
                  <option value="permanent">Permanent</option>
                  <option value="custom">Custom Date Range</option>
                </select>
                <input required type="date" value={assignmentData.startDate} onChange={(e) => setAssignmentData({ ...assignmentData, startDate: e.target.value })} className={dugsiFieldClass} />
                <input type="date" disabled={assignmentData.duration !== 'custom'} value={assignmentData.endDate} onChange={(e) => setAssignmentData({ ...assignmentData, endDate: e.target.value })} className={dugsiFieldClass} />
              </div>
              <textarea value={assignmentData.reason} onChange={(e) => setAssignmentData({ ...assignmentData, reason: e.target.value })} placeholder="Reason or notes" className={`${dugsiFieldClass} min-h-24`} />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAssignModal(false)} className="flex-1 h-12 rounded-2xl border border-slate-200 px-4 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:border-slate-700 dark:text-slate-300">Cancel</button>
                <button type="submit" disabled={assigning} className="flex-1 h-12 rounded-2xl bg-indigo-600 px-4 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-50">{assigning ? <Loader2 className="mx-auto animate-spin" size={18} /> : 'Assign Discount'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DugsiPage>
  );
}

export default DiscountsManagement;
