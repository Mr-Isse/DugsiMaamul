import React from 'react';

const TermsOfService = () => {
  return (
    <div className="bg-white dark:bg-slate-950 py-24 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-12 tracking-tight uppercase">Terms of Service</h1>
        
        <div className="prose prose-indigo max-w-none text-gray-600 dark:text-slate-400 space-y-12">
          <section>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">1. Acceptance of Terms</h2>
            <p className="text-lg leading-relaxed font-medium">
              By accessing or using the DugsiKabe platform, you agree to be bound by these Terms of Service. 
              If you do not agree to all of these terms, you may not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">2. Subscription Services</h2>
            <p className="text-lg leading-relaxed font-medium">
              Schools subscribe to our services on a monthly or annual basis. Subscriptions automatically 
              renew unless cancelled by the school administrator.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">3. User Responsibilities</h2>
            <p className="text-lg leading-relaxed font-medium">
              School administrators are responsible for the accuracy of the data they upload and for 
              managing the access levels of their staff, students, and parents.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">4. Prohibited Uses</h2>
            <p className="text-lg leading-relaxed font-medium">You may not use the platform to:</p>
            <ul className="list-disc pl-8 space-y-3 text-lg font-medium">
              <li>Violate any local or international laws</li>
              <li>Upload malicious code or viruses</li>
              <li>Attempt to gain unauthorized access to other tenants' data</li>
              <li>Interfere with the platform's operation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">5. Limitation of Liability</h2>
            <p className="text-lg leading-relaxed font-medium">
              DugsiKabe shall not be liable for any indirect, incidental, special, or consequential 
              damages resulting from the use or inability to use our services.
            </p>
          </section>

          <div className="pt-12 border-t border-gray-100 dark:border-white/5 text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
            Last updated: June 7, 2026
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
