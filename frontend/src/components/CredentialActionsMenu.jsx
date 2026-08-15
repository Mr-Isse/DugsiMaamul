import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, RefreshCw, ChevronDown, Loader2, Copy, Download, Check } from 'lucide-react';
import {
  useGenerateStudentLoginMutation,
  useResetStudentPasswordMutation,
  useDownloadCredentialsFileMutation,
} from '../store/adminApiSlice';
import { useToast } from './ToastContainer';

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function CredentialActionsMenu({ student }) {
  const [open, setOpen] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetMode, setResetMode] = useState('generate');
  const [newPassword, setNewPassword] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [generatedCreds, setGeneratedCreds] = useState(null);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef();
  const toast = useToast();

  const [generateLogin, { isLoading: isGenerating }] = useGenerateStudentLoginMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetStudentPasswordMutation();
  const [downloadCredFile] = useDownloadCredentialsFileMutation();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleGenerateLogin = async () => {
    setOpen(false);
    try {
      const result = await generateLogin(student._id).unwrap();
      setGeneratedCreds(result.credentials);
      toast.success(`Credentials generated for ${student.name}`);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to generate credentials.');
    }
  };

  const handleResetPassword = async () => {
    if (resetMode === 'manual' && (!newPassword || newPassword.length < 8)) return toast.error('Password must be at least 8 characters.');
    try {
      const result = await resetPassword({
        id: student._id,
        generateRandom: resetMode === 'generate',
        newPassword: resetMode === 'manual' ? newPassword : undefined
      }).unwrap();
      toast.success('Password reset successfully.');
      setGeneratedPassword(result?.generatedPassword || '');
      if (!result?.generatedPassword) setShowReset(false);
      setNewPassword('');
      setOpen(false);
    } catch (err) {
      toast.error(err?.data?.userMessage || err?.data?.message || 'Failed to reset password.');
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = async () => {
    if (!generatedCreds) return;
    try {
      const blob = await downloadCredFile([generatedCreds]).unwrap();
      triggerDownload(blob, `${generatedCreds.customId}_credentials.xlsx`);
    } catch { toast.error('Download failed.'); }
  };

  const noCredentials = !student.credentialsGenerated;

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
      >
        <Key size={13} />
        Credentials
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 right-0 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
          >
            {/* Generate Login — only if no credentials yet */}
            {noCredentials && (
              <button
                onClick={handleGenerateLogin}
                disabled={isGenerating}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors"
              >
                {isGenerating ? <Loader2 size={13} className="animate-spin" /> : <Key size={13} />}
                Generate Login
              </button>
            )}

            {/* Reset Password */}
            <button
              onClick={() => { setShowReset(!showReset); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors border-t border-gray-100 dark:border-gray-700"
            >
              <RefreshCw size={13} />
              Reset Password
            </button>

            {/* Pending badge */}
            {noCredentials && (
              <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/10 border-t border-yellow-100 dark:border-yellow-900">
                <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">⚠ No credentials yet</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Credentials Card */}
      <AnimatePresence>
        {generatedCreds && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setGeneratedCreds(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Key size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Credentials Generated</p>
                  <p className="text-xs text-gray-400">{generatedCreds.name}</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {[
                  { label: 'Student ID / Username', value: generatedCreds.customId },
                  { label: 'Password', value: generatedCreds.password },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl bg-gray-50 dark:bg-gray-700/50 px-4 py-3">
                    <p className="text-xs text-gray-400 mb-1">{label}</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 font-mono">{value}</p>
                      <button onClick={() => handleCopy(value)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                        {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} className="text-gray-400" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button onClick={handleDownload} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors">
                  <Download size={13} /> Download
                </button>
                <button onClick={() => setGeneratedCreds(null)} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {showReset && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowReset(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-700"
            >
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">Reset Password</p>
              <p className="text-xs text-gray-400 mb-4">{student.name} · {student.customId}</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setResetMode('generate')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-colors ${resetMode === 'generate' ? 'bg-amber-500 text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-500'}`}
                >
                  Generate
                </button>
                <button
                  type="button"
                  onClick={() => setResetMode('manual')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-colors ${resetMode === 'manual' ? 'bg-amber-500 text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-500'}`}
                >
                  Manual
                </button>
              </div>
              {resetMode === 'manual' && (
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min 8 chars)"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent focus:border-primary outline-none text-sm mb-4"
                />
              )}
              {generatedPassword && (
                <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 px-4 py-3 mb-4">
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mb-1">Generated Password</p>
                  <p className="text-sm font-black text-gray-900 dark:text-gray-100 font-mono">{generatedPassword}</p>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={handleResetPassword} disabled={isResetting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-40">
                  {isResetting ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                  Reset
                </button>
                <button onClick={() => { setShowReset(false); setGeneratedPassword(''); }} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
