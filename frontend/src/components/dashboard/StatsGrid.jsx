import React from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Users,
  GraduationCap,
  Activity,
  BookOpen,
} from 'lucide-react';
import StatCard from './StatCard';

const StatsGrid = ({ stats, isLoading, userInfo, hasFeatureAccess, formatCurrency, formatNumber }) => {
  const attendanceRate = stats?.attendanceRate || 0;
  const attendanceTrend = attendanceRate >= 80 ? 'up' : attendanceRate >= 50 ? undefined : 'down';
  const attendanceLabel = attendanceRate >= 80 ? 'Healthy' : attendanceRate >= 50 ? 'Moderate' : 'Needs attention';

  const showFinance = hasFeatureAccess(userInfo, 'finance');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Students"
          value={formatNumber(stats?.totalStudents)}
          icon={Users}
          variant="blue"
          subValue="Registered students"
          isLoading={isLoading}
          index={0}
        />
        <StatCard
          title="Total Teachers"
          value={formatNumber(stats?.totalTeachers)}
          icon={GraduationCap}
          variant="violet"
          subValue="Active teachers"
          isLoading={isLoading}
          index={1}
        />
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          icon={Activity}
          variant="amber"
          subValue="Last 30 days average"
          trend={attendanceTrend}
          trendValue={attendanceLabel}
          isLoading={isLoading}
          index={2}
        />
        <StatCard
          title="Total Classes"
          value={formatNumber(stats?.totalClasses)}
          icon={BookOpen}
          variant="cyan"
          subValue="Active classes"
          isLoading={isLoading}
          index={3}
        />
        {showFinance && (
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats?.totalRevenue)}
            icon={DollarSign}
            variant="emerald"
            subValue="All-time collected"
            isLoading={isLoading}
            index={4}
          />
        )}
      </div>
    </motion.div>
  );
};

export default React.memo(StatsGrid);
