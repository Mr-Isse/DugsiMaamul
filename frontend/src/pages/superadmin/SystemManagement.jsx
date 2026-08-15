import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Settings, 
  Bell, 
  BookOpen, 
  Layers, 
  RefreshCcw, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Cloud,
  Webhook,
  Loader2
} from 'lucide-react';
import { 
  PageHeader, 
  Panel, 
  Badge, 
  Field, 
  superAdminInputClass, 
  superAdminBtnPrimary, 
  superAdminBtnGhost 
} from '../../components/superadmin/SuperAdminShell';
import { 
  useToggleMaintenanceModeMutation, 
  useGetDashboardStatsQuery,
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useGetKnowledgeBaseQuery,
  useManageKnowledgeBaseMutation,
  useGetIntegrationsQuery,
  useUpdateIntegrationMutation,
  useGetRecoveryStatusQuery
} from '../../store/superAdminApiSlice';
import { toast } from 'sonner';

const SystemManagement = () => {
  const [activeTab, setActiveTab] = useState('status');

  // API Hooks
  const { data: stats } = useGetDashboardStatsQuery();
  const { data: announcements, isLoading: loadingAnnouncements } = useGetAnnouncementsQuery();
  const { data: kbArticles, isLoading: loadingKB } = useGetKnowledgeBaseQuery();
  const { data: integrations, isLoading: loadingIntegrations } = useGetIntegrationsQuery();
  const { data: recovery, isLoading: loadingRecovery } = useGetRecoveryStatusQuery();

  const [toggleMaintenance] = useToggleMaintenanceModeMutation();
  const [createAnnouncement] = useCreateAnnouncementMutation();
  const [manageKB] = useManageKnowledgeBaseMutation();
  const [updateIntegration] = useUpdateIntegrationMutation();

  // Local State for Forms
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', type: 'announcement' });
  const [kbForm, setKBForm] = useState({ title: '', content: '', category: 'General', type: 'article' });

  const handleToggleMaintenance = async (isEnabled) => {
    try {
      await toggleMaintenance(isEnabled).unwrap();
      toast.success(`Maintenance mode ${isEnabled ? 'enabled' : 'disabled'}`);
    } catch (err) {
      toast.error('Failed to toggle maintenance mode');
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await createAnnouncement({ ...announcementForm, isPublished: true }).unwrap();
      setAnnouncementForm({ title: '', content: '', type: 'announcement' });
      toast.success('Announcement published');
    } catch (err) {
      toast.error('Failed to publish announcement');
    }
  };

  const tabs = [
    { id: 'status', label: 'System Status', icon: ShieldAlert },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    { id: 'kb', label: 'Knowledge Base', icon: BookOpen },
    { id: 'integrations', label: 'Integrations', icon: Webhook },
    { id: 'recovery', label: 'Disaster Recovery', icon: RefreshCcw },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader 
        title="System Management" 
        subtitle="Control platform behavior, announcements, and integrations." 
      />

      <div className="flex flex-col lg:flex-row gap-8 mt-10">
        {/* Sidebar Tabs */}
        <aside className="lg:w-64 shrink-0">
          <div className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-200
                  ${activeTab === tab.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
                  }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'status' && (
            <div className="space-y-6">
              <Panel className="p-8">
                <div className="flex items-center justify-between mb-8">
                   <div>
                      <h3 className="text-xl font-black text-white">Maintenance Mode</h3>
                      <p className="text-slate-500 text-sm mt-1">When enabled, only super admins can access the platform.</p>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className={`text-xs font-black uppercase tracking-widest ${stats?.maintenanceMode ? 'text-rose-500' : 'text-emerald-500'}`}>
                         {stats?.maintenanceMode ? 'ENABLED' : 'DISABLED'}
                      </span>
                      <button 
                        onClick={() => handleToggleMaintenance(!stats?.maintenanceMode)}
                        className={`w-14 h-8 rounded-full relative transition-colors ${stats?.maintenanceMode ? 'bg-rose-500' : 'bg-slate-700'}`}
                      >
                         <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${stats?.maintenanceMode ? 'translate-x-7' : 'translate-x-1'}`} />
                      </button>
                   </div>
                </div>
                
                <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 flex items-start gap-4">
                   <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                      <AlertCircle size={20} />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-slate-300">Important Note</p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Enabling maintenance mode will immediately disconnect all active users (Admins, Teachers, Students). 
                        A maintenance screen will be shown to them until you disable this mode.
                      </p>
                   </div>
                </div>
              </Panel>

              <div className="grid md:grid-cols-2 gap-6">
                 <Panel className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                       <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                          <Database size={20} />
                       </div>
                       <h3 className="text-sm font-black text-white uppercase tracking-widest">Database Health</h3>
                    </div>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Engine Status</span>
                          <Badge variant="success">Connected</Badge>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Active Connections</span>
                          <span className="text-sm font-black text-white">42</span>
                       </div>
                    </div>
                 </Panel>
                 <Panel className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                       <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                          <Cloud size={20} />
                       </div>
                       <h3 className="text-sm font-black text-white uppercase tracking-widest">Storage Status</h3>
                    </div>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Media Service</span>
                          <Badge variant="success">Cloudinary Active</Badge>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Quota Used</span>
                          <span className="text-sm font-black text-white">12.4 GB / 100 GB</span>
                       </div>
                    </div>
                 </Panel>
              </div>
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="space-y-6">
              <Panel className="p-8">
                <h3 className="text-xl font-black text-white mb-6">New Announcement</h3>
                <form onSubmit={handleCreateAnnouncement} className="space-y-6">
                   <Field label="TITLE">
                      <input 
                        type="text" 
                        value={announcementForm.title}
                        onChange={e => setAnnouncementForm({...announcementForm, title: e.target.value})}
                        className={superAdminInputClass} 
                        placeholder="e.g. System Update v2.4"
                      />
                   </Field>
                   <Field label="MESSAGE CONTENT">
                      <textarea 
                        value={announcementForm.content}
                        onChange={e => setAnnouncementForm({...announcementForm, content: e.target.value})}
                        className={`${superAdminInputClass} h-32 resize-none`}
                        placeholder="Details about the update..."
                      />
                   </Field>
                   <div className="grid grid-cols-2 gap-6">
                      <Field label="TYPE">
                         <select 
                           value={announcementForm.type}
                           onChange={e => setAnnouncementForm({...announcementForm, type: e.target.value})}
                           className={superAdminInputClass}
                         >
                            <option value="announcement">Announcement</option>
                            <option value="update">System Update</option>
                            <option value="feature">New Feature</option>
                            <option value="maintenance">Maintenance Notice</option>
                            <option value="security">Security Alert</option>
                         </select>
                      </Field>
                      <div className="flex items-end">
                         <button type="submit" className={`${superAdminBtnPrimary} w-full py-4`}>
                            Publish Announcement
                         </button>
                      </div>
                   </div>
                </form>
              </Panel>

              <Panel className="overflow-hidden">
                 <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Recent Announcements</h3>
                 </div>
                 <div className="divide-y divide-slate-800">
                    {loadingAnnouncements ? (
                       <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-slate-500" /></div>
                    ) : announcements?.length > 0 ? (
                       announcements.map(ann => (
                          <div key={ann._id} className="p-6 flex items-start justify-between group hover:bg-slate-900/50 transition-colors">
                             <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-colors">
                                   <Bell size={18} />
                                </div>
                                <div>
                                   <p className="text-sm font-bold text-white">{ann.title}</p>
                                   <p className="text-xs text-slate-500 mt-1">{new Date(ann.createdAt).toLocaleDateString()}</p>
                                </div>
                             </div>
                             <Badge variant="indigo">{ann.type}</Badge>
                          </div>
                       ))
                    ) : (
                       <div className="p-12 text-center text-slate-500 text-sm font-medium italic">No announcements yet.</div>
                    )}
                 </div>
              </Panel>
            </div>
          )}

          {activeTab === 'kb' && (
            <div className="space-y-6">
               <Panel className="p-8">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-xl font-black text-white">Help Center Articles</h3>
                     <button className={superAdminBtnPrimary} onClick={() => toast.success('Editor opening...')}>
                        <Plus size={18} className="mr-2" /> New Article
                     </button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {loadingKB ? (
                        [1,2,3].map(i => <div key={i} className="h-32 bg-slate-900/50 rounded-2xl animate-pulse" />)
                     ) : kbArticles?.length > 0 ? (
                        kbArticles.map(art => (
                           <div key={art._id} className="p-5 bg-slate-900/50 rounded-2xl border border-slate-800 group hover:border-indigo-500/50 transition-all cursor-pointer">
                              <Badge variant="indigo" className="mb-3">{art.category}</Badge>
                              <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{art.title}</h4>
                              <p className="text-xs text-slate-500 mt-2 line-clamp-2">{art.content.replace(/<[^>]*>?/gm, '')}</p>
                           </div>
                        ))
                     ) : (
                        <div className="col-span-full py-12 text-center text-slate-500">No articles published.</div>
                     )}
                  </div>
               </Panel>
            </div>
          )}

          {activeTab === 'integrations' && (
             <div className="space-y-6">
                <Panel className="p-8">
                   <h3 className="text-xl font-black text-white mb-6">Third-Party Integrations</h3>
                   <div className="space-y-4">
                      {loadingIntegrations ? (
                         <div className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-slate-500" /></div>
                      ) : integrations?.length > 0 ? (
                         integrations.map(integ => (
                            <div key={integ._id} className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 flex items-center justify-between">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                                     <Webhook size={24} />
                                  </div>
                                  <div>
                                     <p className="text-sm font-bold text-white">{integ.name}</p>
                                     <p className="text-xs text-slate-500 mt-0.5">{integ.provider}</p>
                                  </div>
                               </div>
                               <div className="flex items-center gap-6">
                                  <div className="text-right hidden sm:block">
                                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Environment</p>
                                     <p className="text-xs font-bold text-indigo-400">{integ.environment}</p>
                                  </div>
                                  <button 
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                      integ.isEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-400'
                                    }`}
                                  >
                                     {integ.isEnabled ? 'Active' : 'Disabled'}
                                  </button>
                                  <button className="p-2 text-slate-500 hover:text-white transition-colors">
                                     <Settings size={20} />
                                  </button>
                               </div>
                            </div>
                         ))
                      ) : (
                         <div className="py-12 text-center text-slate-500">No integrations configured.</div>
                      )}
                   </div>
                </Panel>
             </div>
          )}

          {activeTab === 'recovery' && (
             <div className="space-y-6">
                <Panel className="p-8">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black text-white">Disaster Recovery</h3>
                      <button className={superAdminBtnPrimary}>
                         <RefreshCcw size={18} className="mr-2" /> Run Emergency Backup
                      </button>
                   </div>
                   
                   <div className="grid md:grid-cols-3 gap-6 mb-8">
                      <div className="p-5 bg-slate-900/50 rounded-2xl border border-slate-800">
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Last Backup</p>
                         <p className="text-sm font-bold text-white">{recovery?.lastBackup ? new Date(recovery.lastBackup.createdAt).toLocaleString() : 'Never'}</p>
                      </div>
                      <div className="p-5 bg-slate-900/50 rounded-2xl border border-slate-800">
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Health Status</p>
                         <p className="text-sm font-bold text-emerald-500">{recovery?.recoveryHealth || 'Excellent'}</p>
                      </div>
                      <div className="p-5 bg-slate-900/50 rounded-2xl border border-slate-800">
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Recovery Point</p>
                         <p className="text-sm font-bold text-indigo-400">24h Frequency</p>
                      </div>
                   </div>

                   <h4 className="text-sm font-black text-white uppercase tracking-widest mb-4">Recent Backup Logs</h4>
                   <div className="divide-y divide-slate-800 border-t border-slate-800">
                      {loadingRecovery ? (
                         <div className="py-8 text-center"><Loader2 className="animate-spin mx-auto text-slate-500" /></div>
                      ) : recovery?.recoveryLogs?.length > 0 ? (
                         recovery.recoveryLogs.map(log => (
                            <div key={log._id} className="py-4 flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  <CheckCircle2 size={16} className="text-emerald-500" />
                                  <span className="text-xs font-medium text-slate-300">{log.fileName}</span>
                               </div>
                               <span className="text-[10px] font-bold text-slate-500">{(log.sizeBytes / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                         ))
                      ) : (
                         <div className="py-8 text-center text-slate-500 text-xs">No logs found.</div>
                      )}
                   </div>
                </Panel>
             </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SystemManagement;
