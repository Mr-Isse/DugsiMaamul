import React, { useMemo, useState } from 'react';
import { Activity, Archive, BarChart2, CheckCircle2, Download, FileText, HardDrive, RefreshCw, Search, Send, ShieldAlert, Timer, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { DugsiCard, DugsiHeader, DugsiPage, DugsiStatCard } from '../components/DugsiUI';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import {
  useGetStudentsQuery,
  useGetEnterpriseFinalOverviewQuery,
  useGetEnterpriseTeacherPerformanceQuery,
  useGetEnterpriseStudentRiskQuery,
  useGetEnterpriseFeeForecastQuery,
  useGetEnterpriseDefaultersQuery,
  useGetEnterpriseStorageQuery,
  useGetEnterpriseApiActivityQuery,
  useGetEnterpriseConsentsQuery,
  useCreateEnterpriseConsentMutation,
  useDeleteEnterpriseConsentMutation,
  useGetEnterpriseScheduledReportsQuery,
  useCreateEnterpriseScheduledReportMutation,
  useDeleteEnterpriseScheduledReportMutation,
  useGetEnterpriseArchivesQuery,
  useCreateEnterpriseArchiveMutation,
  useRestoreEnterpriseArchiveMutation,
  useGetEnterpriseTranscriptQuery,
  useGetEnterpriseStudentLifecycleQuery,
} from '../store/adminApiSlice';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { getApiBaseUrl } from '../utils/apiConfig';

const tabs = [
  ['analytics', 'Analytics'],
  ['transcripts', 'Transcripts'],
  ['consents', 'Consents'],
  ['automation', 'Automation'],
  ['storage', 'Storage & API'],
  ['archive', 'Archive'],
];

const rows = (payload) => payload?.data || [];
const money = (value) => `$${Number(value || 0).toLocaleString()}`;

function EnterpriseSuite() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [consentForm, setConsentForm] = useState({ student: '', type: 'trip', title: '', description: '' });
  const [scheduleForm, setScheduleForm] = useState({ name: '', reportType: 'revenue', frequency: 'weekly', deliveryChannels: ['notification'] });
  const [archiveForm, setArchiveForm] = useState({ title: '', archiveType: 'students', academicYear: '' });
  const token = useSelector((state) => state.auth.userInfo?.token);

  const { data: overview } = useGetEnterpriseFinalOverviewQuery();
  const { data: studentsPayload } = useGetStudentsQuery();
  const { data: teacherPayload } = useGetEnterpriseTeacherPerformanceQuery();
  const { data: riskPayload } = useGetEnterpriseStudentRiskQuery();
  const { data: forecastPayload } = useGetEnterpriseFeeForecastQuery();
  const { data: defaulterPayload } = useGetEnterpriseDefaultersQuery();
  const { data: storagePayload } = useGetEnterpriseStorageQuery();
  const { data: apiPayload } = useGetEnterpriseApiActivityQuery();
  const { data: consentPayload } = useGetEnterpriseConsentsQuery();
  const { data: schedulePayload } = useGetEnterpriseScheduledReportsQuery();
  const { data: archivePayload } = useGetEnterpriseArchivesQuery();
  const { data: transcriptPayload } = useGetEnterpriseTranscriptQuery({ studentId: selectedStudentId }, { skip: !selectedStudentId });
  const { data: lifecyclePayload } = useGetEnterpriseStudentLifecycleQuery(selectedStudentId, { skip: !selectedStudentId });

  const [createConsent] = useCreateEnterpriseConsentMutation();
  const [deleteConsent] = useDeleteEnterpriseConsentMutation();
  const [createSchedule] = useCreateEnterpriseScheduledReportMutation();
  const [deleteSchedule] = useDeleteEnterpriseScheduledReportMutation();
  const [createArchive] = useCreateEnterpriseArchiveMutation();
  const [restoreArchive] = useRestoreEnterpriseArchiveMutation();

  const students = useMemo(() => (Array.isArray(studentsPayload?.data) ? studentsPayload.data : Array.isArray(studentsPayload) ? studentsPayload : []), [studentsPayload]);
  const selectedStudent = students.find((student) => student._id === selectedStudentId);
  const overviewData = overview?.data || {};
  const forecast = forecastPayload?.data || {};
  const storage = storagePayload?.data || {};

  const submitConsent = async (event) => {
    event.preventDefault();
    if (!consentForm.student || !consentForm.title) return toast.error('Select a student and enter a consent title');
    await createConsent(consentForm).unwrap();
    setConsentForm({ student: '', type: 'trip', title: '', description: '' });
    toast.success('Consent request created');
  };

  const submitSchedule = async (event) => {
    event.preventDefault();
    if (!scheduleForm.name) return toast.error('Enter a report name');
    await createSchedule(scheduleForm).unwrap();
    setScheduleForm({ name: '', reportType: 'revenue', frequency: 'weekly', deliveryChannels: ['notification'] });
    toast.success('Scheduled report saved');
  };

  const submitArchive = async (event) => {
    event.preventDefault();
    if (!archiveForm.title) return toast.error('Enter an archive title');
    await createArchive(archiveForm).unwrap();
    setArchiveForm({ title: '', archiveType: 'students', academicYear: '' });
    toast.success('Archive record created');
  };

  const downloadFile = async (path, filename) => {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Download failed');
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportReport = async (type) => {
    try {
      await downloadFile(`/enterprise/final/export/${type}`, `${type}-report.xlsx`);
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const printPage = () => window.print();

  return (
    <DugsiPage>
      <DugsiHeader
        icon={BarChart2}
        title="Enterprise Suite"
        description="Final ERP controls for transcripts, lifecycle tracking, risk, consents, automation, storage, audit, archive, and forecasting."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DugsiStatCard icon={Users} label="Students" value={overviewData.students || 0} />
        <DugsiStatCard icon={ShieldAlert} label="Pending Consents" value={overviewData.pendingConsents || 0} tone="amber" />
        <DugsiStatCard icon={Timer} label="Scheduled Reports" value={overviewData.activeScheduledReports || 0} tone="emerald" />
        <DugsiStatCard icon={Activity} label="API Errors 24h" value={overviewData.apiErrors24h || 0} tone="rose" />
      </div>

      <DugsiCard>
        <div className="flex flex-wrap gap-2">
          {tabs.map(([key, label]) => (
            <Button key={key} variant={activeTab === key ? 'default' : 'outline'} onClick={() => setActiveTab(key)}>
              {label}
            </Button>
          ))}
          <Button variant="outline" className="ml-auto" onClick={printPage}><FileText size={16} /> Print</Button>
        </div>
      </DugsiCard>

      {activeTab === 'analytics' && (
        <div className="grid gap-6 xl:grid-cols-2">
          <DugsiCard>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Student Risk Detection</h2>
              <Button variant="outline" onClick={() => exportReport('risk')}><Download size={16} /> Export</Button>
            </div>
            <Table>
              <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Risk</TableHead><TableHead>Reason</TableHead></TableRow></TableHeader>
              <TableBody>
                {rows(riskPayload).slice(0, 8).map((item) => (
                  <TableRow key={item.student._id}><TableCell>{item.student.name}</TableCell><TableCell><Badge>{item.riskLevel}</Badge></TableCell><TableCell>{item.reason}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </DugsiCard>

          <DugsiCard>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Teacher Performance</h2>
            <Table>
              <TableHeader><TableRow><TableHead>Teacher</TableHead><TableHead>Attendance</TableHead><TableHead>Avg Score</TableHead></TableRow></TableHeader>
              <TableBody>
                {rows(teacherPayload).slice(0, 8).map((item) => (
                  <TableRow key={item.teacher._id}><TableCell>{item.teacher.name}</TableCell><TableCell>{item.attendanceRate}%</TableCell><TableCell>{item.studentPerformance}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </DugsiCard>

          <DugsiCard>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Fee Forecasting</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-4"><p className="text-sm text-slate-500">Expected</p><p className="text-xl font-bold text-slate-900">{money(forecast.expectedRevenue)}</p></div>
              <div className="rounded-lg bg-slate-50 p-4"><p className="text-sm text-slate-500">Collected</p><p className="text-xl font-bold text-slate-900">{money(forecast.collectedRevenue)}</p></div>
              <div className="rounded-lg bg-slate-50 p-4"><p className="text-sm text-slate-500">Outstanding</p><p className="text-xl font-bold text-slate-900">{money(forecast.outstandingRevenue)}</p></div>
            </div>
          </DugsiCard>

          <DugsiCard>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Smart Defaulters</h2>
              <Button variant="outline" onClick={() => exportReport('defaulters')}><Download size={16} /> Export</Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <Table>
                  <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Bucket</TableHead><TableHead>Amount</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {rows(defaulterPayload).filter((item) => item.alert).slice(0, 8).map((item) => (
                      <TableRow key={item.payment._id}><TableCell>{item.student?.name}</TableCell><TableCell>{item.bucket}</TableCell><TableCell>{money(item.payment.amount)}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <h3 className="text-sm font-semibold mb-3">Defaulters by Bucket</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={rows(defaulterPayload).reduce((acc, item) => {
                      const idx = acc.findIndex(x => x.name === item.bucket);
                      if (idx === -1) acc.push({ name: item.bucket, value: 1 }); else acc[idx].value += 1;
                      return acc;
                    }, [])} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </DugsiCard>
        </div>
      )}

      {activeTab === 'transcripts' && (
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <DugsiCard>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Student Lookup</h2>
            <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={selectedStudentId} onChange={(event) => setSelectedStudentId(event.target.value)}>
              <option value="">Select student</option>
              {students.map((student) => <option key={student._id} value={student._id}>{student.name} {student.customId ? `- ${student.customId}` : ''}</option>)}
            </select>
            {selectedStudentId && (
              <Button className="mt-3 w-full" onClick={() => downloadFile(`/enterprise/final/transcripts/${selectedStudentId}/pdf`, 'student-transcript.pdf').catch(() => toast.error('Export failed'))}>
                <Download size={16} /> Export PDF
              </Button>
            )}
          </DugsiCard>
          <DugsiCard>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">{selectedStudent?.name || 'Transcript Preview'}</h2>
            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">GPA</p><p className="font-bold">{transcriptPayload?.data?.gpa || 0}</p></div>
              <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Average</p><p className="font-bold">{transcriptPayload?.data?.averageScore || 0}</p></div>
              <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Verification</p><p className="font-bold">{transcriptPayload?.data?.verificationNumber || '-'}</p></div>
            </div>
            <Table>
              <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Score</TableHead><TableHead>Grade</TableHead></TableRow></TableHeader>
              <TableBody>{(transcriptPayload?.data?.subjects || []).map((row, index) => <TableRow key={`${row.subject}-${index}`}><TableCell>{row.subject}</TableCell><TableCell>{row.score}</TableCell><TableCell>{row.grade}</TableCell></TableRow>)}</TableBody>
            </Table>
            <div className="mt-6 space-y-3">
              {(lifecyclePayload?.data?.timeline || []).map((item) => (
                <div key={item.stage} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3">
                  <CheckCircle2 size={18} className="mt-0.5 text-indigo-600" />
                  <div><p className="font-semibold text-slate-800">{item.stage}</p><p className="text-sm text-slate-500">{item.detail}</p></div>
                </div>
              ))}
            </div>
          </DugsiCard>
        </div>
      )}

      {activeTab === 'consents' && (
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <DugsiCard>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Create Consent Request</h2>
            <form onSubmit={submitConsent} className="space-y-3">
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={consentForm.student} onChange={(event) => setConsentForm({ ...consentForm, student: event.target.value })}>
                <option value="">Select student</option>
                {students.map((student) => <option key={student._id} value={student._id}>{student.name}</option>)}
              </select>
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={consentForm.type} onChange={(event) => setConsentForm({ ...consentForm, type: event.target.value })}>
                <option value="trip">School Trip</option><option value="event">Event</option><option value="medical">Medical</option><option value="activity">Activity</option>
              </select>
              <Input placeholder="Title" value={consentForm.title} onChange={(event) => setConsentForm({ ...consentForm, title: event.target.value })} />
              <Input placeholder="Description" value={consentForm.description} onChange={(event) => setConsentForm({ ...consentForm, description: event.target.value })} />
              <Button type="submit"><Send size={16} /> Save Request</Button>
            </form>
          </DugsiCard>
          <DugsiCard>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Consent Requests</h2>
            <Table><TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Student</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>{rows(consentPayload).map((item) => <TableRow key={item._id}><TableCell>{item.title}</TableCell><TableCell>{item.student?.name}</TableCell><TableCell><Badge>{item.status}</Badge></TableCell><TableCell><Button variant="outline" size="sm" onClick={() => deleteConsent(item._id)}>Archive</Button></TableCell></TableRow>)}</TableBody>
            </Table>
          </DugsiCard>
        </div>
      )}

      {activeTab === 'automation' && (
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <DugsiCard>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Scheduled Report</h2>
            <form onSubmit={submitSchedule} className="space-y-3">
              <Input placeholder="Report name" value={scheduleForm.name} onChange={(event) => setScheduleForm({ ...scheduleForm, name: event.target.value })} />
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={scheduleForm.reportType} onChange={(event) => setScheduleForm({ ...scheduleForm, reportType: event.target.value })}>
                <option value="revenue">Revenue</option><option value="attendance">Attendance</option><option value="risk">Risk</option><option value="defaulters">Defaulters</option><option value="teacher-performance">Teacher Performance</option>
              </select>
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={scheduleForm.frequency} onChange={(event) => setScheduleForm({ ...scheduleForm, frequency: event.target.value })}>
                <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
              </select>
              <Button type="submit"><Timer size={16} /> Schedule</Button>
            </form>
          </DugsiCard>
          <DugsiCard>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Active Schedules</h2>
            <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Frequency</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>{rows(schedulePayload).map((item) => <TableRow key={item._id}><TableCell>{item.name}</TableCell><TableCell>{item.reportType}</TableCell><TableCell>{item.frequency}</TableCell><TableCell><Button variant="outline" size="sm" onClick={() => deleteSchedule(item._id)}>Archive</Button></TableCell></TableRow>)}</TableBody>
            </Table>
          </DugsiCard>
        </div>
      )}

      {activeTab === 'storage' && (
        <div className="grid gap-6 xl:grid-cols-2">
          <DugsiCard>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800"><HardDrive size={20} /> Storage Usage</h2>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Used {storage.usedMb || 0} MB of {storage.limitMb || 0} MB</p>
              <div className="mt-3 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-indigo-600" style={{ width: `${Math.min(((storage.usedMb || 0) / (storage.limitMb || 1)) * 100, 100)}%` }} /></div>
            </div>
          </DugsiCard>
          <DugsiCard>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">API Activity Logs</h2>
            <Table><TableHeader><TableRow><TableHead>Endpoint</TableHead><TableHead>Status</TableHead><TableHead>Duration</TableHead></TableRow></TableHeader>
              <TableBody>{rows(apiPayload).slice(0, 10).map((item) => <TableRow key={item._id}><TableCell>{item.method} {item.endpoint}</TableCell><TableCell>{item.statusCode}</TableCell><TableCell>{item.durationMs}ms</TableCell></TableRow>)}</TableBody>
            </Table>
          </DugsiCard>
        </div>
      )}

      {activeTab === 'archive' && (
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <DugsiCard>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800"><Archive size={20} /> Archive Policy</h2>
            <form onSubmit={submitArchive} className="space-y-3">
              <Input placeholder="Archive title" value={archiveForm.title} onChange={(event) => setArchiveForm({ ...archiveForm, title: event.target.value })} />
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" value={archiveForm.archiveType} onChange={(event) => setArchiveForm({ ...archiveForm, archiveType: event.target.value })}>
                <option value="academic-year">Academic Year</option><option value="students">Students</option><option value="reports">Reports</option><option value="attendance">Attendance</option><option value="exams">Exams</option>
              </select>
              <Input placeholder="Academic year" value={archiveForm.academicYear} onChange={(event) => setArchiveForm({ ...archiveForm, academicYear: event.target.value })} />
              <Button type="submit"><Archive size={16} /> Create Archive</Button>
            </form>
          </DugsiCard>
          <DugsiCard>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Archives</h2>
            <Table><TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Records</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>{rows(archivePayload).map((item) => <TableRow key={item._id}><TableCell>{item.title}</TableCell><TableCell>{item.archiveType}</TableCell><TableCell>{item.recordCount}</TableCell><TableCell><Button variant="outline" size="sm" onClick={() => restoreArchive(item._id)}><RefreshCw size={14} /> Restore</Button></TableCell></TableRow>)}</TableBody>
            </Table>
          </DugsiCard>
        </div>
      )}
    </DugsiPage>
  );
}

export default EnterpriseSuite;
