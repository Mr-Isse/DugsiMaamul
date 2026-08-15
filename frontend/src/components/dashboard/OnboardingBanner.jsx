import React, { useState, useCallback } from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';

const OnboardingBanner = ({ onNavigate }) => {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('onboardingBannerDismissed') === 'true'
  );

  const dismiss = useCallback(() => {
    setDismissed(true);
    localStorage.setItem('onboardingBannerDismissed', 'true');
  }, []);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="flex items-center justify-between gap-4 p-5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl text-white shadow-primary-glow">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-extrabold tracking-tight">Complete your setup</p>
                <p className="text-sm text-indigo-100 truncate mt-0.5">Run through the onboarding wizard to set up your system.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={() => onNavigate('/onboarding')}
                className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-sm"
                size="sm"
              >
                Start <ArrowRight size={14} className="ml-0.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={dismiss}
                className="text-white/70 hover:text-white hover:bg-white/10 h-9 w-9"
                aria-label="Dismiss onboarding banner"
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(OnboardingBanner);
