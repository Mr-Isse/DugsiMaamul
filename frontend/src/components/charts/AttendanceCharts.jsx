import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];

export const AttendanceTrend = ({ attendance = [] }) => {
  const data = useMemo(() => {
    const map = new Map();
    attendance.forEach((a) => {
      const d = new Date(a.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const cur = map.get(key) || { date: key, present: 0, absent: 0 };
      if (a.status === 'Present' || a.status === 'Late') cur.present += 1;
      else cur.absent += 1;
      map.set(key, cur);
    });
    return Array.from(map.values());
  }, [attendance]);

  if (!data.length) return <div className="p-6 text-sm text-slate-500">No attendance trend data.</div>;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="present" name="Present" stroke={COLORS[1]} strokeWidth={2} />
        <Line type="monotone" dataKey="absent" name="Absent" stroke={COLORS[3]} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const PresentAbsentPie = ({ attendance = [] }) => {
  const data = useMemo(() => {
    let present = 0; let absent = 0;
    attendance.forEach((a) => {
      if (a.status === 'Present' || a.status === 'Late') present += 1;
      else absent += 1;
    });
    return [{ name: 'Present', value: present }, { name: 'Absent', value: absent }];
  }, [attendance]);

  if (!attendance?.length) return <div className="p-6 text-sm text-slate-500">No attendance data.</div>;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label />
        {data.map((entry, idx) => (
          <Cell key={`c-${idx}`} fill={COLORS[idx % COLORS.length]} />
        ))}
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const TopAbsentStudents = ({ attendance = [] }) => {
  const data = useMemo(() => {
    const map = new Map();
    attendance.forEach((a) => {
      if (a.status === 'Absent') {
        const name = a.user?.name || 'Unknown';
        map.set(name, (map.get(name) || 0) + 1);
      }
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [attendance]);

  if (!data.length) return <div className="p-6 text-sm text-slate-500">No absent records.</div>;

  // Horizontal bar via BarChart vertical layout
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 12, left: 40, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={140} />
        <Tooltip />
        <Bar dataKey="value" fill={COLORS[3]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default { AttendanceTrend, PresentAbsentPie, TopAbsentStudents };
