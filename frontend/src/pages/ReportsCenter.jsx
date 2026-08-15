import React, { useMemo } from 'react';
import { BarChart2, Users, GraduationCap, DollarSign, FileText, TrendingUp, Sparkles } from 'lucide-react';
import { useGetClassesQuery, useGetStudentsQuery, useGetTeachersQuery, useGetMonthlyPaymentsQuery } from '../store/adminApiSlice';
import { DugsiCard, DugsiHeader, DugsiPage, DugsiStatCard } from '../components/DugsiUI';

function ReportsCenter() {
  const { data: studentsPayload } = useGetStudentsQuery();
  const { data: teachersPayload } = useGetTeachersQuery();
  const { data: classesPayload } = useGetClassesQuery();
  const { data: paymentsPayload } = useGetMonthlyPaymentsQuery();

  const students = useMemo(() => {
    if (Array.isArray(studentsPayload?.data)) return studentsPayload.data;
    if (Array.isArray(studentsPayload)) return studentsPayload;
    return [];
  }, [studentsPayload]);

  const teachers = useMemo(() => {
    if (Array.isArray(teachersPayload?.data)) return teachersPayload.data;
    if (Array.isArray(teachersPayload)) return teachersPayload;
    return [];
  }, [teachersPayload]);

  const classes = useMemo(() => {
    if (Array.isArray(classesPayload?.data)) return classesPayload.data;
    if (Array.isArray(classesPayload)) return classesPayload;
    return [];
  }, [classesPayload]);

  const payments = useMemo(() => {
    if (Array.isArray(paymentsPayload?.data)) return paymentsPayload.data;
    if (Array.isArray(paymentsPayload)) return paymentsPayload;
    return [];
  }, [paymentsPayload]);

  const distribution = [
    { label: 'Enrollment', value: students.length, max: Math.max(students.length, 50) },
    { label: 'Staff', value: teachers.length, max: Math.max(teachers.length, 50) },
    { label: 'Active classes', value: classes.length, max: Math.max(classes.length, 50) },
  ];

  return (
    <DugsiPage>
      <DugsiHeader
        icon={BarChart2}
        title="Reports Center"
        description="A quick operational view of the school data that matters most."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DugsiStatCard icon={Users} label="Students" value={students.length} />
        <DugsiStatCard icon={GraduationCap} label="Teachers" value={teachers.length} tone="emerald" />
        <DugsiStatCard icon={FileText} label="Classes" value={classes.length} tone="amber" />
        <DugsiStatCard icon={DollarSign} label="Revenue Items" value={payments.length} tone="rose" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <DugsiCard>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-100 p-2 text-indigo-700"><BarChart2 size={20} /></div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Latest activity</h2>
              <p className="text-sm text-slate-500">A compact snapshot of your current school records.</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {distribution.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
                  <span>{item.label}</span>
                  <span className="font-semibold text-slate-700">{item.value}</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100">
                  <div className="h-2.5 rounded-full bg-indigo-600" style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </DugsiCard>

        <DugsiCard>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-2 text-emerald-700"><TrendingUp size={20} /></div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Snapshot</h2>
              <p className="text-sm text-slate-500">Your school is active and growing.</p>
            </div>
          </div>
          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <Sparkles size={16} />
              Strong operational coverage
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">The system currently has {students.length} students, {teachers.length} teachers, {classes.length} classes, and {payments.length} fee records ready for review.</p>
          </div>
        </DugsiCard>
      </div>
    </DugsiPage>
  );
}

export default ReportsCenter;
