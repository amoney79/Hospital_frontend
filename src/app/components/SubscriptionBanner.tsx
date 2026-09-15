import { useState } from 'react';
import { Clock, AlertTriangle, X, CreditCard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { PaymentForm } from './PaymentForm';
import { useAuth } from '../context/AuthContext';

export function SubscriptionBanner() {
  const {
    trialDaysRemaining,
    isTrialExpired,
    hasValidSubscription,
    showRenewalReminder,
    subscriptionDaysRemaining,
  } = useAuth();

  const [dismissed, setDismissed] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Nothing to show
  if (dismissed) return null;
  const showTrialBanner = !isTrialExpired && !hasValidSubscription;
  const showRenewalBanner = showRenewalReminder;
  if (!showTrialBanner && !showRenewalBanner) return null;

  const days = showTrialBanner
    ? Math.max(0, trialDaysRemaining)
    : Math.max(0, subscriptionDaysRemaining);

  const urgent = showRenewalBanner && days <= 2;

  const bgClass = showTrialBanner
    ? 'bg-amber-50 border-amber-200'
    : urgent
    ? 'bg-red-50 border-red-200'
    : 'bg-orange-50 border-orange-200';

  const textClass = showTrialBanner
    ? 'text-amber-800'
    : urgent
    ? 'text-red-800'
    : 'text-orange-800';

  const btnClass = showTrialBanner
    ? 'bg-amber-600 hover:bg-amber-700'
    : urgent
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-orange-600 hover:bg-orange-700';

  const dismissClass = showTrialBanner
    ? 'text-amber-400 hover:text-amber-700'
    : urgent
    ? 'text-red-400 hover:text-red-600'
    : 'text-orange-400 hover:text-orange-600';

  const message = showTrialBanner
    ? <>
        <strong>{days} day{days !== 1 ? 's' : ''}</strong> remaining in your free trial.
        Upgrade to keep uninterrupted access.
      </>
    : <>
        <strong>Action required:</strong> Your subscription expires in{' '}
        <strong>{days} day{days !== 1 ? 's' : ''}</strong>. Renew now to avoid interruption.
      </>;

  const Icon = showTrialBanner ? Clock : AlertTriangle;
  const btnLabel = showTrialBanner ? 'Upgrade Now' : 'Renew Now';
  const dialogTitle = showTrialBanner ? 'Activate Subscription' : 'Renew Subscription';

  return (
    <>
      <div className={`border-b px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 ${bgClass}`}>
        <div className={`flex items-center gap-2 text-sm min-w-0 ${textClass}`}>
          <Icon className="w-4 h-4 shrink-0" />
          <span className="truncate">{message}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button
                className={`flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-full transition-colors ${btnClass}`}
              >
                <CreditCard className="w-3 h-3" />
                {btnLabel}
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{dialogTitle}</DialogTitle>
              </DialogHeader>
              <PaymentForm compact onSuccess={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>

          <button onClick={() => setDismissed(true)} className={`shrink-0 ${dismissClass}`}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
