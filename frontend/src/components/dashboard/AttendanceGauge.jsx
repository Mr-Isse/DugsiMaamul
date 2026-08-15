import React from 'react';
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Tooltip,
} from 'recharts';
import { Activity } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import ChartCard from './ChartCard';

const GREEN = '#10b981';
const AMBER = '#f59e0b';
const RED = '#f43f5e';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold" style={{ color: payload[0].color }}>
        {payload[0].payload.name}: {payload[0].value}%
      </p>
    </div>
  );
};

const AttendanceGauge = ({ attendanceRate = 0, isLoading }) => {
  const color = attendanceRate >= 80 ? GREEN : attendanceRate >= 50 ? AMBER : RED;
  const chartData = [{ name: 'Attendance', value: attendanceRate, fill: color }];

  return (
    <ChartCard
      title="Attendance Overview"
      description="30-day attendance rate"
      icon={Activity}
      delay={0.74}
    >
      {isLoading ? (
        <div className="h-[200px]"><ChartSkeleton height={180} /></div>
      ) : (
        <div className="relative flex items-center justify-center" style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" barSize={16} data={chartData}>
              <RadialBar background={{ fill: 'currentColor' }} dataKey="value" cornerRadius={10} />
              <Tooltip content={<CustomTooltip />} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{attendanceRate}%</p>
            <p className="text-[10px] text-slate-400 font-medium">Present</p>
          </div>
        </div>
      )}
    </ChartCard>
  );
};

export default React.memo(AttendanceGauge);
