import { useState, useMemo } from 'react';
import {
  Home, Plus, Search, X, RefreshCw,
  CheckCircle, XCircle, Clock, AlertCircle, CalendarDays,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetHostelAttendanceQuery,
  useMarkHostelAttendanceMutation,
  useGetHostelsQuery,
  useGetHostelRoomsQuery,
} from '../store/adminApiSlice';

const ATTENDANCE_STATUSES = [
  { value: 'Present', label: 'Present', icon: CheckCircle, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  { value: 'Absent', label: 'Absent', icon: XCircle, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  { value: 'Late', label: 'Late', icon: Clock, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
];

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-black text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const HostelAttendancePage = () => {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [selectedHostel, setSelectedHostel] = useState('');
  const [attendanceMap, setAttendanceMap] = useState({});

  const { data: hostelsData } = useGetHostelsQuery();
  const hostels = hostelsData?.data || hostelsData || [];

  const queryArgs = useMemo(() => {
    const q = {};
    if (date) q.date = date;
    if (selectedHostel) q.hostelId = selectedHostel;
    return q;
  }, [date, selectedHostel]);

  const { data, isLoading, refetch } = useGetHostelAttendanceQuery(queryArgs);
  const [markHostelAttendance, { isLoading: marking }] = useMarkHostelAttendanceMutation();

  const records = data?.data || data?.attendance || [];

  const presentCount = records.filter(r => r.status === 'Present').length;
  const absentCount = records.filter(r => r.status === 'Absent').length;
  const lateCount = records.filter(r => r.status === 'Late').length;

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmitAttendance = async () => {
    if (!selectedHostel) return toast.error('Please select a hostel');
    const entries = Object.entries(attendanceMap).filter(([_, status]) => status);
    if (entries.length === 0) return toast.error('Mark at least one student');
    try {
      await markHostelAttendance({
        date,
        hostelId: selectedHostel,
        records: entries.map(([studentId, status]) => ({ studentId, status })),
      }).unwrap();
      toast.success('Attendance submitted successfully');
      setAttendanceMap({});
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to submit attendance');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Home className="text-purple-600" size={28} />
            Hostel Attendance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Mark and manage daily hostel attendance for students.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={refetch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <RefreshCw size={16} />
          </button>
          <button onClick={handleSubmitAttendance} disabled={marking}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors text-sm disabled:opacity-50">
            <CheckCircle size={16} /> {marking ? 'Submitting\u2026' : 'Submit Attendance'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Records" value={records.length} icon={Home} color="bg-purple-500" />
        <StatCard label="Present" value={presentCount} icon={CheckCircle} color="bg-green-500" />
        <StatCard label="Absent" value={absentCount} icon={XCircle} color="bg-red-500" />
        <StatCard label="Late" value={lateCount} icon={Clock} color="bg-yellow-500" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500" />
          </div>
          <select value={selectedHostel} onChange={e => setSelectedHostel(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
            <option value="">Select Hostel</option>
            {hostels.map(h => (
              <option key={h._id} value={h._id}>{h.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : records.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-4">
              <Home size={28} className="text-purple-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No attendance records</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {selectedHostel ? 'No students found for this hostel.' : 'Select a hostel and date to view records.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Room</th>
                  <th className="px-5 py-3.5">Existing Status</th>
                  <th className="px-5 py-3.5">Mark Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {records.map(rec => (
                  <tr key={rec._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      {rec.student?.name || rec.student?.firstName || 'Unknown'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                      {rec.room || rec.roomNumber || '\u2014'}
                    </td>
                    <td className="px-5 py-3.5">
                      {rec.status && (
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                          ATTENDANCE_STATUSES.find(s => s.value === rec.status)?.color || ''
                        }`}>
                          {rec.status}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        {ATTENDANCE_STATUSES.map(s => (
                          <button key={s.value}
                            onClick={() => handleStatusChange(rec.student?._id || rec.studentId, s.value)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              attendanceMap[rec.student?._id || rec.studentId] === s.value
                                ? s.color
                                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}>
                            <s.icon size={18} />
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostelAttendancePage;
