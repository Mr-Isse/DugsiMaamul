import { Link } from 'react-router-dom';
import { useGetParentChildrenQuery } from '../../store/parentApiSlice';
import { Skeleton } from "../../components/ui/skeleton";
import { Users, User, GraduationCap, CalendarCheck, ChevronRight, AlertCircle } from 'lucide-react';

const ParentDashboard = () => {
  const { data, isLoading, error } = useGetParentChildrenQuery();
  const children = data?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl bg-slate-900/50 border border-white/5 p-6 space-y-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-32" />
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
        <h3 className="text-white font-bold text-lg mb-2">Failed to load children</h3>
        <p className="text-slate-400 text-sm max-w-sm">Something went wrong while fetching your children. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Children</h1>
        <p className="text-slate-400 text-sm mt-1">View and manage your children's academic information</p>
      </div>

      {children.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">No children linked</h3>
          <p className="text-slate-400 text-sm max-w-sm">Your account has no children linked yet. Please contact your school administrator.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <Link
              key={child._id}
              to={`/parent/child/${child._id}`}
              className="group rounded-2xl bg-slate-900/50 border border-white/5 hover:border-emerald-500/30 p-6 transition-all hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                  {child.profileImage ? (
                    <img src={child.profileImage} alt={child.name} className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-emerald-400" />
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
              </div>

              <h3 className="text-white font-bold text-lg mb-1 group-hover:text-emerald-400 transition-colors">{child.name}</h3>
              <p className="text-slate-500 text-sm mb-4">{child.customId || 'No ID'}</p>

              <div className="space-y-2">
                {child.class && (
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>{child.class.name}{child.class.section ? ` — ${child.class.section}` : ''}</span>
                  </div>
                )}
                {child.gender && (
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span className="capitalize">{child.gender}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                  child.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
                }`}>
                  {child.status || 'Active'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
