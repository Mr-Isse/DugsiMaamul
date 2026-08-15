import { useState, useMemo } from 'react';
import {
  Brain, Plus, Search, MessageSquare, BarChart2,
  AlertTriangle, CheckCircle, Sparkles, Send,
} from 'lucide-react';
import { useToast } from '../components/ToastContainer';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetAIPredictionsQuery,
  useGeneratePredictionsMutation,
  useGetAIInsightsQuery,
  useGetAIChatSessionsQuery,
  useGetAIChatMessagesQuery,
  useSendAIChatMessageMutation,
} from '../store/adminApiSlice';

const PREDICTION_TYPES = ['At Risk', 'Performance', 'Attendance', 'Dropout'];

const TYPE_COLORS = {
  'At Risk':     'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Performance:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Attendance:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Dropout:       'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const fmtDate = (d) => {
  if (!d) return '\u2014';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

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

const ChatPanel = ({ sessionId }) => {
  const toast = useToast();
  const [message, setMessage] = useState('');
  const { data: messagesData } = useGetAIChatMessagesQuery(sessionId, { skip: !sessionId });
  const [sendMessage] = useSendAIChatMessageMutation();

  const messages = messagesData?.data || messagesData?.messages || [];

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !sessionId) return;
    try {
      await sendMessage({ sessionId, message }).unwrap();
      setMessage('');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to send message');
    }
  };

  return (
    <div className="flex flex-col h-[400px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-sm text-slate-400 py-8">
            No messages yet. Start the conversation.
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={msg._id || i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-br-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-md'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      {sessionId && (
        <form onSubmit={handleSend} className="border-t border-slate-100 dark:border-slate-800 p-3 flex gap-2">
          <input value={message} onChange={e => setMessage(e.target.value)}
            placeholder="Ask the AI assistant\u2026"
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <button type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-bold transition-colors">
            <Send size={16} />
          </button>
        </form>
      )}
    </div>
  );
};

const AIDashboard = () => {
  const toast = useToast();
  const [filters, setFilters] = useState({ search: '', type: '' });
  const [predictionType, setPredictionType] = useState('At Risk');
  const [activeSession, setActiveSession] = useState(null);

  const setF = (k, v) => setFilters(p => ({ ...p, [k]: v }));

  const queryArgs = useMemo(() => {
    const q = {};
    if (filters.search) q.search = filters.search;
    if (filters.type) q.type = filters.type;
    return q;
  }, [filters]);

  const { data, isLoading, refetch } = useGetAIPredictionsQuery(queryArgs);
  const { data: insightsData } = useGetAIInsightsQuery();
  const { data: sessionsData } = useGetAIChatSessionsQuery();
  const [generatePredictions] = useGeneratePredictionsMutation();

  const predictions = data?.data || data?.predictions || [];
  const insights = insightsData?.data || insightsData?.insights || [];
  const sessions = sessionsData?.data || sessionsData?.sessions || [];

  const stats = useMemo(() => {
    const total = predictions.length;
    const highConf = predictions.filter(p => (p.confidence || 0) >= 80).length;
    const models = [...new Set(predictions.map(p => p.model))].length || 1;
    const lastGen = predictions.length > 0 ? predictions[0].createdAt : null;
    return { total, highConf, models, lastGen };
  }, [predictions]);

  const handleGenerate = async () => {
    try {
      await generatePredictions({ type: predictionType }).unwrap();
      toast.success('Predictions generated');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to generate predictions');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Brain className="text-indigo-600" size={28} />
            AI Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            AI-powered predictions, insights, and learning assistant.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <select value={predictionType} onChange={e => setPredictionType(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {PREDICTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button onClick={handleGenerate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors text-sm">
            <Sparkles size={16} /> Generate Predictions
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Predictions" value={stats.total} icon={Brain} color="bg-indigo-500" />
          <StatCard label="High Confidence" value={stats.highConf} icon={CheckCircle} color="bg-green-500" />
          <StatCard label="Models Active" value={stats.models} icon={BarChart2} color="bg-blue-500" />
          <StatCard label="Last Generated" value={fmtDate(stats.lastGen)} icon={Sparkles} color="bg-purple-500" />
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={filters.search} onChange={e => setF('search', e.target.value)}
              placeholder="Search predictions\u2026"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <select value={filters.type} onChange={e => setF('type', e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Types</option>
            {PREDICTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : predictions.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
              <Brain size={28} className="text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No predictions yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Click "Generate Predictions" to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Prediction</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Confidence</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {predictions.map(p => (
                  <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${TYPE_COLORS[p.type] || ''}`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                      {p.studentName || p.student?.name || '\u2014'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                      {p.prediction}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div className={`h-full rounded-full ${(p.confidence || 0) >= 80 ? 'bg-green-500' : (p.confidence || 0) >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${p.confidence || 0}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{p.confidence || 0}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                      {fmtDate(p.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles size={18} /> AI Insights
          </h2>
          {insights.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-400">No insights available yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {insights.map((insight, i) => (
                <div key={insight._id || i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{insight.title || insight.finding}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{insight.description || insight.detail}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare size={18} /> AI Chat
            </h2>
          </div>
          <div className="flex">
            <div className="w-48 border-r border-slate-100 dark:border-slate-800 max-h-[400px] overflow-y-auto">
              {sessions.length === 0 ? (
                <div className="p-3 text-xs text-slate-400 text-center">No sessions</div>
              ) : (
                sessions.map(s => (
                  <button key={s._id} onClick={() => setActiveSession(s._id)}
                    className={`w-full text-left px-3 py-2.5 text-xs font-bold border-b border-slate-50 dark:border-slate-800 transition-colors ${
                      activeSession === s._id
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}>
                    {s.title || `Session ${s._id?.slice(-4)}`}
                  </button>
                ))
              )}
            </div>
            <div className="flex-1">
              <ChatPanel sessionId={activeSession} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDashboard;
