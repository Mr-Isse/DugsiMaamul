import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Upload, FileSpreadsheet, Download, CheckCircle2, XCircle,
  AlertCircle, ChevronRight, Loader2, Users, SkipForward,
  Key, RefreshCw, Eye, EyeOff, Info
} from 'lucide-react';
import {
  useImportStudentsMutation,
  useImportExamResultsMutation,
  useDownloadCredentialsFileMutation,
  useDownloadStudentErrorsMutation,
  useDownloadExamErrorsMutation,
  useGetExamsQuery,
  useImportTeachersMutation,
  useDownloadTeacherErrorsMutation,
} from '../store/adminApiSlice';
import { useToast } from './ToastContainer';
import { buildApiUrl } from '../utils/apiConfig';

// Helper: trigger a blob download
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Step indicator ─────────────────────────────────────────────────────────
const steps = ['Upload', 'Preview', 'Results'];

function StepBar({ current }) {
  return (
    <div className={`flex items-center gap-2 mb-6`}>
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${i <= current ? 'text-white' : 'text-slate-500'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${i < current ? 'bg-indigo-500 text-white border-indigo-500' : i === current ? 'border-white text-white' : 'border-slate-700 text-slate-500'}`}>
              {i < current ? <CheckCircle2 size={14} /> : i + 1}
            </div>
            <span className="hidden sm:inline">{s}</span>
          </div>
          {i < steps.length - 1 && <div className={`flex-1 h-px transition-colors ${i < current ? 'bg-indigo-500' : 'bg-slate-800'}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Drag & Drop Zone ───────────────────────────────────────────────────────
function DropZone({ onFile, file }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }, [onFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${dragging ? 'border-indigo-500 bg-indigo-500/5 scale-[1.01]' : file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-800 bg-slate-900/30 hover:border-indigo-500/50 hover:bg-slate-800'}`}
    >
      <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />
      {file ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <FileSpreadsheet size={24} className="text-emerald-400" />
          </div>
          <p className="text-sm font-bold text-emerald-400">{file.name}</p>
          <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700">
            <Upload size={26} className="text-slate-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Drag & drop your file here</p>
            <p className="text-xs text-slate-500 mt-1">or click to browse · .xlsx, .xls, .csv · max 5 MB</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Preview Table ──────────────────────────────────────────────────────────
function PreviewTable({ data, type }) {
  const [showInvalidOnly, setShowInvalidOnly] = useState(false);
  const allRows = [...(data.willCreate || []), ...(data.errors || [])];
  const displayed = showInvalidOnly ? (data.errors || []) : allRows;
  const cols = type === 'exams'
    ? ['Student ID', 'Subject', 'Score', 'Term']
    : type === 'teachers'
    ? ['Name', 'Phone', 'Email', 'Subjects', 'Status']
    : ['Name', 'Class', 'Phone', 'Email', 'Status'];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{data.willCreate?.length || 0} valid</span>
          <span className="text-xs font-bold px-2 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">{data.errors?.length || 0} invalid</span>
          <span className="text-xs font-bold px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">{data.skipped?.length || 0} skipped</span>
        </div>
        {data.errors?.length > 0 && (
          <button onClick={() => setShowInvalidOnly(!showInvalidOnly)} className="text-xs font-bold text-indigo-400 flex items-center gap-1 hover:text-indigo-300 transition-colors">
            {showInvalidOnly ? <Eye size={12} /> : <EyeOff size={12} />}
            {showInvalidOnly ? 'Show all' : 'Errors only'}
          </button>
        )}
      </div>
      <div className="overflow-auto rounded-xl border border-slate-800 bg-[#0f172a] max-h-64 custom-scrollbar">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-900/50 border-b border-slate-800">
              <th className="px-3 py-3 text-left font-black text-slate-500 uppercase tracking-widest">Row</th>
              {cols.map(c => <th key={c} className="px-3 py-3 text-left font-black text-slate-500 uppercase tracking-widest">{c}</th>)}
              <th className="px-3 py-3 text-left font-black text-slate-500 uppercase tracking-widest">Issue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {displayed.map((row, i) => {
              const isError = data.errors?.some(e => e.row === row.row);
              return (
                <tr key={i} className={`transition-colors ${isError ? 'bg-rose-500/5' : 'hover:bg-slate-800/30'}`}>
                  <td className="px-3 py-2.5 font-mono text-slate-600 font-bold">{row.row}</td>
                  {type === 'exams' ? (
                    <>
                      <td className="px-3 py-2.5 text-slate-300 font-medium">{row.data?.studentId || row.studentId || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-300 font-medium">{row.data?.subjectName || row.subjectName || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-300 font-medium">{row.data?.score ?? row.score ?? '—'}</td>
                      <td className="px-3 py-2.5 text-slate-300 font-medium">—</td>
                    </>
                  ) : type === 'teachers' ? (
                    <>
                      <td className="px-3 py-2.5 text-white font-bold">{row.data?.name || row.name || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-300 font-medium">{row.data?.phone || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-300 font-medium">{row.data?.email || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-300 font-medium">{row.subjects || '—'}</td>
                      <td className="px-3 py-2.5 font-bold">{isError ? <span className="text-rose-400">Invalid</span> : <span className="text-emerald-400">Valid</span>}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-2.5 text-white font-bold">{row.data?.name || row.name || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-300 font-medium">{row.class || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-300 font-medium">{row.data?.phone || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-300 font-medium">{row.data?.email || '—'}</td>
                      <td className="px-3 py-2.5 font-bold">{isError ? <span className="text-rose-400">Invalid</span> : <span className="text-emerald-400">Valid</span>}</td>
                    </>
                  )}
                  <td className="px-3 py-2.5 text-rose-400 font-medium max-w-xs truncate">{isError ? (data.errors.find(e => e.row === row.row)?.errors?.join(', ') || data.errors.find(e => e.row === row.row)?.reason || '') : ''}</td>
                </tr>
              );
            })}
            {displayed.length === 0 && (
              <tr><td colSpan={cols.length + 2} className="px-3 py-10 text-center text-slate-600 font-black uppercase tracking-widest text-[10px]">No rows to display</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────────────────
export default function BulkImportModal({ type = 'students', onClose, onImported }) {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [credentialMode, setCredentialMode] = useState('auto');
  const [examId, setExamId] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [uploading, setUploading] = useState(false);

  const toast = useToast();
  const [importStudents] = useImportStudentsMutation();
  const [importExamResults] = useImportExamResultsMutation();
  const [importTeachers] = useImportTeachersMutation();
  const [downloadCredFile] = useDownloadCredentialsFileMutation();
  const [downloadStudentErr] = useDownloadStudentErrorsMutation();
  const [downloadExamErr] = useDownloadExamErrorsMutation();
  const [downloadTeacherErr] = useDownloadTeacherErrorsMutation();
  const { data: exams } = useGetExamsQuery(undefined, { skip: type !== 'exams' });

  const handleDownloadTemplate = () => {
    const urlMap = {
      students: 'students/import/template',
      exams:    'exams/import/template',
      teachers: 'teachers/import/template',
    };
    const url = buildApiUrl(`/admin/${urlMap[type] || 'students/import/template'}`);
    window.open(url, '_blank');
  };

  // Step 0 → 1: dry-run preview via real API call
  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file first.');
    if (type === 'exams' && !examId) return toast.error('Please select an exam first.');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('credentialMode', credentialMode);
      fd.append('dryRun', 'true');
      if (type === 'exams') fd.append('examId', examId);

      let result;
      if (type === 'exams') {
        result = await importExamResults(fd).unwrap();
      } else if (type === 'teachers') {
        result = await importTeachers(fd).unwrap();
      } else {
        result = await importStudents(fd).unwrap();
      }
      // Normalise dry-run response into preview shape
      console.info('[BulkImport] preview parsed', {
        type,
        parsedRecords: (result.willCreate?.length || 0) + (result.errors?.length || 0) + (result.skipped?.length || 0),
        validRecords: result.willCreate?.length || 0,
        failedRecords: result.errors?.length || 0,
        skippedRecords: result.skipped?.length || 0,
      });
      setPreviewData({
        willCreate: result.willCreate || [],
        errors: result.errors || [],
        skipped: result.skipped || [],
      });
      setStep(1);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to parse file. Please check the format.');
    } finally {
      setUploading(false);
    }
  };

  // Step 1 → 2: confirmed import (no dryRun)
  const handleConfirm = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const validCount = previewData?.willCreate?.length || 0;
      console.info('[BulkImport] submitting import', {
        type,
        requestPayloadCount: validCount,
        credentialMode,
      });

      const fd = new FormData();
      fd.append('file', file);
      fd.append('credentialMode', credentialMode);
      if (type === 'exams') fd.append('examId', examId);

      let result;
      if (type === 'exams') {
        result = await importExamResults(fd).unwrap();
      } else if (type === 'teachers') {
        result = await importTeachers(fd).unwrap();
      } else {
        result = await importStudents(fd).unwrap();
      }
      const createdCount = result.summary?.created ?? result.summary?.inserted ?? 0;
      const errorCount = result.summary?.errors ?? result.errors?.length ?? 0;
      console.info('[BulkImport] import result', {
        type,
        requestedValidRecords: validCount,
        databaseCreatedRecords: createdCount,
        failedRecords: errorCount,
        skippedRecords: result.summary?.skipped ?? 0,
      });
      setImportResult(result);
      setStep(2);
      if (type === 'students' && createdCount > 0 && typeof onImported === 'function') {
        onImported(result);
      }
    } catch (err) {
      console.error('[BulkImport] import failed', {
        type,
        requestPayloadCount: previewData?.willCreate?.length || 0,
        message: err?.data?.message || err?.error || err?.message,
      });
      toast.error(err?.data?.userMessage || err?.data?.message || 'Import failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadCredentials = async () => {
    if (!importResult?.credentials?.length) return;
    try {
      const blob = await downloadCredFile(importResult.credentials).unwrap();
      triggerDownload(blob, 'student_credentials.xlsx');
    } catch { toast.error('Failed to download credentials.'); }
  };

  const handleDownloadErrors = async () => {
    const errs = importResult?.errors || [];
    if (!errs.length) return;
    try {
      let blob;
      if (type === 'exams')    blob = await downloadExamErr(errs).unwrap();
      else if (type === 'teachers') blob = await downloadTeacherErr(errs).unwrap();
      else                      blob = await downloadStudentErr(errs).unwrap();
      triggerDownload(blob, `${type}_import_errors.xlsx`);
    } catch { toast.error('Failed to download error report.'); }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#1e293b] rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative overflow-hidden border border-slate-800"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Bulk Import {type}</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Efficiency Control Center</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-500 hover:text-white border border-transparent hover:border-slate-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-8">
            <StepBar current={step} />

            {step === 0 && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row gap-4 items-start justify-between p-6 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-600/20">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                      <Download size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-lg">Need the template?</h3>
                      <p className="text-sm text-indigo-100 font-medium">Download our standardized {type} import format.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadTemplate}
                    className="w-full sm:w-auto px-6 py-3 bg-white text-indigo-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-lg"
                  >
                    Get Template
                  </button>
                </div>

                <DropZone onFile={setFile} file={file} />

                {type === 'exams' && (
                  <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Select Target Examination</label>
                    <select
                      value={examId}
                      onChange={(e) => setExamId(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0f172a] border-2 border-slate-800 rounded-2xl text-white text-sm font-bold focus:border-indigo-500 transition-all outline-none"
                    >
                      <option value="">Choose Exam...</option>
                      {exams?.map(ex => <option key={ex._id} value={ex._id}>{ex.name}</option>)}
                    </select>
                  </div>
                )}

                {type === 'students' && (
                  <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Credential Generation</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setCredentialMode('auto')}
                        className={`px-4 py-3 rounded-xl border-2 text-xs font-black uppercase tracking-widest transition-all ${credentialMode === 'auto' ? 'border-indigo-600 bg-indigo-500/10 text-indigo-400' : 'border-slate-800 text-slate-500 hover:border-slate-700'}`}
                      >
                        <RefreshCw size={14} className="inline mr-2" /> Auto
                      </button>
                      <button
                        onClick={() => setCredentialMode('delayed')}
                        className={`px-4 py-3 rounded-xl border-2 text-xs font-black uppercase tracking-widest transition-all ${credentialMode === 'delayed' ? 'border-indigo-600 bg-indigo-500/10 text-indigo-400' : 'border-slate-800 text-slate-500 hover:border-slate-700'}`}
                      >
                        <Key size={14} className="inline mr-2" /> Delayed
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 1 && previewData && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <PreviewTable data={previewData} type={type} />
                {previewData.errors?.length > 0 && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3">
                    <AlertCircle className="text-amber-500 shrink-0" size={20} />
                    <p className="text-xs text-amber-500/90 font-medium leading-relaxed">
                      We found some issues. Invalid rows will be <span className="font-black underline">skipped</span>. You can fix them in your file and re-upload, or proceed with valid rows.
                    </p>
                  </div>
                )}
              </div>
            )}

            {step === 2 && importResult && (
              <div className="text-center py-10 space-y-6 animate-in zoom-in-95 duration-500">
                {(importResult.summary?.created ?? importResult.summary?.inserted ?? 0) > 0 && (importResult.summary?.errors ?? importResult.errors?.length ?? 0) === 0 ? (
                <div className="w-20 h-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 border-4 border-slate-900">
                  <CheckCircle2 size={40} className="text-white" />
                </div>
                ) : (
                <div className="w-20 h-20 bg-rose-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-rose-500/20 border-4 border-slate-900">
                  <XCircle size={40} className="text-white" />
                </div>
                )}
                <div>
                  <h3 className="text-2xl font-black text-white">
                    {(importResult.summary?.created ?? importResult.summary?.inserted ?? 0) > 0 ? 'Import Complete' : 'Import Failed'}
                  </h3>
                  <p className="text-slate-400 font-medium mt-2">
                    {(importResult.summary?.created ?? importResult.summary?.inserted ?? 0) > 0
                      ? 'Saved records were verified in the database.'
                      : 'No records were saved. Review the error report.'}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                   <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                      <p className="text-2xl font-black text-white">{importResult.summary?.created ?? importResult.summary?.inserted ?? 0}</p>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Created</p>
                   </div>
                   <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                      <p className="text-2xl font-black text-white">{importResult.summary?.skipped ?? 0}</p>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Skipped</p>
                   </div>
                   <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                      <p className="text-2xl font-black text-rose-400">{importResult.summary?.errors ?? importResult.errors?.length ?? 0}</p>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Failed</p>
                   </div>
                </div>

                {importResult.credentials?.length > 0 && (
                  <button
                    onClick={handleDownloadCredentials}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                  >
                    <Download size={16} /> Download Login Credentials
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-slate-900/50 border-t border-slate-800 flex items-center justify-between">
            {step === 0 ? (
              <button onClick={onClose} className="text-xs font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Cancel Process</button>
            ) : (
              <button
                onClick={() => setStep(step - 1)}
                className="text-xs font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                disabled={uploading || step === 2}
              >
                Back
              </button>
            )}

            <div className="flex gap-3">
              {step === 0 && (
                <button
                  onClick={handleUpload}
                  disabled={!file || uploading || (type === 'exams' && !examId)}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : 'Analyze File'}
                </button>
              )}
              {step === 1 && (
                <>
                  <button
                    onClick={handleDownloadErrors}
                    className="px-6 py-3 bg-slate-800 text-slate-300 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700"
                  >
                    Export Errors
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={uploading || !previewData?.willCreate?.length}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                  >
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : `Import ${previewData?.willCreate?.length} Rows`}
                  </button>
                </>
              )}
              {step === 2 && (
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700"
                >
                  Close Manager
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
