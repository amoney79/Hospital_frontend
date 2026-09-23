import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { authApi } from '../services/api';

const TRIAL_DAYS = 7;
const SUB_DAYS = 30;
const REMINDER_DAYS = 5;

const DEMO_USERS = [
  { id: '1', email: 'admin@healthcare-mc.com', password: 'admin123', name: 'Admin User', role: 'Administrator' },
  { id: '2', email: 'doctor@healthcare-mc.com', password: 'doctor123', name: 'Dr. Robert Anderson', role: 'Doctor' },
  { id: '3', email: 'nurse@healthcare-mc.com', password: 'nurse123', name: 'Nurse User', role: 'Nurse' },
  { id: '4', email: 'lab@healthcare-mc.com', password: 'lab123', name: 'Lab Technician', role: 'Lab Tech' },
  { id: '5', email: 'reception@healthcare-mc.com', password: 'reception123', name: 'Reception User', role: 'Receptionist' },
];

export interface AuthUser {
  id?: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface AuthResult {
  ok: boolean;
  requires2FA?: boolean;
  error?: string;
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

  login(email: string, password: string): Promise<AuthResult>;
  verify2FA(email: string, code: string): Promise<AuthResult>;
  logout(): void;
  updateUser(updates: Partial<AuthUser>): void;
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

  const [pendingDemoUser, setPendingDemoUser] = useState<AuthUser | null>(null);

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

  // Finalizes the session state after successful credentials/2FA check
    const completeAuth = useCallback((userData: AuthUser, token?: string) => {
      if (token) save('hms_session_id', token);
      save('hms_user', userData);
      setUser(userData);
      if (!trialStart) {
        const now = new Date().toISOString();
        save('hms_trial_start', now);
        setTrialStart(now);
      }
    }, [trialStart]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await authApi.login(email, password);

      // Handle API response indicating 2FA requirement
        if (res.requires2FA) {
          const found = DEMO_USERS.find((candidate) => candidate.email === email);
          if (found) {
            const { password: _password, ...pendingUser } = found;
            setPendingDemoUser(pendingUser);
          }
        return { ok: true, requires2FA: true };
      }

      if (res.success && res.user) {
        const userData: AuthUser = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          role: res.user.role,
          avatarUrl: res.user.avatarUrl,
        };
        if (res.token) save('hms_session_id', res.token);
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
    const settings = load<{ security?: { twoFactorAuthentication?: boolean } }>('hms_settings');
    if (settings?.security?.twoFactorAuthentication) {
      setPendingDemoUser(userData);
      return { ok: true, requires2FA: true };
    }
    save('hms_session_id', `local-${Date.now()}`);
    save('hms_user', userData);
    setUser(userData);
    if (!trialStart) {
      const now = new Date().toISOString();
      save('hms_trial_start', now);
      setTrialStart(now);
    }
    return { ok: true };
  }, [trialStart]);

  const verify2FA = useCallback(async (email: string, code: string): Promise<AuthResult> => {
    try {
      const res = await authApi.verify2FA(email, code);
      if (res.success && res.user) {
        completeAuth({
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          role: res.user.role,
          avatarUrl: res.user.avatarUrl,
        }, res.token);
        setPendingDemoUser(null);
        return { ok: true };
      }
      if (res.error) return { ok: false, error: res.error };
    } catch {
      console.warn('Backend 2FA unavailable; using demo verification.');
    }

    if (pendingDemoUser?.email !== email) {
      return { ok: false, error: 'Session expired. Please log in again.' };
    }
    if (code !== '123456') {
      return { ok: false, error: 'Invalid verification code. Demo code: 123456' };
    }
    completeAuth(pendingDemoUser, `local-${Date.now()}`);
    setPendingDemoUser(null);
    return { ok: true };
  }, [completeAuth, pendingDemoUser]);

  const logout = useCallback(() => {
    const sessionId = localStorage.getItem('hms_session_id');
    if (sessionId && !sessionId.startsWith('local-')) authApi.logout(sessionId).catch(() => undefined);
    localStorage.removeItem('hms_user');
    localStorage.removeItem('hms_session_id');
    setUser(null);
  }, []);

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser((current) => {
      if (!current) return current;
      const next = { ...current, ...updates };
      save('hms_user', next);
      return next;
    });
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
    verify2FA,
    logout,
    updateUser,
    activateSubscription,
  }), [
    user, trialStart, paymentDate,
    trialDaysRemaining, isTrialExpired,
    hasValidSubscription, subscriptionDaysRemaining,
    isSubscriptionExpired, showRenewalReminder,
    login, verify2FA, logout, updateUser, activateSubscription,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
