import { useGetParentAnnouncementsQuery } from '../../store/parentApiSlice';
import { Skeleton } from "../../components/ui/skeleton";
import { Megaphone, AlertCircle, Calendar, Tag } from 'lucide-react';

const audienceColors = {
  all: 'bg-blue-500/10 text-blue-400',
  parents: 'bg-emerald-500/10 text-emerald-400',
  class: 'bg-purple-500/10 text-purple-400',
  teachers: 'bg-amber-500/10 text-amber-400',
  students: 'bg-cyan-500/10 text-cyan-400',
};

const ParentAnnouncements = () => {
  const { data, isLoading, error } = useGetParentAnnouncementsQuery();
  const announcements = data?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-slate-900/50 border border-white/5 p-6 space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-white font-bold text-lg mb-2">Failed to load announcements</h3>
        <p className="text-slate-400 text-sm max-w-sm">Something went wrong. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Announcements</h1>
        <p className="text-slate-400 text-sm mt-1">School-wide updates and notices</p>
      </div>

      {announcements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
            <Megaphone className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">No announcements</h3>
          <p className="text-slate-400 text-sm max-w-sm">There are no announcements at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div key={a._id} className="rounded-2xl bg-slate-900/50 border border-white/5 p-6 hover:border-white/10 transition-all">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-white font-bold">{a.title}</h3>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg capitalize ${audienceColors[a.audience] || 'bg-slate-500/10 text-slate-400'}`}>
                  {a.audience}
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">{a.message || a.content}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(a.createdAt).toLocaleDateString()}
                </div>
                {a.priority && (
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span className="capitalize">{a.priority}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParentAnnouncements;
