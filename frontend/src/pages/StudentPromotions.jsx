import React, { useState, useEffect } from 'react';
import { 
  useGetClassesQuery, 
  usePromoteStudentsMutation,
  useGetPromotionPreviewQuery,
  useHoldStudentsBackMutation,
  useGraduateStudentsMutation,
  useGetAcademicYearsQuery
} from '../store/adminApiSlice';
import { 
  GraduationCap, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  Users, 
  Eye,
  CheckSquare,
  Square,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';

const StudentPromotions = () => {
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [viewMode, setViewMode] = useState('preview'); // preview, success
  const [studentActions, setStudentActions] = useState({}); // studentId: 'promote'|'hold'|'graduate'

  const { data: academicYearsData } = useGetAcademicYearsQuery();
  const { data: classesData, isLoading: classesLoading } = useGetClassesQuery();
  const { data: previewData, isLoading: previewLoading, refetch: getPromotionPreview } = useGetPromotionPreviewQuery(
    selectedYear ? { toAcademicYearId: selectedYear } : undefined,
    { skip: !selectedYear }
  );
  const [promoteStudents, { isLoading: isPromoting }] = usePromoteStudentsMutation();
  const [holdStudentsBack, { isLoading: isHolding }] = useHoldStudentsBackMutation();
  const [graduateStudents, { isLoading: isGraduating }] = useGraduateStudentsMutation();

  const academicYears = academicYearsData?.data || [];
  const classes = classesData?.data || [];

  // Initialize student actions when preview data loads
  useEffect(() => {
    if (previewData?.data?.promotionPreview) {
      const initialActions = {};
      previewData.data.promotionPreview.forEach(item => {
        if (item.isGraduating) {
          initialActions[item.student._id] = 'graduate';
        } else {
          initialActions[item.student._id] = 'promote';
        }
      });
      setStudentActions(initialActions);
    }
  }, [previewData]);

  const toggleStudentSelection = (studentId) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const selectAll = () => {
    if (previewData?.data?.promotionPreview) {
      const allIds = previewData.data.promotionPreview.map(item => item.student._id);
      setSelectedStudents(new Set(allIds));
    }
  };

  const deselectAll = () => {
    setSelectedStudents(new Set());
  };

  const handleStudentAction = (studentId, action) => {
    setStudentActions(prev => ({
      ...prev,
      [studentId]: action
    }));
  };

  const executeActions = async () => {
    if (selectedStudents.size === 0) {
      return toast.error('Please select at least one student');
    }

    try {
      const preview = previewData?.data?.promotionPreview || [];
      const studentsByAction = {
        promote: [],
        hold: [],
        graduate: []
      };

      // Group students by action
      preview.forEach(item => {
        if (selectedStudents.has(item.student._id)) {
          const action = studentActions[item.student._id] || 'promote';
          studentsByAction[action].push({
            studentId: item.student._id,
            fromClassId: item.fromClass?._id,
            toClassId: item.toClass?._id,
            fromYearId: previewData.data.fromAcademicYear?._id,
            toYearId: previewData.data.toAcademicYear?._id
          });
        }
      });

      // Execute promotions
      if (studentsByAction.promote.length > 0) {
        for (const student of studentsByAction.promote) {
          if (student.toClassId) {
            await promoteStudents({
              studentIds: [student.studentId],
              fromClassId: student.fromClassId,
              toClassId: student.toClassId,
              fromAcademicYear: student.fromYearId,
              toAcademicYear: student.toYearId
            }).unwrap();
          }
        }
      }

      // Execute holds
      if (studentsByAction.hold.length > 0) {
        await holdStudentsBack({
          studentIds: studentsByAction.hold.map(s => s.studentId),
          academicYearId: studentsByAction.hold[0]?.fromYearId
        }).unwrap();
      }

      // Execute graduations
      if (studentsByAction.graduate.length > 0) {
        await graduateStudents({
          studentIds: studentsByAction.graduate.map(s => s.studentId)
        }).unwrap();
      }

      setViewMode('success');
      toast.success('Student promotions completed successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'Action failed');
    }
  };

  if (viewMode === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Promotions Complete!</h2>
        <p className="text-gray-500 max-w-md mb-8">
          Student promotions have been executed successfully. Academic history is updated.
        </p>
        <button 
          onClick={() => { 
            setViewMode('preview'); 
            setSelectedStudents(new Set());
          }}
          className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all"
        >
          Promote More Students
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4">
          <GraduationCap size={32} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Promotion Engine</h1>
        <p className="text-gray-500 mt-2">Preview and execute student promotions, holds, and graduations for the new academic session.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-8">
        {/* Year Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider block">Target Academic Year</label>
            <select 
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold transition-all appearance-none"
            >
              <option value="">Select Academic Year</option>
              {academicYears.map(year => (
                <option key={year._id} value={year._id}>{year.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={selectAll}
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              Select All
            </button>
            <button 
              onClick={deselectAll}
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              Deselect All
            </button>
          </div>
        </div>

        {/* Preview Table */}
        {selectedYear ? (
          previewLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <TableSkeleton rows={10} columns={5} />
              <p className="text-gray-500">Generating promotion preview...</p>
            </div>
          ) : previewData?.data?.promotionPreview ? (
            <>
              <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <span className="flex items-center gap-2">
                          <Users size={14} />
                          Student
                        </span>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                        From Class
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                        To Class
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                    {previewData.data.promotionPreview.map(item => (
                      <tr key={item.student._id} className={selectedStudents.has(item.student._id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}>
                        <td className="px-6 py-4">
                          <label className="flex items-center gap-4 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={selectedStudents.has(item.student._id)}
                              onChange={() => toggleStudentSelection(item.student._id)}
                              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white">{item.student.name}</div>
                              {item.student.customId && (
                                <div className="text-xs text-gray-500">{item.student.customId}</div>
                              )}
                            </div>
                          </label>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-200">
                            {item.fromClass?.name} {item.fromClass?.section}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {item.toClass ? (
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full text-sm font-semibold text-green-700 dark:text-green-300">
                              {item.toClass?.name} {item.toClass?.section}
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 rounded-full text-sm font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
                              <AlertCircle size={14} />
                              Graduating
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            value={studentActions[item.student._id] || (item.isGraduating ? 'graduate' : 'promote')}
                            onChange={e => handleStudentAction(item.student._id, e.target.value)}
                            className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none font-semibold"
                          >
                            {!item.isGraduating && (
                              <option value="promote">Promote</option>
                            )}
                            <option value="hold">Hold Back</option>
                            {item.isGraduating && (
                              <option value="graduate">Graduate</option>
                            )}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Execute Button */}
              <button 
                onClick={executeActions}
                disabled={isPromoting || isHolding || isGraduating || selectedStudents.size === 0}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isPromoting || isHolding || isGraduating ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <GraduationCap size={22} />
                    Execute Selected Actions ({selectedStudents.size} students)
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500">No preview data available</p>
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Eye size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-semibold">Select an academic year to preview promotions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPromotions;
