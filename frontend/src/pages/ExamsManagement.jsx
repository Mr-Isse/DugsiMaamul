import React, { useState, useMemo, useEffect } from 'react';
import { Trophy, Plus, Calendar, Users, ChevronLeft, ChevronRight, Save, Edit3, Check, BookOpen, Search, Loader2, X, Tag, AlertCircle, Printer, FileSpreadsheet, FileText, Globe } from 'lucide-react';
import {
  useGetExamSessionsQuery, useCreateExamSessionMutation,
  useGetClassExamMarksQuery, useSubmitClassExamMarksMutation,
  useGetClassesQuery, useGetSubjectsQuery, useGetClassResultsQuery
} from '../store/adminApiSlice';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Skeleton } from '../components/ui/skeleton';
import { ResponsiveContainer, PieChart, Pie, Tooltip } from 'recharts';

const EXAM_TYPES = ['Monthly 1', 'Midterm', 'Monthly 2', 'Final'];
const BADGE = { 'Monthly 1': 'bg-blue-100 text-blue-700', Midterm: 'bg-purple-100 text-purple-700', 'Monthly 2': 'bg-amber-100 text-amber-700', Final: 'bg-red-100 text-red-700' };

// ── Create + List ──────────────────────────────────────────────────────────────
function ExamList({ onSelect }) {
  const { data: exams = [], isLoading } = useGetExamSessionsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const { data: subjects = [] } = useGetSubjectsQuery();
  const { selectedBranch } = useSelector((state) => state.branch);
  const [createExamSession, { isLoading: creating }] = useCreateExamSessionMutation();
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', date: '', maxMarks: '100', classIds: [], subjectIds: [] });
  const [showForm, setShowForm] = useState(false);

  const toggleClass = id => setForm(p => ({ ...p, classIds: p.classIds.includes(id) ? p.classIds.filter(c => c !== id) : [...p.classIds, id] }));
  const toggleSubject = id => setForm(p => ({ ...p, subjectIds: p.subjectIds.includes(id) ? p.subjectIds.filter(s => s !== id) : [...p.subjectIds, id] }));

  const handleCreate = async e => {
    e.preventDefault();
    if (!form.name || !form.date || !form.maxMarks || !form.classIds.length) {
      toast.error('Fill all fields and select at least one class'); return;
    }
    if (!form.subjectIds.length) {
      toast.error('Select at least one subject'); return;
    }
    try {
      const res = await createExamSession({
        name: form.name, date: form.date, maxMarks: Number(form.maxMarks),
        classIds: form.classIds, subjectIds: form.subjectIds,
      }).unwrap();
      toast.success('Exam created!');
      setForm({ name: '', date: '', maxMarks: '100', classIds: [], subjectIds: [] });
      setShowForm(false);
      onSelect(res.examSession);
    } catch (err) { toast.error(err?.data?.userMessage || 'Failed to create exam'); }
  };

  const filtered = useMemo(() => exams.filter(e => e.name.toLowerCase().includes(search.toLowerCase())), [exams, search]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-3">
            <Trophy className="text-primary" size={28} />
            Exam Management
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium mt-1">Create exams and enter student marks per class</p>
        </div>
        <button 
          onClick={() => setShowForm(p => !p)} 
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 text-sm ${
            showForm 
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 shadow-gray-200/50' 
              : 'bg-primary text-white hover:bg-primary/90 shadow-primary/25 hover:shadow-primary/40'
          }`}
        >
          {showForm ? <><X size={18} /> Cancel</> : <><Plus size={18} /> Create Exam</>}
        </button>
      </div>

        <div className="grid gap-6 md:grid-cols-3 mt-4">
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 shadow-sm border border-slate-200">
          <h3 className="text-sm font-semibold mb-3">Exam Types Distribution</h3>
          {isLoading ? <Skeleton className="h-40 w-full" /> : (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={(exams || []).reduce((acc, e) => {
                  const name = e.name || 'Unknown';
                  const idx = acc.findIndex(x => x.name === name);
                  if (idx === -1) acc.push({ name, value: 1 }); else acc[idx].value += 1;
                  return acc;
                }, [])} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2">
              <Trophy size={18} className="text-primary" /> New Exam Session
            </h2>
            <form onSubmit={handleCreate} className="space-y-5">
              {/* Row 1: type / date / max marks */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Exam Type *</label>
                  <select value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none text-sm">
                    <option value="">Select type...</option>
                    {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Max Marks *</label>
                  <input type="number" min="1" max="1000" value={form.maxMarks} onChange={e => setForm(p => ({ ...p, maxMarks: e.target.value }))} required
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none text-sm" />
                </div>
              </div>

              {/* Classes */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">
                  Classes * <span className="text-gray-400 font-normal">(select all that apply)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {classes.map(cls => (
                    <button key={cls._id} type="button" onClick={() => toggleClass(cls._id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all ${form.classIds.includes(cls._id) ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-primary/50'}`}>
                      {form.classIds.includes(cls._id) && <Check size={12} className="inline mr-1" />}{cls.name} {cls.section}
                    </button>
                  ))}
                  {!classes.length && <p className="text-sm text-gray-400">No classes found.</p>}
                </div>
              </div>

              {/* Subjects */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">
                  Subjects * <span className="text-gray-400 font-normal">(select all subjects in this exam)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {subjects.map(sub => (
                    <button key={sub._id} type="button" onClick={() => toggleSubject(sub._id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all flex items-center gap-1 ${form.subjectIds.includes(sub._id) ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-emerald-400'}`}>
                      {form.subjectIds.includes(sub._id) && <Check size={12} />}
                      <Tag size={11} />
                      {sub.name}
                      {sub.code && <span className="text-[10px] opacity-60">({sub.code})</span>}
                    </button>
                  ))}
                  {!subjects.length && <p className="text-sm text-gray-400">No subjects found. Create subjects first.</p>}
                </div>
                {form.subjectIds.length > 0 && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5">{form.subjectIds.length} subject{form.subjectIds.length > 1 ? 's' : ''} selected</p>
                )}
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={creating || !form.classIds.length || !form.subjectIds.length}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Create Exam
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exam List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h2 className="font-bold text-gray-900 dark:text-gray-100">Exam Sessions</h2>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exams..."
              className="pl-9 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-primary outline-none text-sm" />
          </div>
        </div>
        {isLoading ? <div className="p-6"><Skeleton className="h-10 w-full" /></div> : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filtered.map(exam => (
              <div key={exam._id} onClick={() => onSelect(exam)}
                className="p-5 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-primary/10"><Trophy size={20} className="text-primary" /></div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">{exam.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${BADGE[exam.name] || 'bg-gray-100 text-gray-600'}`}>{exam.name}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 flex-wrap font-medium">
                      {!selectedBranch && (
                        <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-[10px]">
                          <Globe size={12} /> {exam.branch?.name || 'Main Branch'}
                          &nbsp;·&nbsp;
                        </span>
                      )}
                      <Calendar size={13} /> {new Date(exam.date).toLocaleDateString()}
                      &nbsp;·&nbsp;<Users size={13} /> {exam.classes?.length || 0} classes
                      &nbsp;·&nbsp;<Tag size={13} /> {exam.subjects?.length || 0} subjects
                      &nbsp;·&nbsp; Max: {exam.maxMarks}
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
              </div>
            ))}
            {!filtered.length && (
              <div className="p-10 text-center text-gray-400">
                <Trophy size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No exam sessions yet</p>
                <p className="text-sm mt-1">Click "Create Exam" to get started</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Class Picker ───────────────────────────────────────────────────────────────
function ClassPicker({ exam, onSelectClass, onBack }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 sm:space-y-5">
      <div>
        <button onClick={onBack} className="flex items-center gap-1 text-[10px] sm:text-sm text-gray-500 hover:text-primary transition-colors mb-2 sm:mb-3 font-bold uppercase tracking-wider">
          <ChevronLeft size={14} className="sm:size-4" /> Back to Exams
        </button>
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 shrink-0"><Trophy size={18} className="sm:size-[22px] text-primary" /></div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold font-heading text-gray-900 dark:text-gray-100 truncate">{exam.name}</h1>
            <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 flex-wrap font-medium">
              <Calendar size={12} className="sm:size-3.5" /> {new Date(exam.date).toLocaleDateString()}
              &nbsp;·&nbsp; Max: {exam.maxMarks}
              {exam.subjects?.length > 0 && (
                <>&nbsp;·&nbsp; <Tag size={12} className="sm:size-3.5" /> {exam.subjects.length} Subjects</>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
        <h2 className="font-bold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
          <Users size={16} className="sm:size-[18px]" /> Select a Class
        </h2>
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {exam.classes?.map(cls => (
            <button key={cls._id} onClick={() => onSelectClass(cls)}
              className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl border-2 border-gray-100 dark:border-gray-600 hover:border-primary hover:bg-primary/5 transition-all text-left group">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors text-sm sm:text-base">{cls.name}</span>
                <ChevronRight size={14} className="sm:size-4 text-gray-400 group-hover:text-primary transition-colors" />
              </div>
              <span className="text-[10px] sm:text-xs text-gray-500 font-medium">Section {cls.section}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Marks Entry Table ──────────────────────────────────────────────────────────
const MarksRow = React.memo(({ student, subjects, marksInput, errors, isEditing, saving, onSave, onChange, onEdit, allSaved }) => {
  const saved = allSaved(student);
  
  return (
    <tr className={`${isEditing ? 'bg-primary/5 dark:bg-primary/10' : 'bg-white dark:bg-gray-800'} hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors`}>
      <td className="px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap sticky left-0 z-10 bg-inherit border-r border-gray-100 dark:border-gray-700 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col min-w-[60px] sm:min-w-[70px]">
          <span className="text-[9px] sm:text-[10px] font-mono font-black text-primary uppercase tracking-tighter">{student.studentCustomId}</span>
          <span className={`text-[8px] sm:text-[9px] font-bold ${saved ? 'text-green-500' : 'text-gray-400'}`}>
            {saved ? 'Recorded' : 'Pending'}
          </span>
        </div>
      </td>
      <td className="px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap font-bold text-gray-900 dark:text-gray-100 text-xs sm:text-sm min-w-[100px] sm:min-w-[140px] sticky left-[70px] sm:left-[80px] z-10 bg-inherit border-r border-gray-100 dark:border-gray-700 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
        <div className="truncate max-w-[90px] sm:max-w-none">{student.studentName}</div>
      </td>
      {subjects.map(sub => {
        const errKey = `${student.studentId}-${sub._id}`;
        const err = errors[errKey];
        const existing = student.marks[sub._id];
        return (
          <td key={sub._id} className="px-2 sm:px-3 py-2.5 sm:py-3 border-r border-gray-50 dark:border-gray-700/50">
            {isEditing ? (
              <div className="flex flex-col items-center gap-1">
                <input
                  type="text" inputMode="numeric"
                  value={marksInput?.[sub._id] ?? ''}
                  onChange={e => onChange(student.studentId, sub._id, e.target.value)}
                  className={`w-12 sm:w-16 px-1 sm:px-2 py-1.5 sm:py-2 text-center text-xs sm:text-sm font-black rounded-lg sm:rounded-xl border-2 outline-none transition-all bg-gray-50 dark:bg-gray-700 ${err ? 'border-red-400 ring-4 ring-red-400/10' : 'border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-600'}`}
                  placeholder="—"
                />
                {err && <span className="text-[7px] sm:text-[8px] font-black text-red-500 uppercase">{err}</span>}
              </div>
            ) : (
              <div className="text-center">
                <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 px-2 sm:px-2.5 py-1 rounded-lg min-w-[28px] sm:min-w-[32px] inline-block">
                  {existing?.isSubmitted ? existing.marks : <span className="text-gray-300">—</span>}
                </span>
              </div>
            )}
          </td>
        );
      })}
      <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-center min-w-[80px] sm:min-w-[100px]">
        {isEditing ? (
          <button onClick={() => onSave(student)} disabled={saving}
            className="flex items-center justify-center gap-1 w-full py-1.5 sm:py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg sm:rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50">
            {saving ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />}
            {saving ? 'Saving' : 'Save'}
          </button>
        ) : (
          <button onClick={() => handleEdit(student.studentId)}
            className="flex items-center justify-center gap-1 w-full py-1.5 sm:py-2 bg-primary hover:bg-primary/90 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg sm:rounded-xl transition-all shadow-lg shadow-primary/20">
            <Edit3 size={10} /> Edit
          </button>
        )}
      </td>
    </tr>
  );
});

function MarksEntry({ exam, cls, onBack }) {
  const { data, isLoading, refetch } = useGetClassExamMarksQuery({ examSessionId: exam._id, classId: cls._id });
  const [submitMarks] = useSubmitClassExamMarksMutation();

  const [marksInput, setMarksInput] = useState({});
  const [editingRows, setEditingRows] = useState(new Set());
  const [savingRows, setSavingRows] = useState(new Set());
  const [errors, setErrors] = useState({});

  const maxMarks = data?.examSession?.maxMarks || exam.maxMarks || 100;

  useEffect(() => {
    if (!data) return;
    setMarksInput(prev => {
      const next = { ...prev };
      data.students.forEach(s => {
        if (!next[s.studentId]) {
          next[s.studentId] = {};
          data.subjects.forEach(sub => {
            const m = s.marks[sub._id];
            next[s.studentId][sub._id] = m?.isSubmitted ? String(m.marks) : '';
          });
        }
      });
      return next;
    });
  }, [data]);

  const allSaved = (student) => data?.subjects?.every(sub => student.marks[sub._id]?.isSubmitted);

  const handleChange = (sid, subId, val) => {
    if (val !== '' && !/^\d*$/.test(val)) return;
    setMarksInput(p => ({ ...p, [sid]: { ...p[sid], [subId]: val } }));
    setErrors(p => { const n = { ...p }; delete n[`${sid}-${subId}`]; return n; });
  };

  const validate = (sid) => {
    const errs = {};
    let ok = true;
    data.subjects.forEach(sub => {
      const v = marksInput[sid]?.[sub._id] ?? '';
      if (v === '') { errs[`${sid}-${sub._id}`] = 'Req'; ok = false; }
      else if (Number(v) > maxMarks) { errs[`${sid}-${sub._id}`] = `Max ${maxMarks}`; ok = false; }
    });
    setErrors(p => ({ ...p, ...errs }));
    return ok;
  };

  const handleSave = async (student) => {
    if (!validate(student.studentId)) { toast.error('Fix errors before saving'); return; }
    const subjectMarks = data.subjects.map(sub => ({
      subjectId: sub._id,
      marks: Number(marksInput[student.studentId][sub._id]),
      remarks: '',
    }));
    setSavingRows(p => new Set(p).add(student.studentId));
    try {
      await submitMarks({ examSessionId: exam._id, classId: cls._id, studentId: student.studentId, subjectMarks }).unwrap();
      toast.success(`Marks saved for ${student.studentName}`);
      setEditingRows(p => { const n = new Set(p); n.delete(student.studentId); return n; });
      refetch();
    } catch (err) {
      toast.error(err?.data?.userMessage || 'Failed to save marks');
    } finally {
      setSavingRows(p => { const n = new Set(p); n.delete(student.studentId); return n; });
    }
  };

  const handleEdit = (studentId) => {
    setEditingRows(p => new Set(p).add(studentId));
  };

  if (isLoading) return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <Skeleton className="h-10 w-full" />
    </div>
  );

  const subjects = data?.subjects || [];
  const students = data?.students || [];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <BookOpen size={18} className="sm:size-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold font-heading text-gray-900 dark:text-gray-100 leading-tight truncate">
              {cls.name} {cls.section}
            </h1>
            <p className="text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5 truncate">
              {exam.name} • Max: {maxMarks}
            </p>
          </div>
        </div>
        <button onClick={onBack} className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-xl hover:bg-gray-100 transition-all font-black text-[9px] sm:text-[10px] uppercase tracking-widest border border-gray-100 dark:border-gray-600 shadow-sm self-end sm:self-auto">
          <ChevronLeft size={14} /> Back
        </button>
      </div>

      {!subjects.length ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-10 text-center text-gray-400">
          <Tag size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-sm uppercase font-black tracking-widest">No Subjects Found</p>
          <p className="text-xs mt-1">This exam has no subjects assigned.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar scrollbar-hide">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0 z-20">
                <tr>
                  <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest sticky left-0 z-30 bg-gray-50 dark:bg-gray-700 border-r border-gray-100 dark:border-gray-600 shadow-[2px_0_5px_rgba(0,0,0,0.05)] w-[70px] sm:w-[80px]">ID/Status</th>
                  <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest sticky left-[70px] sm:left-[80px] z-30 bg-gray-50 dark:bg-gray-700 border-r border-gray-100 dark:border-gray-600 shadow-[2px_0_5px_rgba(0,0,0,0.05)] min-w-[100px] sm:min-w-[140px]">Student Name</th>
                  {subjects.map(sub => (
                    <th key={sub._id} className="px-2 sm:px-3 py-3 sm:py-4 text-center text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest border-r border-gray-100 dark:border-gray-600 min-w-[60px] sm:min-w-[80px]">
                      <div className="line-clamp-1 max-w-[60px] sm:max-w-[80px] mx-auto">{sub.name}</div>
                      <div className="text-[7px] sm:text-[8px] font-mono opacity-50">{sub.code}</div>
                    </th>
                  ))}
                  <th className="px-3 sm:px-4 py-3 sm:py-4 text-center text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest min-w-[80px] sm:min-w-[100px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {students.map((student) => (
                  <MarksRow
                    key={student.studentId}
                    student={student}
                    subjects={subjects}
                    marksInput={marksInput[student.studentId]}
                    errors={errors}
                    isEditing={editingRows.has(student.studentId) || !allSaved(student)}
                    saving={savingRows.has(student.studentId)}
                    onSave={handleSave}
                    onChange={handleChange}
                    onEdit={handleEdit}
                    allSaved={allSaved}
                  />
                ))}
                {!students.length && (
                  <tr><td colSpan={subjects.length + 3} className="py-12 text-center text-gray-400 uppercase font-black text-xs tracking-widest">
                    No students in this class
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── Class Results View ──────────────────────────────────────────────────────────
function ClassResultsView({ onBack }) {
  const { data: classes = [] } = useGetClassesQuery();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('Final');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  const { data, isLoading, isFetching } = useGetClassResultsQuery(
    { 
      classId: selectedClass, 
      examName: selectedExamType.replace(/\s+/g, '').toLowerCase() 
    },
    { skip: !selectedClass }
  );

  const results = data?.results || [];
  const subjectStats = data?.subjectStats || {};

  const subjects = useMemo(() => {
    if (!results.length) return [];
    const subMap = new Map();
    results.forEach(r => r.subjectMarks.forEach(sm => subMap.set(sm.subjectId, sm.subjectName)));
    return Array.from(subMap.entries()).map(([id, name]) => ({ id, name }));
  }, [results]);

  const filteredResults = useMemo(() => {
    return results.filter(r => 
      r.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.student.customId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [results, searchTerm]);

  const paginatedResults = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredResults.slice(start, start + itemsPerPage);
  }, [filteredResults, page]);

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  const handlePrint = () => window.print();
  const handleExportExcel = () => {
    const cls = classes.find(c => c._id === selectedClass);
    const classLabel = cls ? `${cls.name} — ${cls.section}` : 'All Classes';
    const headers = ['Student Name', 'Class', 'Subject', 'Score', 'Grade', 'Status'];
    const rows = [];
    filteredResults.forEach(r => {
      const status = r.average >= 50 ? 'Pass' : 'Fail';
      if (!r.subjectMarks.length) {
        rows.push([r.student.name, classLabel, '—', '—', r.grade, status]);
      } else {
        r.subjectMarks.forEach(sm => {
          rows.push([r.student.name, classLabel, sm.subjectName, sm.score, r.grade, status]);
        });
      }
    });
    const csv = [headers, ...rows].map(row => row.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-results-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported to CSV successfully');
  };

  const handleExportPDF = () => {
    const cls = classes.find(c => c._id === selectedClass);
    const classLabel = cls ? `${cls.name} — ${cls.section}` : 'All Classes';
    const th = (label) => `<th style="padding:8px 12px;border:1px solid #ddd;background:#f3f4f6;font-size:12px;text-align:center">${label}</th>`;
    const subHeaders = subjects.map(s => th(s.name)).join('');
    const bodyRows = filteredResults.map(r => {
      const subCells = subjects.map(s => {
        const m = r.subjectMarks.find(sm => sm.subjectId === s.id);
        return `<td style="padding:6px 10px;border:1px solid #ddd;text-align:center;font-size:12px">${m ? m.score : '—'}</td>`;
      }).join('');
      return `<tr>
        <td style="padding:6px 10px;border:1px solid #ddd;font-size:12px;font-weight:bold">#${r.position}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;font-size:12px;font-weight:bold">${r.student.name}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;font-size:12px;font-family:monospace">${r.student.customId}</td>
        ${subCells}
        <td style="padding:6px 10px;border:1px solid #ddd;text-align:center;font-size:12px;font-weight:bold">${r.total}</td>
        <td style="padding:6px 10px;border:1px solid #ddd;text-align:center;font-size:12px">${r.average}%</td>
        <td style="padding:6px 10px;border:1px solid #ddd;text-align:center;font-size:12px;font-weight:bold">${r.grade}</td>
      </tr>`;
    }).join('');
    const html = `<!DOCTYPE html><html><head><title>Exam Results</title></head><body style="font-family:Arial,sans-serif;padding:20px">
      <h2 style="margin:0 0 4px">Exam Results</h2>
      <p style="margin:0 0 16px;color:#666;font-size:13px">${classLabel} &middot; Generated ${new Date().toLocaleDateString()}</p>
      <table style="border-collapse:collapse;width:100%">
        <thead><tr>${th('Rank')}${th('Student Name')}${th('ID')}${subHeaders}${th('Total')}${th('Average')}${th('Grade')}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>
    </body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.print();
    toast.success('PDF export ready');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 md:space-y-6 print:space-y-0 print:p-0">
      {/* Header - Hidden on Print */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-3">
            <Trophy className="text-amber-500 shrink-0" size={24} />
            <span className="truncate">Class Rankings & Results</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View overall performance and rankings per class</p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button onClick={handlePrint} title="Print Rankings" className="p-2 md:p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:text-primary transition-all">
            <Printer size={18} />
          </button>
          <button onClick={handleExportExcel} title="Export Excel" className="p-2 md:p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-all">
            <FileSpreadsheet size={18} />
          </button>
          <button onClick={handleExportPDF} title="Export PDF" className="p-2 md:p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-red-600 hover:bg-red-50 transition-all">
            <FileText size={18} />
          </button>
          <button onClick={onBack} className="ml-auto flex items-center gap-1.5 px-3 py-2 text-gray-500 hover:text-primary transition-colors font-bold text-sm">
            <ChevronLeft size={16} /> <span>Back</span>
          </button>
        </div>
      </div>

      {/* Filters - Hidden on Print */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-5 grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-4 items-end print:hidden">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-[10px] md:text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Select Class</label>
          <select value={selectedClass} onChange={e => {setSelectedClass(e.target.value); setPage(1);}}
            className="w-full px-3 md:px-4 py-2 md:py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none text-xs md:text-sm font-medium"
          >
            <option value="">Choose a class...</option>
            {classes.map(cls => <option key={cls._id} value={cls._id}>{cls.name} — {cls.section}</option>)}
          </select>
        </div>
        <div className="w-full sm:w-auto lg:w-48">
          <label className="block text-[10px] md:text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Exam Period</label>
          <select value={selectedExamType} onChange={e => setSelectedExamType(e.target.value)}
            className="w-full px-3 md:px-4 py-2 md:py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none text-xs md:text-sm font-medium"
          >
            {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="w-full sm:col-span-2 lg:w-64 lg:flex-none">
          <label className="block text-[10px] md:text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Search Student</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setPage(1);}} placeholder="Name or ID..."
              className="w-full pl-9 pr-4 py-2 md:py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none text-xs md:text-sm" />
          </div>
        </div>
      </div>

      {isLoading || isFetching ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 print:hidden">
          <Skeleton className="h-10 w-full" />
        </div>
      ) : !selectedClass ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-16 text-center text-gray-400 print:hidden">
          <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Select a class to view rankings</p>
          <p className="text-sm mt-1">Choose a class and exam type from the filters above.</p>
        </div>
      ) : !results.length ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-16 text-center text-gray-400 print:hidden">
          <AlertCircle size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No results found</p>
          <p className="text-sm mt-1">No marks have been submitted for this class yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Print Header */}
          <div className="hidden print:block text-center mb-6">
            <h1 className="text-2xl font-bold uppercase">{selectedExamType} Class Rankings</h1>
            <p className="text-gray-600">{classes.find(c => c._id === selectedClass)?.name} — {classes.find(c => c._id === selectedClass)?.section}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm min-w-[1000px]">
                <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0 z-20">
                  <tr>
                    <th className="px-3 md:px-4 py-3 md:py-4 text-left text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase sticky left-0 bg-gray-50 dark:bg-gray-700 z-30 shadow-[2px_0_5px_rgba(0,0,0,0.05)] w-12 md:w-16">POS</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase sticky left-12 md:left-16 bg-gray-50 dark:bg-gray-700 z-30 shadow-[2px_0_5px_rgba(0,0,0,0.05)] min-w-[120px] md:min-w-[200px]">STUDENT</th>
                    {subjects.map(sub => (
                      <th key={sub.id} className="px-3 md:px-4 py-3 md:py-4 text-center text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase min-w-[60px] md:min-w-[100px] border-l border-gray-100 dark:border-gray-700">
                        {sub.name}
                      </th>
                    ))}
                    <th className="px-4 md:px-6 py-3 md:py-4 text-center text-[10px] md:text-xs font-bold text-primary uppercase bg-primary/5 border-l border-gray-100 dark:border-gray-700 min-w-[70px]">TOTAL</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-center text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase min-w-[70px]">AVG</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-center text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase min-w-[70px]">GRADE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {paginatedResults.map((r) => (
                    <tr key={r.student._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                      <td className="px-3 md:px-4 py-4 md:py-5 whitespace-nowrap sticky left-0 bg-white dark:bg-gray-800 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                        <div className={`w-6 h-6 md:w-9 md:h-9 rounded-lg md:rounded-xl flex items-center justify-center font-black text-[10px] md:text-base shadow-sm border-2 ${
                          r.position === 1 ? 'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-white border-amber-200' : 
                          r.position === 2 ? 'bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 text-slate-800 border-slate-100' : 
                          r.position === 3 ? 'bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400 text-white border-orange-100' : 
                          'bg-gray-50 text-gray-500 border-gray-100 dark:bg-gray-700 dark:border-gray-600'
                        }`}>
                          #{r.position}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 md:py-5 whitespace-nowrap sticky left-12 md:left-16 bg-white dark:bg-gray-800 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                        <div className="font-bold text-gray-900 dark:text-gray-100 text-xs md:text-base truncate max-w-[100px] md:max-w-none">{r.student.name}</div>
                        <div className="text-[8px] md:text-[10px] text-primary font-mono font-bold uppercase tracking-wider">{r.student.customId}</div>
                      </td>
                      {subjects.map(sub => {
                        const m = r.subjectMarks.find(sm => sm.subjectId === sub.id);
                        return (
                          <td key={sub.id} className="px-3 md:px-4 py-4 md:py-5 text-center border-l border-gray-50 dark:border-gray-800">
                            <span className="font-bold text-gray-700 dark:text-gray-300 text-xs md:text-base">
                              {m ? m.score : '—'}
                            </span>
                          </td>
                        );
                      })}
                      <td className="px-4 md:px-6 py-4 md:py-5 text-center whitespace-nowrap bg-primary/5 border-l border-gray-50 dark:border-gray-800">
                        <span className="font-black text-primary text-sm md:text-lg">{r.total}</span>
                      </td>
                      <td className="px-4 md:px-6 py-4 md:py-5 text-center whitespace-nowrap font-bold text-gray-700 dark:text-gray-300 text-xs md:text-base">
                        {r.average}%
                      </td>
                      <td className="px-4 md:px-6 py-4 md:py-5 text-center whitespace-nowrap">
                        <span className={`px-2 md:px-4 py-1 rounded-lg md:rounded-xl text-[9px] md:text-xs font-black shadow-sm ${
                          r.average >= 90 ? 'bg-green-500 text-white' :
                          r.average >= 80 ? 'bg-emerald-500 text-white' :
                          r.average >= 70 ? 'bg-blue-500 text-white' :
                          r.average >= 60 ? 'bg-indigo-500 text-white' :
                          r.average >= 50 ? 'bg-amber-500 text-white' :
                          r.average >= 40 ? 'bg-orange-500 text-white' :
                          'bg-red-500 text-white'
                        }`}>
                          {r.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-100 dark:divide-gray-700">
              {paginatedResults.map((r) => (
                <div key={r.student._id} className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm border-2 ${
                        r.position === 1 ? 'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-white border-amber-200' : 
                        r.position === 2 ? 'bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 text-slate-800 border-slate-100' : 
                        r.position === 3 ? 'bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400 text-white border-orange-100' : 
                        'bg-gray-50 text-gray-500 border-gray-100 dark:bg-gray-700 dark:border-gray-600'
                      }`}>
                        #{r.position}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">{r.student.name}</div>
                        <div className="text-[10px] text-primary font-mono font-bold uppercase tracking-wider">{r.student.customId}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-primary leading-none">{r.total}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase">Total Score</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-xl text-center">
                      <div className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">Average</div>
                      <div className="text-sm font-black text-gray-700 dark:text-gray-200">{r.average}%</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-xl text-center">
                      <div className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">Grade</div>
                      <div className="text-sm font-black text-primary">{r.grade}</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-xl text-center">
                      <div className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">Subjects</div>
                      <div className="text-sm font-black text-gray-700 dark:text-gray-200">{r.subjectMarks.length}</div>
                    </div>
                  </div>

                  <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
                    {r.subjectMarks.map(sm => (
                      <div key={sm.subjectId} className="flex-shrink-0 px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg text-center min-w-[60px]">
                        <div className="text-[8px] font-bold text-indigo-400 uppercase truncate max-w-[50px]">{sm.subjectName}</div>
                        <div className="text-xs font-black text-indigo-600 dark:text-indigo-400">{sm.score}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination - Hidden on Print */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4 print:hidden">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-30">
                <ChevronLeft size={18} />
              </button>
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${page === i + 1 ? 'bg-primary text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-30">
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function ExamsManagement() {
  const [view, setView] = useState('list'); // 'list', 'classes', 'marks', 'results'
  const [exam, setExam] = useState(null);
  const [cls, setCls] = useState(null);

  const selectExam = e => { setExam(e); setView('classes'); };
  const selectClass = c => { setCls(c); setView('marks'); };
  const backToList = () => { setView('list'); setExam(null); setCls(null); };
  const backToClasses = () => { setView('classes'); setCls(null); };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* View Switcher */}
      {view === 'list' && (
        <div className="flex justify-center">
          <div className="bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex gap-1">
            <button
              onClick={() => setView('list')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${view === 'list' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              Exams & Marks
            </button>
            <button
              onClick={() => setView('results')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${view === 'results' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              Class Rankings
            </button>
          </div>
        </div>
      )}

      {view === 'list' && <ExamList onSelect={selectExam} />}
      {view === 'results' && <ClassResultsView onBack={() => setView('list')} />}
      {view === 'classes' && exam && <ClassPicker exam={exam} onSelectClass={selectClass} onBack={backToList} />}
      {view === 'marks' && exam && cls && <MarksEntry exam={exam} cls={cls} onBack={backToClasses} />}
    </div>
  );
}
