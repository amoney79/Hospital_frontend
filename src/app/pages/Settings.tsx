import { useEffect, useState } from 'react';
import {
  Building2,
  User,
  Bell,
  Shield,
  Save,
  Eye,
  EyeOff,
  Check,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { useHospitalSettings } from '../context/HospitalSettingsContext';
import { HospitalSettings, SystemUser, usersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { normalizeRole } from '../roleAccess';

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
  const { settings, loading, saveSettings } = useHospitalSettings();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState<HospitalSettings>(settings);

  useEffect(() => setForm(settings), [settings]);

  const update = (key: keyof HospitalSettings, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SectionCard title="Hospital Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="hospitalName">Hospital Name</Label>
            <Input id="hospitalName" value={form.hospitalName} onChange={(e) => update('hospitalName', e.target.value)} className="mt-1" required />
          </div>
          <div>
            <Label htmlFor="regNumber">Registration Number</Label>
            <Input id="regNumber" value={form.registrationNumber} onChange={(e) => update('registrationNumber', e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="taxId">Tax ID</Label>
            <Input id="taxId" value={form.taxId} onChange={(e) => update('taxId', e.target.value)} className="mt-1" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={form.address} onChange={(e) => update('address', e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input id="website" value={form.website} onChange={(e) => update('website', e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={form.timezone} onValueChange={(value) => update('timezone', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="africa-nairobi">Africa / Nairobi (EAT)</SelectItem>
                <SelectItem value="europe-london">Europe / London (GMT)</SelectItem>
                <SelectItem value="asia-singapore">Asia / Singapore (SGT)</SelectItem>
                <SelectItem value="america-chicago">America / Chicago (CST)</SelectItem>
                <SelectItem value="america-los_angeles">America / Los Angeles (PST)</SelectItem>
                <SelectItem value="australia-sydney">Australia / Sydney (AEST)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Operating Hours">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {form.operatingHours.map(({ day, open, close }, index) => (
            <div key={day} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-36 shrink-0">{day}</span>
              <Input type="time" value={open} onChange={(e) => setForm((current) => ({ ...current, operatingHours: current.operatingHours.map((hours, i) => i === index ? { ...hours, open: e.target.value } : hours) }))} className="w-28" />
              <span className="text-gray-400 text-sm">to</span>
              <Input type="time" value={close} onChange={(e) => setForm((current) => ({ ...current, operatingHours: current.operatingHours.map((hours, i) => i === index ? { ...hours, close: e.target.value } : hours) }))} className="w-28" />
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="flex items-center justify-between">
        {saved ? <SavedBanner /> : <span />}
        <Button type="submit" disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </form>
  );
}

/* ── Account ── */
function AccountSettings() {
  const { settings, saveSettings } = useHospitalSettings();
  const { user, updateUser } = useAuth();
  const [saved, setSaved] = useState(false);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [userSaved, setUserSaved] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [userForm, setUserForm] = useState({
    name: '', email: '', password: '', role: '', department: '', employeeId: '',
  });
  const [account, setAccount] = useState({
    ...settings.account,
    firstName: user?.name.split(' ')[0] ?? settings.account.firstName,
    lastName: user?.name.split(' ').slice(1).join(' ') ?? settings.account.lastName,
    email: user?.email ?? settings.account.email,
    role: user?.role ?? settings.account.role,
    avatarUrl: user?.avatarUrl ?? settings.account.avatarUrl,
  });

  useEffect(() => setAccount((current) => ({
    ...settings.account,
    firstName: user?.name.split(' ')[0] ?? current.firstName,
    lastName: user?.name.split(' ').slice(1).join(' ') ?? current.lastName,
    email: user?.email ?? current.email,
    role: user?.role ?? current.role,
    avatarUrl: user?.avatarUrl ?? current.avatarUrl,
  })), [settings.account, user]);

  useEffect(() => {
    usersApi.getAll().then(setUsers);
  }, []);

  const resetUserForm = () => {
    setEditingUser(null);
    setUserForm({ name: '', email: '', password: '', role: 'receptionist', department: '', employeeId: '' });
  };

  const handleSaveUser = async () => {
    const payload = {
      name: userForm.name,
      email: userForm.email,
      ...(userForm.password ? { password: userForm.password } : {}),
      role: userForm.role,
      department: userForm.department,
      employeeId: userForm.employeeId,
    };
    const savedUser = editingUser
      ? await usersApi.update(editingUser.id, payload)
      : await usersApi.create({ ...payload, password: userForm.password });
    setUsers((current) => editingUser
      ? current.map((account) => account.id === editingUser.id ? { ...account, ...savedUser } : account)
      : [...current, savedUser]);
    resetUserForm();
    setUserSaved(true);
    setTimeout(() => setUserSaved(false), 3000);
  };

  const editUser = (account: SystemUser) => {
    setEditingUser(account);
    setUserForm({ name: account.name, email: account.email, password: '', role: account.role, department: account.department ?? '', employeeId: account.employeeId ?? '' });
  };

  const deleteUser = async (id: string) => {
    await usersApi.delete(id);
    setUsers((current) => current.filter((account) => account.id !== id));
    if (editingUser?.id === id) resetUserForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = `${account.firstName} ${account.lastName}`.trim();
    const profile = { name, email: account.email, role: account.role, avatarUrl: account.avatarUrl };
    updateUser(profile);
    if (user?.id) await usersApi.update(user.id, profile);
    await saveSettings({ ...settings, account });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAccount((current) => ({ ...current, avatarUrl: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SectionCard title="Profile">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            {account.avatarUrl ? <img src={account.avatarUrl} alt={user?.name ?? 'Profile'} className="w-full h-full rounded-full object-cover" /> : <User className="w-8 h-8 text-blue-600" />}
          </div>
          <div>
            <p className="font-medium text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.role}</p>
            <input id="profilePhoto" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            <Button asChild variant="outline" size="sm" className="mt-2">
              <label htmlFor="profilePhoto" className="cursor-pointer">Change Photo</label>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" value={account.firstName} onChange={(e) => setAccount({ ...account, firstName: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" value={account.lastName} onChange={(e) => setAccount({ ...account, lastName: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="accountEmail">Email Address</Label>
            <Input id="accountEmail" type="email" value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={account.role} onValueChange={(role) => setAccount({ ...account, role })}>
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
            <Input id="department" value={account.department} onChange={(e) => setAccount({ ...account, department: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input id="employeeId" value={account.employeeId} onChange={(e) => setAccount({ ...account, employeeId: e.target.value })} className="mt-1" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Users">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label htmlFor="newUserName">Full Name</Label>
            <Input id="newUserName" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} className="mt-1" required />
          </div>
          <div>
            <Label htmlFor="newUserEmail">Email Address</Label>
            <Input id="newUserEmail" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} type="email" className="mt-1" required />
          </div>
          <div>
            <Label htmlFor="newUserPassword">Temporary Password</Label>
            <Input id="newUserPassword" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} type="password" className="mt-1" required={!editingUser} minLength={editingUser ? undefined : 6} />
          </div>
          <div>
            <Label htmlFor="newUserRole">Role</Label>
            <Select value={userForm.role} onValueChange={(role) => setUserForm({ ...userForm, role })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
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
            <Label htmlFor="newUserDepartment">Department</Label>
            <Input id="newUserDepartment" value={userForm.department} onChange={(e) => setUserForm({ ...userForm, department: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="newUserEmployeeId">Employee ID</Label>
            <Input id="newUserEmployeeId" value={userForm.employeeId} onChange={(e) => setUserForm({ ...userForm, employeeId: e.target.value })} className="mt-1" />
          </div>
          <div className="md:col-span-2 flex items-center justify-between">
            {userSaved ? <SavedBanner /> : <span />}
            <div className="flex gap-2">
              <Button type="button" onClick={handleSaveUser}>{editingUser ? 'Update User' : 'Add User'}</Button>
              {editingUser && <Button type="button" variant="outline" onClick={resetUserForm}>Cancel</Button>}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Role</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Department</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((account) => (
                <tr key={account.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{account.name}</td>
                  <td className="px-4 py-3 text-gray-600">{account.email}</td>
                  <td className="px-4 py-3 text-gray-600">{account.role}</td>
                  <td className="px-4 py-3 text-gray-600">{account.department || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <Button type="button" variant="ghost" size="sm" title="Edit user" onClick={() => editUser(account)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" title="Delete user" className="text-red-600 hover:text-red-700" onClick={() => deleteUser(account.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Preferences">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Language</Label>
            <Select value={account.language} onValueChange={(language) => setAccount({ ...account, language })}>
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
            <Select value={account.dateFormat} onValueChange={(dateFormat) => setAccount({ ...account, dateFormat })}>
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
  const { settings, saveSettings } = useHospitalSettings();
  const { user } = useAuth();
  const [rows, setRows] = useState<NotifRow[]>(settings.notifications || defaultNotifications);
  const [saved, setSaved] = useState(false);
  const role = normalizeRole(user?.role);
  const canSeeBillingAndStockAlerts = role === 'admin';

  useEffect(() => setRows(settings.notifications || defaultNotifications), [settings.notifications]);

  const toggle = (id: string, channel: 'email' | 'sms' | 'inApp') => {
    setRows(rows.map((r) => (r.id === id ? { ...r, [channel]: !r[channel] } : r)));
  };

  const handleSave = async () => {
    await saveSettings({ ...settings, notifications: rows });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const visibleRows = rows.filter((row) => canSeeBillingAndStockAlerts || !['low-stock', 'payment-received', 'overdue-invoice'].includes(row.id));

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
                {visibleRows.map((row) => (
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
  const { settings, saveSettings } = useHospitalSettings();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [security, setSecurity] = useState(settings.security);

  useEffect(() => setSecurity(settings.security), [settings.security]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings({ ...settings, security });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSecuritySave = async () => {
    await saveSettings({ ...settings, security });
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
          ].map(({ label, description, defaultChecked }, index) => {
            const keys = ['autoLogout', 'twoFactorAuthentication', 'loginActivityAlerts'] as const;
            const key = keys[index];
            const on = security[key] ?? defaultChecked;
            return (
              <div key={label} className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                </div>
                <Switch checked={on} onCheckedChange={(value) => setSecurity({ ...security, [key]: value })} />
              </div>
            );
          })}
        </div>
      </SectionCard>

      <div className="flex items-center justify-between">
        {saved ? <SavedBanner /> : <span />}
        <Button onClick={handleSecuritySave}>
          <Save className="w-4 h-4 mr-2" />
          Save Security Settings
        </Button>
      </div>

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
  const { user } = useAuth();
  const isAdmin = normalizeRole(user?.role) === 'admin';

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage system configuration and preferences</p>
      </div>

      <Tabs defaultValue={isAdmin ? 'general' : 'account'}>
        <TabsList className="mb-6">
          {isAdmin && (
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              General
            </TabsTrigger>
          )}
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

        {isAdmin && <TabsContent value="general"><GeneralSettings /></TabsContent>}
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
