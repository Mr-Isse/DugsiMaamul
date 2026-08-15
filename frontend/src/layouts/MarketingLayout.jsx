import { Outlet } from 'react-router-dom';
import MarketingNavbar from '../components/marketing/MarketingNavbar';
import MarketingFooter from '../components/marketing/MarketingFooter';

const MarketingLayout = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-200 font-sans">
    <MarketingNavbar />
    <main className="pt-16 lg:pt-20">
      <Outlet />
    </main>
    <MarketingFooter />
  </div>
);

export default MarketingLayout;
