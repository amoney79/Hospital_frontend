import { useEffect, useState } from 'react';
import { HeartPulse, MousePointer2 } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { motion } from 'motion/react';
import { useHospitalSettings } from '../context/HospitalSettingsContext';

function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const [hm, period] = time.split(' ');
  const date = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="text-center mb-10">
      <div className="flex items-end justify-center gap-2">
        <span className="text-7xl font-thin text-white tracking-tight tabular-nums">{hm}</span>
        <span className="text-2xl font-light text-blue-200 mb-3">{period}</span>
      </div>
      <p className="text-blue-200 text-base font-light tracking-wide mt-1">{date}</p>
    </div>
  );
}

interface IdleSplashScreenProps {
  visible: boolean;
  onDismiss: () => void;
}

export function IdleSplashScreen({ visible, onDismiss }: IdleSplashScreenProps) {
  const { settings } = useHospitalSettings();
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') onDismiss();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="idle-splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center cursor-pointer select-none"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #1e3a8a 70%, #312e81 100%)',
          }}
          onClick={onDismiss}
        >
          {/* Ambient circles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute rounded-full opacity-10"
              style={{
                width: 600,
                height: 600,
                top: '-15%',
                left: '-10%',
                background: 'radial-gradient(circle, #60a5fa, transparent 70%)',
              }}
            />
            <div
              className="absolute rounded-full opacity-10"
              style={{
                width: 500,
                height: 500,
                bottom: '-10%',
                right: '-8%',
                background: 'radial-gradient(circle, #818cf8, transparent 70%)',
              }}
            />
            <div
              className="absolute rounded-full opacity-5"
              style={{
                width: 300,
                height: 300,
                top: '30%',
                right: '15%',
                background: 'radial-gradient(circle, #38bdf8, transparent 70%)',
              }}
            />
          </div>

          <div className="relative flex flex-col items-center">
            {/* Clock */}
            <LiveClock />

            {/* Divider */}
            <div className="w-24 h-px bg-blue-500/40 mb-10" />

            {/* Logo */}
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-5"
            >
              <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl">
                <HeartPulse className="w-12 h-12 text-blue-300" />
              </div>
            </motion.div>

            {/* System name */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-2"
            >
              <h1 className="text-3xl font-semibold text-white tracking-wide">{settings.hospitalName}</h1>
              <p className="text-blue-200/70 text-sm mt-1 font-light tracking-widest uppercase">
                Medical Management System
              </p>
            </motion.div>

            {/* Inactivity notice */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-10 flex flex-col items-center gap-3"
            >
              <p className="text-blue-300/60 text-xs uppercase tracking-widest font-light">
                Session paused · Inactivity detected
              </p>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="flex items-center gap-2 text-blue-200/80 text-sm"
              >
                <MousePointer2 className="w-4 h-4" />
                <span>Click anywhere or press any key to resume</span>
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom hospital name */}
          <div className="absolute bottom-8 text-center">
            <p className="text-blue-400/40 text-xs tracking-widest uppercase">
              {settings.hospitalName} · {settings.address}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
