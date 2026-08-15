import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User, GraduationCap, Mail, Phone, Calendar, 
  BookOpen, CreditCard, Award, Clock, Printer, MapPin, 
  Briefcase, Hash, BadgePercent
} from 'lucide-react';

const StudentProfileModal = ({ isOpen, onClose, studentData, isLoading }) => {
  if (!isOpen) return null;

  // Handle both student and teacher data
  const isStudent = studentData?.type === 'student';
  const userData = isStudent ? studentData?.student : studentData?.teacher;
  const attendance = studentData?.attendance || [];
  const payments = studentData?.payments || [];
  const marks = studentData?.marks || [];
  const academicHistory = studentData?.academicHistory;
  const schedule = studentData?.schedule || [];
  const activeDiscounts = studentData?.activeDiscounts || [];
  const discountHistory = studentData?.discountHistory || [];

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#1e293b] rounded-[2.5rem] w-full max-w-2xl shadow-2xl my-4 relative overflow-hidden border border-slate-800"
        >
          {/* Header Action Buttons */}
          <div className="absolute top-5 right-5 flex items-center gap-2 z-10">
            <button
              onClick={() => window.print()}
              className="p-2 bg-slate-800/80 backdrop-blur text-slate-400 rounded-xl hover:bg-slate-700 transition-all active:scale-95 border border-slate-700"
              title="Print Profile"
            >
              <Printer size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-slate-800/80 backdrop-blur text-slate-400 rounded-xl hover:bg-slate-700 transition-all active:scale-95 border border-slate-700"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* User Profile Header */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-6 pb-6 border-b border-slate-800">
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-[1.5rem] bg-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-inner border-4 border-slate-900 overflow-hidden">
                  {(() => {
                    const imgSrc = 
                      userData.logo || 
                      userData.image || 
                      (typeof userData.profileImage === 'object' ? userData.profileImage?.url : userData.profileImage);
                    return imgSrc ? (
                      <img 
                        src={imgSrc} 
                        alt={userData.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={48} className="opacity-40" />
                    );
                  })()}
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-[#1e293b] rounded-lg shadow-lg flex items-center justify-center border-2 border-slate-800">
                  {isStudent ? (
                    <GraduationCap size={14} className="text-indigo-400" />
                  ) : (
                    <Briefcase size={14} className="text-indigo-400" />
                  )}
                </div>
              </div>

              <div className="flex-1 text-center md:text-left min-w-0 w-full">
                <h2 className="text-2xl font-black font-heading text-white tracking-tight mb-0.5 truncate">
                  {userData.name}
                </h2>
                <p className="text-indigo-400 font-bold text-xs uppercase tracking-widest mb-4 flex items-center justify-center md:justify-start gap-1">
                  <Hash size={12} className="text-indigo-500/50" />
                  {userData.customId}
                </p>

                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-4">
                  {isStudent ? (
                    <div className="flex items-center gap-2 group">
                      <div className="p-1.5 rounded-lg bg-slate-900/50 text-slate-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors border border-slate-800">
                        <GraduationCap size={14} />
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider leading-none mb-0.5">Class</p>
                        <p className="text-xs font-bold text-slate-300 truncate">
                          {userData.class?.name} - {userData.class?.section}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <div className="p-1.5 rounded-lg bg-slate-900/50 text-slate-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors border border-slate-800">
                        <BookOpen size={14} />
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider leading-none mb-0.5">Subjects</p>
                        <p className="text-xs font-bold text-slate-300 truncate">
                          {userData.subjects?.map(s => s.name).join(', ') || 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 group">
                    <div className="p-1.5 rounded-lg bg-slate-900/50 text-slate-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors border border-slate-800">
                      <Mail size={14} />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider leading-none mb-0.5">Email</p>
                      <p className="text-xs font-bold text-slate-300 truncate">
                        {userData.email || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 group">
                    <div className="p-1.5 rounded-lg bg-slate-900/50 text-slate-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors border border-slate-800">
                      <Phone size={14} />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider leading-none mb-0.5">Contact</p>
                      <p className="text-xs font-bold text-slate-300 truncate">{userData.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Tabs/Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left Column: Activity/Schedule */}
              <div className="space-y-4">
                <div className="bg-slate-900/30 rounded-2xl p-4 border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                        <Clock size={14} />
                      </div>
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">{isStudent ? 'Attendance' : 'Schedule'}</h3>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                    {isStudent ? (
                      attendance.length > 0 ? (
                        attendance.map((record, index) => (
                          <div key={index} className="flex items-center justify-between p-2.5 bg-[#0f172a] rounded-xl border border-slate-800 gap-2">
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-white truncate">{record.subject?.name}</p>
                              <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider">{new Date(record.date).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter shrink-0 ${
                              record.status === 'Present' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              {record.status}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-center text-slate-600 py-3 italic font-medium">No records.</p>
                      )
                    ) : (
                      schedule.length > 0 ? (
                        schedule.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2.5 bg-[#0f172a] rounded-xl border border-slate-800 gap-2">
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-white truncate">{item.subject?.name}</p>
                              <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider truncate">{item.day} • {item.startTime}</p>
                            </div>
                            <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md text-[8px] font-black uppercase tracking-tighter shrink-0">
                              {item.class?.name}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-center text-slate-600 py-3 italic font-medium">No schedule.</p>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Performance/Payments */}
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-3 sm:p-4 border border-gray-100 dark:border-gray-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 sm:p-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                        {isStudent ? <CreditCard size={12} className="sm:size-[14px]" /> : <Award size={12} className="sm:size-[14px]" />}
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100">{isStudent ? 'Payments' : 'Stats'}</h3>
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2 max-h-32 sm:max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                    {isStudent ? (
                      payments.length > 0 ? (
                        payments.map((payment, index) => (
                          <div key={index} className="flex items-center justify-between p-2 sm:p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-50 dark:border-gray-700/30 gap-2">
                            <div className="min-w-0">
                              <p className="text-[8px] sm:text-[9px] font-bold text-gray-500 uppercase tracking-tight leading-none">{payment.month}</p>
                              <p className="text-[7px] sm:text-[8px] text-gray-400 mt-0.5">{payment.date ? new Date(payment.date).toLocaleDateString() : 'Pending'}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-[10px] sm:text-xs font-black text-gray-900 dark:text-gray-100">${payment.amount}</p>
                              <span className={`text-[7px] sm:text-[8px] font-bold uppercase ${payment.status === 'Paid' ? 'text-green-500' : 'text-amber-500'}`}>
                                {payment.status}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[9px] sm:text-[10px] text-center text-gray-500 py-3 italic">No payments.</p>
                      )
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 sm:p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-center border border-gray-50 dark:border-gray-700/30 flex flex-col items-center justify-center">
                          <p className="text-[7px] sm:text-[8px] font-bold text-gray-400 uppercase mb-0.5">Classes</p>
                          <p className="text-sm sm:text-lg font-black text-primary leading-tight">{userData.classes?.length || 0}</p>
                        </div>
                        <div className="p-2 sm:p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-center border border-gray-50 dark:border-gray-700/30 flex flex-col items-center justify-center">
                          <p className="text-[7px] sm:text-[8px] font-bold text-gray-400 uppercase mb-0.5">Exp.</p>
                          <p className="text-sm sm:text-lg font-black text-primary leading-tight">{userData.teacherAge ? `${userData.teacherAge - 20}y` : 'N/A'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Active Discounts (Student Only) */}
            {isStudent && (
              <div className="mt-3 sm:mt-4 bg-white dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-3 sm:p-4 overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg">
                    <BadgePercent size={14} className="sm:size-[16px]" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">Active Discounts</h3>
                </div>

                {activeDiscounts.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                    {activeDiscounts.map((discount, i) => (
                      <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-bold text-slate-800 dark:text-white">{discount.discount?.name || discount.discountSnapshot?.name}</p>
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                            {discount.discount?.valueType === 'percentage' ? `${discount.discount.value}%` : `$${discount.discount.value}`}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-1">
                          Valid: {new Date(discount.startDate).toLocaleDateString()} - {discount.endDate ? new Date(discount.endDate).toLocaleDateString() : 'Permanent'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 py-4 italic">No active discounts for this student.</p>
                )}
              </div>
            )}

            {/* Discount History (Student Only) */}
            {isStudent && (
              <div className="mt-3 sm:mt-4 bg-white dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-3 sm:p-4 overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg">
                    <CreditCard size={14} className="sm:size-[16px]" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">Discount History</h3>
                </div>

                {discountHistory.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                    {discountHistory.map((history, i) => (
                      <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-bold text-slate-800 dark:text-white">{history.discount?.name || history.discountSnapshot?.name}</p>
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                            history.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                          }`}>
                            {history.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-1">
                          {history.scope === 'class' ? `Applied to class: ${history.class?.name || 'N/A'}` :
                           history.scope === 'grade' ? `Applied to grade: ${history.grade}` :
                           `Applied to ${history.students?.length || 0} student(s)`}
                        </p>
                        <p className="text-[8px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {new Date(history.createdAt).toLocaleDateString()} • Assigned by: {history.assignedBy?.name || 'Admin'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 py-4 italic">No discount history for this student.</p>
                )}
              </div>
            )}

            {/* Academic Performance (Student Only) */}
            {isStudent && (
              <div className="mt-3 sm:mt-4 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 rounded-2xl sm:rounded-[1.5rem] p-3 sm:p-4 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1 sm:p-1.5 bg-white/10 rounded-lg">
                        <Award size={14} className="sm:size-[16px]" />
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold">Academic Performance</h3>
                    </div>
                    {academicHistory?.ranks && (
                      <div className="flex flex-wrap gap-1.5">
                        {['m1', 'mid', 'm2', 'final'].map(stage => (
                          academicHistory.ranks[stage] && (
                            <div key={stage} className="px-1.5 py-0.5 bg-white/5 rounded-md border border-white/10 flex flex-col items-center min-w-[35px]">
                              <p className="text-[6px] sm:text-[7px] font-black text-gray-500 uppercase leading-none">{stage}</p>
                              <p className="text-[9px] sm:text-[10px] font-black text-primary">#{academicHistory.ranks[stage]}</p>
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </div>

                  {academicHistory?.subjects?.length > 0 ? (
                    <div className="overflow-x-auto scrollbar-hide -mx-3 sm:mx-0 px-3 sm:px-0">
                      <table className="w-full text-left border-separate border-spacing-y-1.5 min-w-[400px]">
                        <thead>
                          <tr className="text-[7px] sm:text-[9px] font-black text-gray-500 uppercase tracking-widest">
                            <th className="px-2 sm:px-3 py-1 sticky left-0 bg-inherit z-10">Subject</th>
                            <th className="px-1 sm:px-3 py-1 text-center">M1</th>
                            <th className="px-1 sm:px-3 py-1 text-center">Mid</th>
                            <th className="px-1 sm:px-3 py-1 text-center">M2</th>
                            <th className="px-1 sm:px-3 py-1 text-center">Final</th>
                            <th className="px-2 sm:px-3 py-1 text-center">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {academicHistory.subjects.map((sub, i) => (
                            <tr key={i} className="bg-white/5 hover:bg-white/10 transition-colors rounded-lg overflow-hidden">
                              <td className="px-2 sm:px-3 py-2 rounded-l-lg border-l border-white/5 sticky left-0 bg-[#1a1a1a] sm:bg-transparent z-10">
                                <p className="text-[9px] sm:text-[10px] font-bold text-white truncate max-w-[70px] sm:max-w-[100px]">{sub.subjectName}</p>
                                <p className="text-[7px] sm:text-[8px] text-gray-500 font-mono leading-none mt-0.5">{sub.subjectCode}</p>
                              </td>
                              <td className="px-1 sm:px-3 py-2 text-center font-bold text-[9px] sm:text-[10px] text-white/80">{sub.m1 || '—'}</td>
                              <td className="px-1 sm:px-3 py-2 text-center font-bold text-[9px] sm:text-[10px] text-white/80">{sub.mid || '—'}</td>
                              <td className="px-1 sm:px-3 py-2 text-center font-bold text-[9px] sm:text-[10px] text-white/80">{sub.m2 || '—'}</td>
                              <td className="px-1 sm:px-3 py-2 text-center font-bold text-[9px] sm:text-[10px] text-white/80">{sub.final || '—'}</td>
                              <td className="px-2 sm:px-3 py-2 text-center rounded-r-lg border-r border-white/5 bg-white/5 sm:bg-transparent">
                                <span className={`px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-black ${
                                  sub.total >= 90 ? 'bg-green-500/20 text-green-400' :
                                  sub.total >= 75 ? 'bg-blue-500/20 text-blue-400' :
                                  sub.total >= 50 ? 'bg-amber-500/20 text-amber-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  {sub.total}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-primary/10 rounded-lg">
                            <td className="px-2 sm:px-3 py-2 rounded-l-lg sticky left-0 bg-[#1a1a1a] sm:bg-transparent z-10">
                              <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-primary">Total</span>
                            </td>
                            <td className="px-1 sm:px-3 py-2 text-center font-black text-[9px] sm:text-[10px] text-primary">{academicHistory.totals?.m1 || 0}</td>
                            <td className="px-1 sm:px-3 py-2 text-center font-black text-[9px] sm:text-[10px] text-primary">{academicHistory.totals?.mid || 0}</td>
                            <td className="px-1 sm:px-3 py-2 text-center font-black text-[9px] sm:text-[10px] text-primary">{academicHistory.totals?.m2 || 0}</td>
                            <td className="px-1 sm:px-3 py-2 text-center font-black text-[9px] sm:text-[10px] text-primary">{academicHistory.totals?.final || 0}</td>
                            <td className="px-2 sm:px-3 py-2 text-center rounded-r-lg bg-primary/5 sm:bg-transparent">
                              <span className="text-[9px] sm:text-[10px] font-black text-primary">{academicHistory.totals?.final || 0}</span>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 sm:py-10 text-center border-2 border-dashed border-white/5 rounded-2xl sm:rounded-3xl">
                      <BookOpen size={24} className="sm:size-32 mx-auto mb-2 sm:mb-3 opacity-20" />
                      <p className="text-[10px] sm:text-xs text-white/40 italic">No academic records found for this student.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StudentProfileModal;