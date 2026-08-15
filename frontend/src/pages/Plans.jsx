import React from 'react';
import { useGetSaaSPlansQuery } from '../store/adminApiSlice';
import { CheckCircle2, Zap } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';

const Plans = () => {
  const { data, isLoading } = useGetSaaSPlansQuery();
  const plans = data?.data || [];

  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[1,2,3].map(i => <Skeleton key={i} className="h-64 w-full" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Upgrade Your Institution
        </h1>
        <p className="text-gray-500">
          Select a plan that fits your school's needs. Enjoy premium features, extended storage, and enterprise support.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div key={plan._id} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm flex flex-col relative overflow-hidden group hover:shadow-xl transition-shadow">
            {plan.name.toLowerCase() === 'enterprise' && (
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            )}
            
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                {plan.name}
                {plan.name.toLowerCase() === 'enterprise' && <Zap size={18} className="text-purple-500" />}
              </h3>
              <p className="text-sm text-gray-500 min-h-[40px]">{plan.description || `The perfect plan for ${plan.name} needs.`}</p>
            </div>
            
            <div className="mb-8">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">${plan.price}</span>
              <span className="text-gray-500">/mo</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                <span>Up to <b>{plan.maxStudents}</b> students</span>
              </li>
              {plan.features?.map((feature, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <button className={`w-full py-3 px-4 rounded-xl font-bold transition-colors ${
              plan.name.toLowerCase() === 'enterprise' 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-gray-50 text-gray-900 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
            }`}>
              Select {plan.name}
            </button>
          </div>
        ))}
        {plans.length === 0 && (
          <div className="col-span-3 text-center py-10 text-gray-500">
            No plans configured in the system.
          </div>
        )}
      </div>
    </div>
  );
};

export default Plans;
