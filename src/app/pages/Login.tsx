import { useState } from 'react';
import { HeartPulse, Eye, EyeOff, CheckCircle2, Stethoscope } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { useHospitalSettings } from '../context/HospitalSettingsContext';

const FEATURES = [
  'Complete patient lifecycle management',
  'Real-time inventory & billing tracking',
  'Secure medical records & appointments',
  
];

export default function Login() {
  const { login } = useAuth();
  const { settings } = useHospitalSettings();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetMessage, setShowResetMessage] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setError('');
    setLoading(true);
    try {
      const result = await login(f.get('email') as string, f.get('password') as string);
      if (!result.ok) setError(result.error ?? 'Login failed.');
    } catch {
      setError('An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left branding panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[55%] p-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(140deg, #0f172a 0%, #1e3a5f 45%, #1e40af 100%)' }}
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-96 h-96 rounded-full opacity-10 -top-24 -left-24"
            style={{ background: 'radial-gradient(circle, #60a5fa, transparent 70%)' }} />
          <div className="absolute w-72 h-72 rounded-full opacity-10 bottom-10 right-0"
            style={{ background: 'radial-gradient(circle, #818cf8, transparent 70%)' }} />
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 relative">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
            <HeartPulse className="w-6 h-6 text-blue-300" />
          </div>
          <span className="text-white text-xl font-semibold tracking-wide">AfyaCare MS</span>
        </div>

        {/* Hero copy */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/20 text-blue-300 text-xs px-3 py-1.5 rounded-full mb-6">
            <Stethoscope className="w-3.5 h-3.5" />
            AfyaCare Management System
          </div>
          <h1 className="text-5xl font-light text-white leading-tight mb-6">
            Modern Afyacare<br />
            <span className="font-semibold text-blue-300">management</span><br />
            starts here.
          </h1>
          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-blue-100/80 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-400/40 text-xs relative">
          © {new Date().getFullYear()} {settings.hospitalName} · All rights reserved
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <HeartPulse className="w-7 h-7 text-blue-600" />
            <span className="text-xl font-semibold text-blue-600">AfyaCare MS</span>
          </div>

          {/* Free trial notice */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 mb-8">
            <div className="flex items-start gap-3">
              
              <div>
                <p className="text-sm font-semibold text-blue-900">7-Day Free Trial Included</p>
                <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
                  New accounts get full access to every module — no credit card required to start.
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-7">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@healthcare-mc.com"
                autoComplete="email"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          {/* Forgot password button */}
          <div>
            <Button type="button" variant="link" className="mt-4 text-sm text-gray-500 hover:text-gray-700" 
            onClick={() => setShowResetMessage(!showResetMessage)}>
              <span className="text-sm text-gray-500 hover:text-gray-700">
                Forgot your password?
              </span>
            </Button>
              {showResetMessage && (
                <p className="mt-2 text-sm text-amber-600">
                Please contact the System Administrator to reset your password.
                </p>
                )}
          </div>
        </div>
      </div>
    </div>
  );
}