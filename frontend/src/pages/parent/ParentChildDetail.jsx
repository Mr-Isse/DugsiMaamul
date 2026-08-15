import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  useGetChildProfileQuery,
  useGetChildAttendanceQuery,
  useGetChildResultsQuery,
  useGetChildFeesQuery,
  useGetChildTimetableQuery,
} from '../../store/parentApiSlice';
import { Skeleton } from "../../components/ui/skeleton";
import {
  User, CalendarCheck, GraduationCap, CreditCard, Clock,
  ArrowLeft, AlertCircle, CheckCircle, XCircle, MinusCircle,
} from 'lucide-react';

const tabs = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { key: 'results', label: 'Results', icon: GraduationCap },
  { key: 'fees', label: 'Fees', icon: CreditCard },
  { key: 'timetable', label: 'Timetable', icon: Clock },
];

const statusColor = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'present' || s === 'paid' || s === 'active') return 'text-emerald-400 bg-emerald-500/10';
  if (s === 'absent' || s === 'failed' || s === 'overdue') return 'text-red-400 bg-red-500/10';
  if (s === 'late' || s === 'pending') return 'text-amber-400 bg-amber-500/10';
  if (s === 'excused' || s === 'paid' || s === 'passed') return 'text-blue-400 bg-blue-500/10';
  return 'text-slate-400 bg-slate-500/10';
};

const ParentChildDetail = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const activeTab = getTabFromPath();
  const profile = useGetChildProfileQuery(childId);
  const attendance = useGetChildAttendanceQuery(childId);
  const results = useGetChildResultsQuery(childId);
  const fees = useGetChildFeesQuery(childId);
  const timetable = useGetChildTimetableQuery(childId);

  function getTabFromPath() {
    const path = window.location.pathname;
    const match = path.match(/\/parent\/child\/[^/]+\/(\w+)/);
    return match?.[1] || 'profile';
  }

  const child = profile.data?.data;
  const childName = userInfo?.linkedStudents?.find?.((s) => (typeof s === 'object' ? s._id : s) === childId);
  const displayName = child?.name || (typeof childName === 'object' ? childName.name : null) || 'Child';

  const switchTab = (tab) => navigate(`/parent/child/${childId}/${tab}`);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/parent')} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{displayName}</h1>
          <p className="text-slate-400 text-sm">Academic details and information</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-900/50 rounded-xl border border-white/5 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => switchTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                active
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="rounded-2xl bg-slate-900/50 border border-white/5 p-6">
        {activeTab === 'profile' && <ProfileTab data={profile} />}
        {activeTab === 'attendance' && <AttendanceTab data={attendance} />}
        {activeTab === 'results' && <ResultsTab data={results} />}
        {activeTab === 'fees' && <FeesTab data={fees} childId={childId} />}
        {activeTab === 'timetable' && <TimetableTab data={timetable} />}
      </div>
    </div>
  );
};

const TabSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 flex-1" />
      </div>
    ))}
  </div>
);

const TabError = ({ error }) => (
  <div className="flex flex-col items-center py-12 text-center">
    <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
    <p className="text-slate-400 text-sm">Failed to load data. Please try again.</p>
  </div>
);

const ProfileTab = ({ data }) => {
  if (data.isLoading) return <TabSkeleton />;
  if (data.error) return <TabError error={data.error} />;
  const s = data.data?.data;
  if (!s) return <p className="text-slate-500">No profile data available.</p>;

  const fields = [
    ['Name', s.name],
    ['Student ID', s.customId],
    ['Email', s.email],
    ['Phone', s.phone],
    ['Gender', s.gender],
    ['Status', s.status],
    ['Class', s.class?.name ? `${s.class.name}${s.class.section ? ` — ${s.class.section}` : ''}` : 'N/A'],
  ];

  return (
    <div className="space-y-4">
      {fields.map(([label, value]) => (
        <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2 border-b border-white/5 last:border-0">
          <span className="text-slate-500 text-sm w-32 shrink-0">{label}</span>
          <span className="text-white text-sm font-medium">{value || 'N/A'}</span>
        </div>
      ))}
    </div>
  );
};

