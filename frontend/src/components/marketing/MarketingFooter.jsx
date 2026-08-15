import { Link } from 'react-router-dom';
import { Globe, ShieldCheck, Zap, Mail, Phone } from 'lucide-react';

const MarketingFooter = () => (
  <footer className="border-t border-gray-100 dark:border-white/5 bg-white dark:bg-slate-950 py-24 relative overflow-hidden transition-colors duration-200">
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] -z-10" />
    
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-6 gap-16">
        <div className="md:col-span-3">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-2xl text-gray-900 dark:text-white tracking-tighter uppercase">
              Dugsi<span className="text-indigo-600 dark:text-indigo-400">maamul</span>
            </span>
          </div>
          <p className="text-gray-600 dark:text-slate-400 max-w-sm text-base leading-relaxed mb-6 font-medium">
            Nidaamka maareynta dugsiga ee casriga ah. Hal platform oo dhamaystiran 
            oo loogu talagalay hay'adaha waxbarashada.
          </p>
          <div className="flex flex-col gap-3 mb-8">
            <a href="mailto:support@dugsimaamul.com" className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <Mail className="w-4 h-4" />
              support@dugsimaamul.com
            </a>
            <a href="tel:+252615000000" className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <Phone className="w-4 h-4" />
              +252 61 500 0000
            </a>
          </div>
          <div className="flex gap-4">
             {[Globe, ShieldCheck, Zap].map((Icon, i) => (
               <div key={i} className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:text-indigo-600 dark:hover:text-cyan-400 hover:border-indigo-200 dark:hover:border-cyan-500/30 transition-all cursor-pointer">
                  <Icon className="w-5 h-5" />
               </div>
             ))}
          </div>
        </div>

        <div className="md:col-span-1">
          <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6">Nidaamka</h4>
          <ul className="space-y-4 text-sm font-bold text-gray-500 dark:text-slate-500 uppercase tracking-tighter">
            <li><Link to="/platform" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">Platform</Link></li>
            <li><Link to="/pricing" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">Qiimaha</Link></li>
            <li><Link to="/login" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">Gal Platform</Link></li>
            <li><Link to="/about" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">Naga Warran</Link></li>
            <li><Link to="/faq" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">Su'aalaha</Link></li>
          </ul>
        </div>

        <div className="md:col-span-1">
          <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6">Caawimaad</h4>
          <ul className="space-y-4 text-sm font-bold text-gray-500 dark:text-slate-500 uppercase tracking-tighter">
            <li><Link to="/contact" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">Xiriir</Link></li>
            <li><Link to="/docs" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">Dukumiinti</Link></li>
            <li><Link to="/status" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">Xaalada Nidaamka</Link></li>
          </ul>
        </div>

        <div className="md:col-span-1">
          <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6">Shirkadda</h4>
          <ul className="space-y-4 text-sm font-bold text-gray-500 dark:text-slate-500 uppercase tracking-tighter">
            <li><Link to="/admin/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Super Admin</Link></li>
            <li><Link to="/privacy" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">Xeerka Sirta</Link></li>
            <li><Link to="/terms" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">Shuruudaha</Link></li>
            <li><Link to="/contact" className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">Taageero</Link></li>
          </ul>
        </div>
      </div>

      <div className="mt-24 pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-gray-500 dark:text-slate-600 text-xs font-black uppercase tracking-widest">
          © {new Date().getFullYear()} Dugsimaamul. Dhammaan xuquuqaha way dhowrsanyihiin.
        </p>
        <div className="flex gap-8 text-[10px] font-black text-gray-500 dark:text-slate-600 uppercase tracking-widest">
           <Link to="/privacy" className="hover:text-indigo-600 dark:hover:text-slate-400 cursor-pointer transition-colors">Xeerka Sirta</Link>
           <Link to="/terms" className="hover:text-indigo-600 dark:hover:text-slate-400 cursor-pointer transition-colors">Shuruudaha</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default MarketingFooter;
