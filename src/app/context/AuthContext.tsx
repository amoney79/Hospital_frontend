import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { authApi } from '../services/api';

const TRIAL_DAYS = 7;
const SUB_DAYS = 30;
const REMINDER_DAYS = 5;

const DEMO_USERS = [
  { email: 'admin@healthcare-mc.com', password: 'admin123', name: 'Admin User', role: 'Administrator' },
  { email: 'admin@hospital.com', password: 'admin', name: 'Dr. Sarah Jenkins', role: 'Admin' },
  { email: 'doctor@healthcare-mc.com', password: 'doctor123', name: 'Dr. Robert Anderson', role: 'Doctor' },
];

export interface AuthUser {
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  trialStart: string | null;
  paymentDate: string | null;

  trialDaysRemaining: number;
  isTrialExpired: boolean;
  hasValidSubscription: boolean;
  subscriptionDaysRemaining: number;
  isSubscriptionExpired: boolean;
  showRenewalReminder: boolean;

  login(email: string, password: string): Promise<{ ok: boolean; error?: string }>;
  logout(): void;
  activateSubscription(): void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function load<T>(key: string): T | null {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null'); }
  catch { return null; }
}

function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => load('hms_user'));
  const [trialStart, setTrialStart] = useState<string | null>(() => load('hms_trial_start'));
  const [paymentDate, setPaymentDate] = useState<string | null>(() => load('hms_payment_date'));

  // Trial
  const trialDaysSince = trialStart ? daysSince(trialStart) : 0;
  const trialDaysRemaining = TRIAL_DAYS - trialDaysSince;
  const isTrialExpired = trialDaysRemaining <= 0;

  // Subscription
  const subDaysSince = paymentDate ? daysSince(paymentDate) : 0;
  const subscriptionDaysRemaining = SUB_DAYS - subDaysSince;
  const hasValidSubscription = !!paymentDate && subscriptionDaysRemaining > 0;
  const isSubscriptionExpired = !!paymentDate && subscriptionDaysRemaining <= 0;
  const showRenewalReminder = hasValidSubscription && subscriptionDaysRemaining <= REMINDER_DAYS;

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await authApi.login(email, password);
      if (res.success && res.user) {
        const userData: AuthUser = {
          name: res.user.name,
          email: res.user.email,
          role: res.user.role,
        };
        save('hms_user', userData);
        setUser(userData);
        if (!trialStart) {
          const now = new Date().toISOString();
          save('hms_trial_start', now);
          setTrialStart(now);
        }
        return { ok: true };
      }
    } catch (e) {
      console.warn('Backend login fallback to local demo users');
    }

    const found = DEMO_USERS.find((u) => u.email === email && u.password === password);
    if (!found) return { ok: false, error: 'Invalid email or password.' };
    const { password: _pw, ...userData } = found;
    save('hms_user', userData);
    setUser(userData);
    if (!trialStart) {
      const now = new Date().toISOString();
      save('hms_trial_start', now);
      setTrialStart(now);
    }
    return { ok: true };
  }, [trialStart]);

  const logout = useCallback(() => {
    localStorage.removeItem('hms_user');
    setUser(null);
  }, []);

  const activateSubscription = useCallback(() => {
    const now = new Date().toISOString();
    save('hms_payment_date', now);
    setPaymentDate(now);
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    trialStart,
    paymentDate,
    trialDaysRemaining,
    isTrialExpired,
    hasValidSubscription,
    subscriptionDaysRemaining,
    isSubscriptionExpired,
    showRenewalReminder,
    login,
    logout,
    activateSubscription,
  }), [
    user, trialStart, paymentDate,
    trialDaysRemaining, isTrialExpired,
    hasValidSubscription, subscriptionDaysRemaining,
    isSubscriptionExpired, showRenewalReminder,
    login, logout, activateSubscription,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
