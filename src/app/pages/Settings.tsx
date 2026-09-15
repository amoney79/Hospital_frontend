import { useState } from 'react';
import {
  Building2,
  User,
  Bell,
  Shield,
  Save,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';

function SavedBanner() {
  return (
    <div className="flex items-center gap-2 text-green-600 text-sm font-medium animate-in fade-in">
      <Check className="w-4 h-4" />
      Changes saved
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-800">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/* ── General / Hospital Profile ── */
function GeneralSettings() {
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SectionCard title="Hospital Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="hospitalName">Hospital Name</Label>
            <Input id="hospitalName" defaultValue="HealthCare Medical Center" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="regNumber">Registration Number</Label>
            <Input id="regNumber" defaultValue="HMC-2010-00842" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="taxId">Tax ID</Label>
            <Input id="taxId" defaultValue="47-2930011" className="mt-1" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" defaultValue="500 Medical Drive, New York, NY 10001" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" defaultValue="+1 (800) 555-0100" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="admin@healthcare-mc.com" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input id="website" defaultValue="www.healthcare-mc.com" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select defaultValue="america-new_york">
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="america-new_york">America / New York (EST)</SelectItem>
                <SelectItem value="america-chicago">America / Chicago (CST)</SelectItem>
                <SelectItem value="america-los_angeles">America / Los Angeles (PST)</SelectItem>
                <SelectItem value="europe-london">Europe / London (GMT)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              defaultValue="A leading multi-specialty medical center providing compassionate, high-quality healthcare to the community since 2010."
              className="mt-1"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Operating Hours">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { day: 'Monday – Friday', open: '08:00', close: '20:00' },
            { day: 'Saturday', open: '09:00', close: '17:00' },
            { day: 'Sunday', open: '10:00', close: '14:00' },
          ].map(({ day, open, close }) => (
            <div key={day} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-36 shrink-0">{day}</span>
              <Input type="time" defaultValue={open} className="w-28" />
              <span className="text-gray-400 text-sm">to</span>
              <Input type="time" defaultValue={close} className="w-28" />
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="flex items-center justify-between">
        {saved ? <SavedBanner /> : <span />}
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </form>
  );
}

/* ── Account ── */
function AccountSettings() {
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SectionCard title="Profile">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Admin User</p>
            <p className="text-sm text-gray-500">System Administrator</p>
            <Button variant="outline" size="sm" className="mt-2">
              Change Photo
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" defaultValue="Admin" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" defaultValue="User" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="accountEmail">Email Address</Label>
            <Input id="accountEmail" type="email" defaultValue="admin@healthcare-mc.com" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select defaultValue="administrator">
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="administrator">Administrator</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="nurse">Nurse</SelectItem>
                <SelectItem value="receptionist">Receptionist</SelectItem>
                <SelectItem value="billing">Billing Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="department">Department</Label>
            <Input id="department" defaultValue="Administration" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input id="employeeId" defaultValue="EMP-0001" className="mt-1" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Preferences">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Language</Label>
            <Select defaultValue="en">
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Date Format</Label>
            <Select defaultValue="yyyy-mm-dd">
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SectionCard>

      <div className="flex items-center justify-between">
        {saved ? <SavedBanner /> : <span />}
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </form>
  );
}

/* ── Notifications ── */
interface NotifRow {
  id: string;
  label: string;
  description: string;
  email: boolean;
  sms: boolean;
  inApp: boolean;
}

const defaultNotifications: NotifRow[] = [
  {
    id: 'new-appointment',
    label: 'New Appointment',
    description: 'When a new appointment is booked',
    email: true,
    sms: false,
    inApp: true,
  },
  {
    id: 'appointment-reminder',
    label: 'Appointment Reminder',
    description: '24 hours before a scheduled appointment',
    email: true,
    sms: true,
    inApp: true,
  },
  {
    id: 'low-stock',
    label: 'Low Stock Alert',
    description: 'When inventory falls below minimum level',
    email: true,
    sms: false,
    inApp: true,
  },
  {
    id: 'payment-received',
    label: 'Payment Received',
    description: 'When a patient completes a payment',
    email: false,
    sms: false,
    inApp: true,
  },
  {
    id: 'overdue-invoice',
    label: 'Overdue Invoice',
    description: 'When an invoice passes its due date',
    email: true,
    sms: false,
    inApp: true,
  },
  {
    id: 'new-patient',
    label: 'New Patient Registered',
    description: 'When a new patient record is created',
    email: false,
    sms: false,
    inApp: true,
  },
];

function NotificationSettings() {
  const [rows, setRows] = useState<NotifRow[]>(defaultNotifications);
  const [saved, setSaved] = useState(false);

  const toggle = (id: string, channel: 'email' | 'sms' | 'inApp') => {
    setRows(rows.map((r) => (r.id === id ? { ...r, [channel]: !r[channel] } : r)));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left font-medium text-gray-700 w-64">Event</th>
                  <th className="px-6 py-4 text-center font-medium text-gray-700">Email</th>
                  <th className="px-6 py-4 text-center font-medium text-gray-700">SMS</th>
                  <th className="px-6 py-4 text-center font-medium text-gray-700">In-App</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{row.label}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{row.description}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Switch
                        checked={row.email}
                        onCheckedChange={() => toggle(row.id, 'email')}
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Switch
                        checked={row.sms}
                        onCheckedChange={() => toggle(row.id, 'sms')}
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Switch
                        checked={row.inApp}
                        onCheckedChange={() => toggle(row.id, 'inApp')}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        {saved ? <SavedBanner /> : <span />}
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Preferences
        </Button>
      </div>
    </div>
  );
}

/* ── Security ── */
function SecuritySettings() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Change Password">
        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          {[
            { id: 'currentPw', label: 'Current Password', show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
            { id: 'newPw', label: 'New Password', show: showNew, toggle: () => setShowNew(!showNew) },
            { id: 'confirmPw', label: 'Confirm New Password', show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
          ].map(({ id, label, show, toggle }) => (
            <div key={id}>
              <Label htmlFor={id}>{label}</Label>
              <div className="relative mt-1">
                <Input
                  id={id}
                  type={show ? 'text' : 'password'}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={toggle}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between pt-1">
            {saved ? <SavedBanner /> : <span />}
            <Button type="submit">Update Password</Button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Session & Access">
        <div className="space-y-5">
          {[
            {
              label: 'Auto-logout after inactivity',
              description: 'Automatically sign out after 30 minutes of inactivity',
              defaultChecked: true,
            },
            {
              label: 'Two-factor authentication',
              description: 'Require a verification code in addition to your password',
              defaultChecked: false,
            },
            {
              label: 'Login activity alerts',
              description: 'Send an email whenever your account is accessed from a new device',
              defaultChecked: true,
            },
          ].map(({ label, description, defaultChecked }) => {
            const [on, setOn] = useState(defaultChecked);
            return (
              <div key={label} className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                </div>
                <Switch checked={on} onCheckedChange={setOn} />
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Active Sessions">
        <div className="space-y-3">
          {[
            { device: 'Chrome on Windows 11', location: 'New York, NY', time: 'Current session', current: true },
            { device: 'Safari on iPhone 15', location: 'New York, NY', time: '2 hours ago', current: false },
          ].map(({ device, location, time, current }) => (
            <div key={device} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  {device}
                  {current && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
                      Active
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {location} · {time}
                </p>
              </div>
              {!current && (
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

/* ── Root ── */
export default function Settings() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage system configuration and preferences</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>
        <TabsContent value="account">
          <AccountSettings />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>
        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
