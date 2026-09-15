import { HeartPulse, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { PaymentForm } from '../components/PaymentForm';
import { useAuth } from '../context/AuthContext';

export default function Payment() {
  const { logout } = useAuth();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f4fd 100%)' }}
    >
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <HeartPulse className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-semibold text-blue-700">HealthCare MS</span>
          </div>

          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-full text-sm font-medium mb-5">
            <AlertTriangle className="w-4 h-4" />
            Your 7-day free trial has ended
          </div>

          <h1 className="text-2xl font-semibold text-gray-900">Subscribe to continue</h1>
          <p className="text-gray-500 text-sm mt-2">
            Activate your subscription to restore full access to all modules.
          </p>
        </div>

        {/* Payment card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <PaymentForm />
        </div>

        <div className="text-center mt-5">
          <Button variant="ghost" size="sm" onClick={logout} className="text-gray-400 hover:text-gray-600">
            Sign out instead
          </Button>
        </div>
      </div>
    </div>
  );
}
