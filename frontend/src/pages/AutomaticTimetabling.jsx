import { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  BookOpen,
  UserSquare2,
  AlertCircle,
  LayoutGrid,
  Layers,
  Timer,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import {
  useGetClassesQuery,
  useGetSubjectsQuery,
  useGetTeachersQuery,
  useGetSchedulesQuery,
} from '../store/adminApiSlice';
import { motion } from 'framer-motion';

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const SUBJECT_COLORS = [
  { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300', hex: '#6366f1' },
  { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', hex: '#10b981' },
  { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', hex: '#f59e0b' },
  { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', hex: '#f43f5e' },
  { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300', hex: '#8b5cf6' },
  { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-300', hex: '#ec4899' },
  { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300', hex: '#06b6d4' },
  { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', hex: '#f97316' },
  { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-300', hex: '#14b8a6' },
  { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', hex: '#3b82f6' },
];

const AutomaticTimetabling = () => {
  const [selectedClassId, setSelectedClassId] = useState('');

  const { data: classes, isLoading: classesLoading } = useGetClassesQuery();
  const { data: subjects } = useGetSubjectsQuery();
  const { data: teachers } = useGetTeachersQuery();
  const { data: schedules, isLoading: schedulesLoading } = useGetSchedulesQuery(selectedClassId, {
    skip: !selectedClassId,
  });

  const isLoading = classesLoading || schedulesLoading;

  const subjectColorMap = useMemo(() => {
    const map = {};
    if (!subjects) return map;
    const subjectList = Array.isArray(subjects) ? subjects : subjects?.data || [];
    subjectList.forEach((sub, idx) => {
      map[sub._id] = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
    });
    return map;
  }, [subjects]);

  const weekSchedule = useMemo(() => {
    if (!schedules) return {};
    const scheduleList = Array.isArray(schedules) ? schedules : schedules?.data || schedules?.schedules || [];
    const grid = {};
    DAYS.forEach((day) => {
      grid[day] = scheduleList
        .filter((s) => s.day === day)
        .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    });
    return grid;
  }, [schedules]);

  const allPeriods = useMemo(() => {
    if (!schedules) return [];
    const scheduleList = Array.isArray(schedules) ? schedules : schedules?.data || schedules?.schedules || [];
    const times = [...new Set(scheduleList.map((s) => `${s.startTime}-${s.endTime}`))];
    return times.sort((a, b) => a.localeCompare(b));
  }, [schedules]);

  const totalPeriods = useMemo(() => {
    const scheduleList = schedules
      ? Array.isArray(schedules)
        ? schedules
        : schedules?.data || schedules?.schedules || []
      : [];
    return scheduleList.length;
  }, [schedules]);

  const classesScheduled = useMemo(() => {
    return Object.values(weekSchedule).filter((daySlots) => daySlots.length > 0).length;
  }, [weekSchedule]);

  const totalSlots = 7 * 8;
  const freeSlots = Math.max(0, totalSlots - totalPeriods);

  const uniqueSubjectIds = useMemo(() => {
    const scheduleList = schedules
      ? Array.isArray(schedules)
        ? schedules
        : schedules?.data || schedules?.schedules || []
      : [];
    return [...new Set(scheduleList.map((s) => s.subject?._id).filter(Boolean))];
  }, [schedules]);

  const legendItems = useMemo(() => {
    return uniqueSubjectIds.map((id) => {
      const scheduleList = schedules
        ? Array.isArray(schedules)
          ? schedules
          : schedules?.data || schedules?.schedules || []
        : [];
      const sample = scheduleList.find((s) => s.subject?._id === id);
      return {
        id,
        name: sample?.subject?.name || 'Unknown',
        color: subjectColorMap[id] || SUBJECT_COLORS[0],
      };
    });
  }, [uniqueSubjectIds, subjectColorMap, schedules]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Calendar className="text-indigo-600" size={32} />
            Automatic Timetabling
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-1">
            Generate and manage weekly timetables for all classes.
          </p>
        </div>
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        >
          <option value="">Select Class</option>
          {Array.isArray(classes)
            ? classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} - {c.section}
                </option>
              ))
            : classes?.data?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} - {c.section}
                </option>
              )) || []}
        </select>
      </div>

      {/* Stats Row */}
      {selectedClassId && !isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Layers, label: 'Total Periods', value: totalPeriods, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
            { icon: Calendar, label: 'Days Scheduled', value: classesScheduled, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { icon: Timer, label: 'Free Slots', value: freeSlots, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${stat.bg}`}>
                    <stat.icon size={24} className={stat.color} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Main Content */}
      {!selectedClassId ? (
        <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="mx-auto w-24 h-24 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-6">
              <Calendar size={48} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Select a Class</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold">
              Choose a class from the dropdown above to view its weekly timetable.
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse w-48" />
          <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
        </div>
      ) : totalPeriods === 0 ? (
        <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="mx-auto w-24 h-24 rounded-3xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-6">
              <AlertCircle size={48} className="text-amber-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Schedule Found</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold">
              No timetable has been created for this class yet. Use Schedule Management to add periods.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Legend */}
          {legendItems.length > 0 && (
            <Card className="rounded-2xl border-none shadow-sm">
              <CardContent className="p-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Subject Legend</p>
                <div className="flex flex-wrap gap-3">
                  {legendItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color.hex }}
                      />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timetable Grid */}
          <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-28">
                      Day
                    </th>
                    {allPeriods.map((period, idx) => (
                      <th
                        key={period}
                        className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <Clock size={12} className="text-slate-300" />
                          <span>Period {idx + 1}</span>
                          <span className="text-slate-300 dark:text-slate-600 normal-case tracking-normal">{period}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day) => {
                    const daySlots = weekSchedule[day] || [];
                    return (
                      <tr key={day} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                        <td className="p-4">
                          <div className="font-black text-sm text-slate-900 dark:text-white">{day}</div>
                          <div className="text-[10px] font-bold text-slate-400">{daySlots.length} classes</div>
                        </td>
                        {allPeriods.map((period) => {
                          const slot = daySlots.find(
                            (s) => `${s.startTime}-${s.endTime}` === period
                          );
                          const color = slot ? subjectColorMap[slot.subject?._id] || SUBJECT_COLORS[0] : null;
                          return (
                            <td key={period} className="p-2">
                              {slot ? (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className={`${color?.bg || 'bg-slate-100'} rounded-xl p-3 text-center border-l-4`}
                                  style={{ borderLeftColor: color?.hex || '#94a3b8' }}
                                >
                                  <div className="flex items-center justify-center gap-1 mb-1">
                                    <BookOpen size={12} className={color?.text || 'text-slate-500'} />
                                    <p className={`text-xs font-black ${color?.text || 'text-slate-600'} line-clamp-1`}>
                                      {slot.subject?.name}
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-center gap-1">
                                    <UserSquare2 size={10} className="text-slate-400" />
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 line-clamp-1">
                                      {slot.teacher?.name || 'Unassigned'}
                                    </p>
                                  </div>
                                </motion.div>
                              ) : (
                                <div className="rounded-xl p-3 text-center bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700">
                                  <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600">Free</p>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AutomaticTimetabling;