const AttendanceTab = ({ data }) => {
  if (data.isLoading) return <TabSkeleton />;
  if (data.error) return <TabError error={data.error} />;
  const records = data.data?.data || [];

  if (records.length === 0) {
    return <p className="text-slate-500 text-center py-8">No attendance records found.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 pb-2 border-b border-white/5">
        <span className="col-span-3">Date</span>
        <span className="col-span-3">Status</span>
        <span className="col-span-6">Remarks</span>
      </div>
      {records.map((r) => (
        <div key={r._id} className="grid grid-cols-12 items-center px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm">
          <span className="col-span-3 text-slate-300">{new Date(r.date).toLocaleDateString()}</span>
          <span className="col-span-3">
            <span className={`text-xs font-bold px-2 py-1 rounded-lg capitalize ${statusColor(r.status)}`}>
              {r.status}
            </span>
          </span>
          <span className="col-span-6 text-slate-400">{r.remarks || '—'}</span>
        </div>
      ))}
    </div>
  );
};

const ResultsTab = ({ data }) => {
  if (data.isLoading) return <TabSkeleton />;
  if (data.error) return <TabError error={data.error} />;
  const marks = data.data?.data || [];

  if (marks.length === 0) {
    return <p className="text-slate-500 text-center py-8">No results found.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 pb-2 border-b border-white/5">
        <span className="col-span-3">Exam</span>
        <span className="col-span-3">Subject</span>
        <span className="col-span-2">Score</span>
        <span className="col-span-2">Grade</span>
        <span className="col-span-2">Status</span>
      </div>
      {marks.map((m) => (
        <div key={m._id} className="grid grid-cols-12 items-center px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm">
          <span className="col-span-3 text-slate-300">{m.exam?.name || 'N/A'}</span>
          <span className="col-span-3 text-white font-medium">{m.subject?.name || 'N/A'}</span>
          <span className="col-span-2 text-slate-300">{m.score != null ? `${m.score}%` : '—'}</span>
          <span className="col-span-2 text-slate-300">{m.grade || '—'}</span>
          <span className="col-span-2">
            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${statusColor(m.status || (m.score >= 50 ? 'passed' : 'failed'))}`}>
              {m.status || (m.score >= 50 ? 'Passed' : 'Failed')}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
};

const FeesTab = ({ data, childId }) => {
  if (data.isLoading) return <TabSkeleton />;
  if (data.error) return <TabError error={data.error} />;
  const payments = data.data?.data || [];

  if (payments.length === 0) {
    return <p className="text-slate-500 text-center py-8">No fee records found.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 pb-2 border-b border-white/5">
        <span className="col-span-3">Period</span>
        <span className="col-span-3">Amount</span>
        <span className="col-span-3">Status</span>
        <span className="col-span-3">Due Date</span>
      </div>
      {payments.map((p) => (
        <div key={p._id} className="grid grid-cols-12 items-center px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm">
          <span className="col-span-3 text-slate-300">{p.paymentMonth?.name || `${p.month}/${p.year}`}</span>
          <span className="col-span-3 text-white font-medium">${p.amount?.toFixed(2) || '0.00'}</span>
          <span className="col-span-3">
            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${statusColor(p.status)}`}>
              {p.status}
            </span>
          </span>
          <span className="col-span-3 text-slate-400">{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : '—'}</span>
        </div>
      ))}
    </div>
  );
};

const TimetableTab = ({ data }) => {
  if (data.isLoading) return <TabSkeleton />;
  if (data.error) return <TabError error={data.error} />;
  const schedules = data.data?.data || [];

  if (schedules.length === 0) {
    return <p className="text-slate-500 text-center py-8">No timetable available.</p>;
  }

  const groupedByDay = schedules.reduce((acc, s) => {
    const day = s.day || 'Other';
    if (!acc[day]) acc[day] = [];
    acc[day].push(s);
    return acc;
  }, {});

  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-6">
      {dayOrder.filter((d) => groupedByDay[d]).map((day) => (
        <div key={day}>
          <h4 className="text-white font-bold text-sm mb-3">{day}</h4>
          <div className="space-y-2">
            {groupedByDay[day].map((s) => (
              <div key={s._id} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/5 text-sm">
                <span className="text-emerald-400 font-mono text-xs w-28 shrink-0">
                  {s.startTime} – {s.endTime}
                </span>
                <span className="text-white font-medium flex-1">{s.subject?.name || 'N/A'}</span>
                {s.room && <span className="text-slate-400 text-xs">Room {s.room}</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ParentChildDetail;
