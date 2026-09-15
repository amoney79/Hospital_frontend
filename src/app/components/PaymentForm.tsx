import { useState } from 'react';
import { Lock, CheckCircle2, CreditCard } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../context/AuthContext';

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
  const [cardNum, setCardNum] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const formatCard = (val: string) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      activateSubscription();
      setSuccess(true);
      setLoading(false);
      setTimeout(() => onSuccess?.(), 800);
    }, 1500);
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
              <span className="text-2xl font-bold text-gray-900">$299</span>
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
            <span className="text-xl font-bold text-gray-900">$299</span>
            <span className="text-xs text-gray-500">/mo</span>
          </div>
        </div>
      )}

      {/* Card form */}
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 pt-1">
        <CreditCard className="w-4 h-4" />
        Payment Details
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="pf-name">Cardholder Name</Label>
          <Input id="pf-name" name="cardName" placeholder="John Smith" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="pf-num">Card Number</Label>
          <Input
            id="pf-num"
            value={cardNum}
            onChange={(e) => setCardNum(formatCard(e.target.value))}
            placeholder="1234 5678 9012 3456"
            required
            className="mt-1 font-mono tracking-wider"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="pf-exp">Expiry</Label>
            <Input id="pf-exp" name="expiry" placeholder="MM/YY" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="pf-cvv">CVV</Label>
            <Input id="pf-cvv" name="cvv" placeholder="•••" maxLength={4} required className="mt-1" />
          </div>
        </div>

        <Button type="submit" className="w-full mt-1" disabled={loading}>
          {loading ? 'Processing payment…' : 'Activate 30-Day Subscription'}
        </Button>

        <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" />
          Demo mode · No real charges apply
        </p>
      </form>
    </div>
  );
}
