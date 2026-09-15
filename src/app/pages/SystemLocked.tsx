import { useState } from 'react';
import { Lock, HeartPulse, RefreshCw, LogOut, Mail, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { PaymentForm } from '../components/PaymentForm';
import { useAuth } from '../context/AuthContext';

export default function SystemLocked() {
  const { user, logout } = useAuth();
  const [renewOpen, setRenewOpen] = useState(false);

  return (
    <>
      <div
        className="fixed inset-0 z-[9998] flex flex-col items-center justify-center p-6"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #3b0764 100%)' }}
      >
        {/* Ambient circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute rounded-full opacity-10 w-[500px] h-[500px] -top-32 -left-32"
            style={{ background: 'radial-gradient(circle, #f87171, transparent 70%)' }} />
          <div className="absolute rounded-full opacity-10 w-96 h-96 -bottom-20 -right-20"
            style={{ background: 'radial-gradient(circle, #c084fc, transparent 70%)' }} />
        </div>

        <div className="relative flex flex-col items-center text-center max-w-md w-full">
          {/* Brand */}
          <div className="flex items-center gap-2 mb-10">
            <HeartPulse className="w-5 h-5 text-blue-400" />
            <span className="text-blue-300 font-semibold tracking-wide">HealthCare MS</span>
          </div>

          {/* Lock icon */}
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-7"
          >
            <div className="w-24 h-24 rounded-3xl bg-red-500/15 border border-red-400/25 flex items-center justify-center shadow-2xl">
              <Lock className="w-12 h-12 text-red-400" />
            </div>
          </motion.div>

          <h1 className="text-3xl font-semibold text-white mb-3">Subscription Expired</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-2 max-w-sm">
            Your 30-day subscription period has ended. System access has been suspended
            to protect your data and records.
          </p>

          {user && (
            <p className="text-gray-600 text-xs mb-8">
              Signed in as <span className="text-gray-400 font-medium">{user.email}</span>
              {' '}· <span className="text-gray-500">{user.role}</span>
            </p>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 w-full mb-10">
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white h-11"
              onClick={() => setRenewOpen(true)}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Renew Subscription
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white h-11"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Support */}
          <div className="border border-white/5 rounded-xl p-4 w-full text-left">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Need help?</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Mail className="w-4 h-4 shrink-0 text-gray-600" />
                admin@healthcare-mc.com
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Phone className="w-4 h-4 shrink-0 text-gray-600" />
                +1 (800) 555-0100
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Renewal dialog */}
      <Dialog open={renewOpen} onOpenChange={setRenewOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Renew Subscription</DialogTitle>
          </DialogHeader>
          <PaymentForm compact onSuccess={() => setRenewOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
