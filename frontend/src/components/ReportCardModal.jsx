import React from 'react';
import { X, Printer, GraduationCap, Award, BookOpen, User, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ReportCardModal = ({ isOpen, onClose, result, examName }) => {
  if (!isOpen || !result) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-[#1e293b] rounded-[2.5rem] w-full max-w-4xl shadow-2xl relative overflow-hidden my-8 border border-slate-800"
        >
          {/* Action Buttons */}
          <div className="absolute top-6 right-6 flex gap-3 z-10 print:hidden">
            <button 
              onClick={handlePrint}
              className="p-3 bg-slate-800 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all duration-300 group border border-slate-700"
            >
              <Printer size={20} className="group-hover:scale-110 transition-transform" />
            </button>
            <button 
              onClick={onClose}
              className="p-3 bg-slate-800 text-slate-400 hover:bg-rose-500 hover:text-white rounded-2xl transition-all duration-300 group border border-slate-700"
            >
              <X size={20} className="group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          <div className="p-12 print:p-0 bg-[#1e293b] print:bg-white" id="report-card">
            {/* School Header */}
            <div className="text-center mb-12 border-b-4 border-indigo-500 pb-8 relative">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                  <GraduationCap size={48} />
                </div>
              </div>
              <h1 className="text-4xl font-black font-heading text-white print:text-slate-900 uppercase tracking-tighter">DugsiKabe School ERP</h1>
              <p className="text-slate-500 print:text-slate-500 font-black uppercase tracking-[0.3em] text-sm mt-2">Academic Report Card</p>
              <div className="absolute -bottom-1 left-0 right-0 flex justify-center">
                <div className="bg-[#1e293b] print:bg-white px-6 py-1 border-2 border-indigo-500 rounded-full text-xs font-black uppercase tracking-widest text-indigo-400 print:text-indigo-600">
                  {examName}
                </div>
              </div>
            </div>

            {/* Student Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Student Name</p>
                <p className="text-lg font-bold text-white print:text-slate-900">{result.student.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Student ID</p>
                <p className="text-lg font-bold text-indigo-400 print:text-indigo-600">{result.student.customId}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Class</p>
                <p className="text-lg font-bold text-white print:text-slate-900">Grade 1A</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Academic Year</p>
                <p className="text-lg font-bold text-white print:text-slate-900">2026</p>
              </div>
            </div>

            {/* Marks Table */}
            <div className="mb-12 overflow-hidden rounded-[2.5rem] border-2 border-slate-800 print:border-slate-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#0f172a] print:bg-slate-900 text-white">
                    <th className="px-8 py-5 text-left text-xs font-black uppercase tracking-widest">Subject</th>
                    <th className="px-8 py-5 text-center text-xs font-black uppercase tracking-widest">Max Marks</th>
                    <th className="px-8 py-5 text-center text-xs font-black uppercase tracking-widest">Obtained</th>
                    <th className="px-8 py-5 text-center text-xs font-black uppercase tracking-widest">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                  {result.subjects.map((sub, i) => (
                    <tr key={i} className="hover:bg-slate-800/50 print:hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 print:text-indigo-600">
                            <BookOpen size={16} />
                          </div>
                          <span className="font-bold text-white print:text-slate-900">{sub.subjectName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center font-bold text-slate-500">{sub.maxMarks}</td>
                      <td className="px-8 py-5 text-center">
                        <span className="text-xl font-black text-white print:text-slate-900">{sub.marks}</span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="w-10 h-10 rounded-xl bg-slate-800 print:bg-slate-100 flex items-center justify-center font-black text-white print:text-slate-900 mx-auto border border-slate-700 print:border-slate-200">
                          {sub.marks >= 90 ? 'A' : sub.marks >= 80 ? 'B' : sub.marks >= 70 ? 'C' : sub.marks >= 60 ? 'D' : sub.marks >= 50 ? 'E' : 'F'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-indigo-500/5 print:bg-indigo-50">
                    <td className="px-8 py-6 font-black uppercase tracking-widest text-indigo-400 print:text-indigo-600">Total Performance</td>
                    <td className="px-8 py-6 text-center font-black text-slate-600 print:text-slate-400">{result.subjects.reduce((acc, s) => acc + s.maxMarks, 0)}</td>
                    <td className="px-8 py-6 text-center text-2xl font-black text-indigo-400 print:text-indigo-600">{result.totalMarks}</td>
                    <td className="px-8 py-6 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl mx-auto shadow-lg shadow-indigo-500/20">
                        {result.grade}
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-slate-900/50 print:bg-slate-50 p-6 rounded-[2rem] border border-slate-800 print:border-slate-200 text-center">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Percentage</p>
                <p className="text-3xl font-black text-white print:text-slate-900">{result.average.toFixed(1)}%</p>
              </div>
              <div className="bg-indigo-600 p-6 rounded-[2rem] text-center shadow-xl shadow-indigo-500/20 border-4 border-slate-900 print:border-white">
                <p className="text-[10px] font-black uppercase text-white/60 tracking-widest mb-2">Class Position</p>
                <div className="flex items-center justify-center gap-2">
                  <Award className="text-white" size={24} />
                  <p className="text-3xl font-black text-white">{result.position}</p>
                  <span className="text-white/60 font-bold uppercase text-xs mt-2">
                    {result.position === 1 ? 'st' : result.position === 2 ? 'nd' : result.position === 3 ? 'rd' : 'th'}
                  </span>
                </div>
              </div>
              <div className="bg-slate-900/50 print:bg-slate-50 p-6 rounded-[2rem] border border-slate-800 print:border-slate-200 text-center">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Result Status</p>
                <p className={`text-3xl font-black ${result.grade === 'F' ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {result.grade === 'F' ? 'FAILED' : 'PASSED'}
                </p>
              </div>
            </div>

            {/* Footer Signatures */}
            <div className="grid grid-cols-2 gap-20 mt-20">
              <div className="border-t-2 border-slate-800 print:border-slate-200 pt-4 text-center">
                <p className="font-bold text-white print:text-slate-900">Class Teacher</p>
                <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Signature & Date</p>
              </div>
              <div className="border-t-2 border-slate-800 print:border-slate-200 pt-4 text-center">
                <p className="font-bold text-white print:text-slate-900">School Principal</p>
                <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Official Seal</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReportCardModal;