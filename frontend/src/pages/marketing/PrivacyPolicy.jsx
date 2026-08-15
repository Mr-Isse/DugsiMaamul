import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="bg-white dark:bg-slate-950 py-24 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-12 tracking-tight uppercase">Privacy Policy</h1>
        
        <div className="prose prose-indigo max-w-none text-gray-600 dark:text-slate-400 space-y-12">
          <section>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">1. Introduction</h2>
            <p className="text-lg leading-relaxed font-medium">
              DugsiKabe ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our 
              school management platform and website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">2. Information We Collect</h2>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">2.1 School Data</h3>
            <p className="text-lg leading-relaxed font-medium">
              We collect information about schools that register on our platform, including school name, 
              address, contact information, and administrative details.
            </p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight mt-6">2.2 User Data</h3>
            <p className="text-lg leading-relaxed font-medium">
              We collect information about teachers, students, and parents as provided by the school 
              administrators. This includes names, IDs, grades, and academic records.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">3. How We Use Your Information</h2>
            <p className="text-lg leading-relaxed font-medium">We use the collected information to:</p>
            <ul className="list-disc pl-8 space-y-3 text-lg font-medium">
              <li>Provide and maintain the platform</li>
              <li>Process subscriptions and billing</li>
              <li>Send system notifications and updates</li>
              <li>Improve our features and services</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">4. Data Security</h2>
            <p className="text-lg leading-relaxed font-medium">
              We implement industry-standard security measures to protect your data. However, no method 
              of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">5. Contact Us</h2>
            <p className="text-lg leading-relaxed font-medium">
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              <strong className="text-indigo-600 dark:text-cyan-400">Email:</strong> privacy@dugsihub.com
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

export default PrivacyPolicy;
