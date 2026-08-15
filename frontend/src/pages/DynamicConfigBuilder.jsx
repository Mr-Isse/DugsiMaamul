import { useState, useMemo } from 'react';
import {
  Settings, Plus, Search, Edit3, X, Trash2, Save, Code, Database, RefreshCw, ChevronDown, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetDynamicConfigsQuery,
  useGetDynamicConfigQuery,
  useUpsertDynamicConfigMutation,
  useDeleteDynamicConfigMutation,
} from '../store/adminApiSlice';

const CONFIG_TYPES = ['string', 'number', 'boolean', 'json'];

const ModuleModal = ({ moduleName, entries, onClose }) => {
  const [formEntries, setFormEntries] = useState(
    entries.map(e => ({
      key: e.key || '',
      value: typeof e.value === 'string' ? e.value : JSON.stringify(e.value || ''),
      type: e.type || 'string',
      description: e.description || '',
      _id: e._id,
    }))
  );

  const [upsertConfig, { isLoading }] = useUpsertDynamicConfigMutation();

  const setEntry = (idx, k, v) => {
    setFormEntries(p => p.map((e, i) => i === idx ? { ...e, [k]: v } : e));
  };

  const addEntry = () => {
    setFormEntries(p => [...p, { key: '', value: '', type: 'string', description: '' }]);
  };

  const removeEntry = (idx) => {
    setFormEntries(p => p.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valid = formEntries.filter(e => e.key.trim());
    if (valid.length === 0) return toast.error('Add at least one entry with a key');
    try {
      await upsertConfig({ module: moduleName, entries: valid.map(e => ({
        ...e,
        value: e.type === 'number' ? Number(e.value) : e.type === 'boolean' ? e.value === 'true' || e.value === true : e.type === 'json' ? JSON.parse(e.value || '{}') : e.value,
      }))}).unwrap();
      toast.success('Configuration saved');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save configuration');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Edit Module</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{moduleName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formEntries.map((entry, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Entry {idx + 1}
                </p>
                {formEntries.length > 1 && (
                  <button type="button" onClick={() => removeEntry(idx)}
                    className="p-1 rounded-lg text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Key</label>
                  <input value={entry.key} onChange={e => setEntry(idx, 'key', e.target.value)}
                    placeholder="e.g. max_upload_size"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Type</label>
                  <select value={entry.type} onChange={e => setEntry(idx, 'type', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {CONFIG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Value</label>
                <input value={entry.value} onChange={e => setEntry(idx, 'value', e.target.value)}
                  placeholder={entry.type === 'json' ? '{"key": "value"}' : entry.type === 'boolean' ? 'true or false' : 'Enter value'}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Description</label>
                <input value={entry.description} onChange={e => setEntry(idx, 'description', e.target.value)}
                  placeholder="What does this config do?"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
          ))}

          <button type="button" onClick={addEntry}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-sm font-bold text-slate-500 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors flex items-center justify-center gap-2">
            <Plus size={16} /> Add Entry
          </button>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 px-4 text-sm font-bold transition-all duration-200 disabled:opacity-50">
              <Save size={16} /> {isLoading ? 'Saving...' : 'Save Module'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DynamicConfigBuilder = () => {
  const [search, setSearch] = useState('');
  const [expandedModule, setExpandedModule] = useState(null);
  const [editingModule, setEditingModule] = useState(null);

  const { data: configsData, isLoading, refetch } = useGetDynamicConfigsQuery();
  const { data: moduleData, isLoading: moduleLoading } = useGetDynamicConfigQuery(expandedModule, { skip: !expandedModule });
  const [deleteConfig, { isLoading: deleting }] = useDeleteDynamicConfigMutation();

  const configs = configsData?.data || configsData?.configs || (Array.isArray(configsData) ? configsData : []);

  const filteredConfigs = useMemo(() => {
    if (!search.trim()) return configs;
    const q = search.toLowerCase();
    return configs.filter(c =>
      (c.module || '').toLowerCase().includes(q) ||
      (c.key || '').toLowerCase().includes(q)
    );
  }, [configs, search]);

  const handleDeleteEntry = async (config) => {
    try {
      await deleteConfig({ module: expandedModule, key: config.key }).unwrap();
      toast.success('Entry deleted');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete entry');
    }
  };

  const moduleEntries = moduleData?.data || moduleData?.entries || (Array.isArray(moduleData) ? moduleData : []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Database className="text-cyan-600" size={28} />
            Dynamic Config Builder
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage configuration modules and key-value pairs.
          </p>
        </div>
        <button onClick={refetch}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search modules or keys..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : filteredConfigs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 py-16 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center mb-4">
            <Settings size={28} className="text-cyan-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No configuration modules found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {search ? 'Try adjusting your search.' : 'Configuration modules will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredConfigs.map((config) => {
            const isExpanded = expandedModule === config.module;
            return (
              <div key={config.module}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <button
                  onClick={() => setExpandedModule(isExpanded ? null : config.module)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isExpanded ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      <Code size={20} className={isExpanded ? 'text-indigo-600' : 'text-slate-500'} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">{config.module}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {config.keysCount ?? config.keys?.length ?? '?'} keys
                        {config.lastUpdated && ` · Updated ${new Date(config.lastUpdated).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingModule(config.module); }}
                      className="p-2 rounded-lg text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-colors"
                      title="Edit"
                    >
                      <Edit3 size={16} />
                    </button>
                    {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800">
                    {moduleLoading ? (
                      <div className="p-6"><TableSkeleton rows={3} columns={4} /></div>
                    ) : moduleEntries.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                        No entries in this module.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            <tr>
                              <th className="px-6 py-3">Key</th>
                              <th className="px-6 py-3">Value</th>
                              <th className="px-6 py-3">Type</th>
                              <th className="px-6 py-3">Description</th>
                              <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {moduleEntries.map((entry, idx) => (
                              <tr key={entry._id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap font-mono font-bold">{entry.key}</td>
                                <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap font-mono">
                                  {typeof entry.value === 'boolean' ? entry.value.toString() : String(entry.value ?? '')}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    {entry.type || 'string'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-[200px] truncate">{entry.description || '—'}</td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button onClick={() => setEditingModule(config.module)}
                                      className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-colors">
                                      <Edit3 size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteEntry(entry)}
                                      className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors">
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editingModule && (
        <ModuleModal
          moduleName={editingModule}
          entries={moduleEntries}
          onClose={() => setEditingModule(null)}
        />
      )}
    </div>
  );
};

export default DynamicConfigBuilder;
