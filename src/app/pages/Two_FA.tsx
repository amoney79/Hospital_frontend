import { useState } from 'react';
import { HeartPulse, Eye, EyeOff, CheckCircle2, Stethoscope, ShieldCheck, ArrowLeft } from 'lucide-react';
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
  const { login, verify2FA } = useAuth(); // Ensure verify2FA exists in AuthContext
  const { settings } = useHospitalSettings();

  // State management
  const [step, setStep] = useState<'login' | '2fa'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Primary Login Submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.requires2FA) {
        // Transition to 2FA Step
        setStep('2fa');
      } else if (!result.ok) {
        setError(result.error ?? 'Login failed.');
      }
    } catch {
      setError('An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: 2FA Verification Submission
  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await verify2FA(email, twoFactorCode);
      if (!result.ok) {
        setError(result.error ?? 'Invalid verification code.');
      }
    } catch {
      setError('An error occurred during 2FA verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-slate-900 text-white relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2 bg-blue-600 rounded-xl">
            <HeartPulse className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">AfyaCare MS</span>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 my-auto max-w-md">
          <div className="flex items-center gap-2 text-blue-400 font-medium text-sm mb-4">
            <Stethoscope className="w-4 h-4" />
            <span>AfyaCare Management System</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Modern Afyacare management starts here.
          </h1>
          <ul className="space-y-3 mt-8">
            {FEATURES.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-slate-500 text-xs relative z-10">
          © {new Date().getFullYear()} {settings?.hospitalName || 'AfyaCare'} · All rights reserved
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-6">
          
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg">
              {error}
            </div>
          )}

          {step === 'login' ? (
            /* ── Step 1: Login Form ── */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Welcome back
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Enter your credentials to access your account
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="doctor@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>
            </form>
          ) : (
            /* ── Step 2: 2FA Verification Form ── */
            <form onSubmit={handle2FASubmit} className="space-y-4">
              <button
                type="button"
                onClick={() => setStep('login')}
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white mb-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </button>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-lg">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Two-Factor Authentication
                  </h2>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Enter the 6-digit authentication code sent to your device or authenticator app.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="twoFactorCode">Verification Code</Label>
                <Input
                  id="twoFactorCode"
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  className="tracking-widest text-center text-lg font-mono"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}