import { useState } from 'react';
import { 
  GraduationCap, 
  Lock, 
  AlertCircle, 
  CreditCard, 
  BookOpen, 
  FileText,
  ChevronRight,
  Info
} from 'lucide-react';
import { useGetStudentResultsQuery } from '../store/adminApiSlice';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const StudentResults = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { data: resultsData, isLoading, error } = useGetStudentResultsQuery();

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <div className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />)}</div><div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" /></div>
    </div>
  );

  const blockData = resultsData?.isBlocked ? resultsData : (error?.data?.isBlocked ? error.data : null);

  if (blockData) {
    return (
      <div className="max-w-4xl mx-auto mt-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl border border-red-100 dark:border-red-900/30 overflow-hidden"
        >
          <div className="p-12 text-center">
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500 shadow-inner">
                <Lock size={48} />
              </div>
            </div>
            
            <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 mb-4 tracking-tight">Results Locked</h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
              {blockData.message || "You must clear all outstanding fees to view exam results"}
            </p>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-3xl p-8 mb-10 text-left border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6 text-amber-500">
                <AlertCircle size={24} />
                <h3 className="text-lg font-bold uppercase tracking-widest">Outstanding Dues</h3>
              </div>
              
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-300 font-medium text-lg">Total Due Amount</span>
                <span className="text-3xl font-black text-red-500">${blockData.totalDue?.toFixed(2)}</span>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Unpaid Months</p>
                <div className="flex flex-wrap gap-3">
                  {blockData.unpaidMonths?.map((month, idx) => (
                    <span key={idx} className="px-4 py-2 bg-white dark:bg-gray-800 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 shadow-sm">
                      {month}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/payments')}
              className="w-full py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-3 group"
            >
              <CreditCard size={24} className="group-hover:scale-110 transition-transform" />
              Pay Fees Now
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const results = resultsData?.allResults || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Exam Results</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">View your academic performance and grades.</p>
        </div>
        {resultsData?.position && (
          <div className="bg-indigo-50 dark:bg-indigo-900/30 px-6 py-4 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-indigo-500/20 text-indigo-500 rounded-xl">
              <GraduationCap size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Class Rank</p>
              <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">#{resultsData.position}</p>
            </div>
          </div>
        )}
      </div>

      {results.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-gray-400 mx-auto mb-6">
            <FileText size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">No Results Yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            {resultsData?.message || 'Your examination results will appear here once the school admin creates an exam and enters marks.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {results.map((res, idx) => (
            <motion.div
              key={res._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                    <BookOpen size={24} />
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl">
                    <span className="text-2xl font-black text-primary">{res.total?.toFixed(1)}</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{res.subject?.name}</h3>
                <p className="text-sm text-gray-500 font-medium mb-6">{res.subject?.code}</p>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl mb-6">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Midterm</p>
                    <p className="font-bold text-gray-900 dark:text-gray-100">{res.midterm || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Final</p>
                    <p className="font-bold text-gray-900 dark:text-gray-100">{res.final || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">M 1</p>
                    <p className="font-bold text-gray-900 dark:text-gray-100">{res.monthly1 || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">M 2</p>
                    <p className="font-bold text-gray-900 dark:text-gray-100">{res.monthly2 || 0}</p>
                  </div>
                </div>

                {res.remarks && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 italic">
                    <Info size={14} />
                    <span>{res.remarks}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentResults;