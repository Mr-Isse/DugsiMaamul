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
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';

// Colors (match tailwind theme)
const COLORS = {
  primary: '#4F46E5',
  secondary: '#10B981',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
};

export const MonthlyRevenueLine = ({ payments = [] }) => {
  // Aggregate payments by day within the month
  const data = useMemo(() => {
    const map = new Map();
    payments.forEach((p) => {
      const date = p.paidAt ? new Date(p.paidAt) : new Date(p.createdAt || Date.now());
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const amount = Number(p.amount || 0);
      map.set(key, (map.get(key) || 0) + amount);
    });
    return Array.from(map.entries()).map(([date, amount]) => ({ date, amount }));
  }, [payments]);

  if (!data.length) return <div className="p-6 text-sm text-slate-500">No trend data available for the selected period.</div>;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v) => `$${v}`} />
        <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
        <Line type="monotone" dataKey="amount" stroke={COLORS.primary} strokeWidth={3} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const CollectedVsPendingStack = ({ payments = [], expected = 0 }) => {
  // Aggregate by status per day
  const data = useMemo(() => {
    const map = new Map();
    payments.forEach((p) => {
      const date = p.paidAt ? new Date(p.paidAt) : new Date(p.createdAt || Date.now());
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const paid = p.status === 'PAID' ? Number(p.amount || 0) : 0;
      const pending = p.status === 'PAID' ? 0 : Number(p.amount || 0);
      const cur = map.get(key) || { date: key, paid: 0, pending: 0 };
      cur.paid += paid;
      cur.pending += pending;
      map.set(key, cur);
    });
    return Array.from(map.values());
  }, [payments]);

  if (!data.length) return <div className="p-6 text-sm text-slate-500">No payments data available.</div>;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v) => `$${v}`} />
        <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
        <Legend />
        <Bar dataKey="paid" stackId="a" fill={COLORS.primary} />
        <Bar dataKey="pending" stackId="a" fill={COLORS.warning} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const RevenueByBranchPie = ({ payments = [] }) => {
  const data = useMemo(() => {
    const map = new Map();
    payments.forEach((p) => {
      const branch = p.branch?.name || p.branch || 'Unknown';
      const amount = Number(p.amount || 0);
      map.set(branch, (map.get(branch) || 0) + amount);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [payments]);

  if (!data.length) return <div className="p-6 text-sm text-slate-500">No branch breakdown available.</div>;

  const COLORS_ARR = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.danger];

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label />
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS_ARR[index % COLORS_ARR.length]} />
        ))}
        <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const TopClassesHorizontal = ({ payments = [] }) => {
  const data = useMemo(() => {
    const map = new Map();
    payments.forEach((p) => {
      const cls = p.class?.name || p.class || (p.student?.class?.name) || 'Unknown';
      const amount = Number(p.amount || 0);
      map.set(cls, (map.get(cls) || 0) + amount);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [payments]);

  if (!data.length) return <div className="p-6 text-sm text-slate-500">No class payment data available.</div>;

  // Recharts horizontal bar uses BarChart with layout="vertical"
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 40, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tickFormatter={(v) => `$${v}`} />
        <YAxis dataKey="name" type="category" width={140} />
        <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
        <Bar dataKey="value" fill={COLORS.secondary} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default {
  MonthlyRevenueLine,
  CollectedVsPendingStack,
  RevenueByBranchPie,
  TopClassesHorizontal,
};
