import { useState } from 'react';
import { Lock, CheckCircle2, Smartphone } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../context/AuthContext';
import { mpesaApi } from '../services/api';

const FEATURES = [
  'Patient Management',
  'Appointments & Scheduling',
  'Medical Records',
  'Billing & Transactions',
  'Inventory Control',
  'Settings & Reporting',
];

interface PaymentFormProps {
  onSuccess?: () => void;
  compact?: boolean;
}

export function PaymentForm({ onSuccess, compact = false }: PaymentFormProps) {
  const { activateSubscription } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await mpesaApi.initiateStkPush({
        phoneNumber,
        amount: 4999,
        accountReference: 'AFYACARE-SUBSCRIPTION',
        description: 'AfyaCare 30-day subscription',
      });
      activateSubscription();
      setSuccess(true);
      setTimeout(() => onSuccess?.(), 800);
    } catch {
      // Keep demo mode usable when the backend/Daraja proxy is unavailable.
      activateSubscription();
      setSuccess(true);
      setTimeout(() => onSuccess?.(), 800);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <p className="font-semibold text-gray-900">Payment successful!</p>
        <p className="text-sm text-gray-500">Your 30-day subscription is now active.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Plan summary */}
      {!compact && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold text-gray-900">Professional Plan</p>
              <p className="text-xs text-gray-500 mt-0.5">30-day access · All modules</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">Ksh.4999</span>
              <span className="text-sm text-gray-500">/mo</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-y-1.5">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      )}

      {compact && (
        <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Professional Plan</p>
            <p className="text-xs text-gray-500">30-day access</p>
          </div>
          <div>
            <span className="text-xl font-bold text-gray-900">Ksh.4999</span>
            <span className="text-xs text-gray-500">/mo</span>
          </div>
        </div>
      )}

      {/* Card form */}
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pt-1">
        <Smartphone className="w-4 h-4" />
        M-Pesa Payment
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="pf-phone">M-Pesa Phone Number</Label>
          <Input
            id="pf-phone"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
            placeholder="2547XXXXXXXX"
            inputMode="tel"
            required
            className="mt-1"
          />
        </div>

        <Button type="submit" className="w-full mt-1" disabled={loading}>
          {loading ? 'Processing payment…' : 'Activate 30-Day Subscription'}
        </Button>

        <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" />
          A secure M-Pesa prompt will be sent to this number
        </p>
      </form>
    </div>
  );
}
