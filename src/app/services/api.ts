import {
  Patient,
  Doctor,
  Appointment,
  MedicalRecord,
  InventoryItem,
  Transaction,
  mockPatients,
  mockDoctors,
  mockAppointments,
  mockMedicalRecords,
  mockInventory,
  mockTransactions
} from '../data/mockData';

const BASE_URL = 'http://localhost:8081/api';

export interface HospitalSettings {
  hospitalName: string;
  registrationNumber: string;
  taxId: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  timezone: string;
  description: string;
  operatingHours: { day: string; open: string; close: string }[];
  account: AccountSettings;
  notifications: NotificationSetting[];
  security: SecuritySettings;
}

export interface AccountSettings {
  language: string;
  dateFormat: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  employeeId: string;
}

export interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  email: boolean;
  sms: boolean;
  inApp: boolean;
}

export interface SecuritySettings {
  autoLogout: boolean;
  twoFactorAuthentication: boolean;
  loginActivityAlerts: boolean;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  employeeId?: string;
  password?: string;
}

export const DEFAULT_HOSPITAL_SETTINGS: HospitalSettings = {
  hospitalName: 'HealthCare Medical Center',
  registrationNumber: 'HMC-2010-00842',
  taxId: '47-2930011',
  address: '500 Medical Drive, New York, NY 10001',
  phone: '+1 (800) 555-0100',
  email: 'admin@healthcare-mc.com',
  website: 'www.healthcare-mc.com',
  timezone: 'africa-nairobi',
  description: 'A leading multi-specialty medical center providing compassionate, high-quality healthcare to the community since 2010.',
  operatingHours: [
    { day: 'Monday – Friday', open: '08:00', close: '20:00' },
    { day: 'Saturday', open: '09:00', close: '17:00' },
    { day: 'Sunday', open: '10:00', close: '14:00' },
  ],
  account: {
    language: 'en',
    dateFormat: 'yyyy-mm-dd',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@healthcare-mc.com',
    role: 'administrator',
    department: 'Administration',
    employeeId: 'EMP-0001',
  },
  notifications: [
    { id: 'new-appointment', label: 'New Appointment', description: 'When a new appointment is booked', email: true, sms: false, inApp: true },
    { id: 'appointment-reminder', label: 'Appointment Reminder', description: '24 hours before a scheduled appointment', email: true, sms: true, inApp: true },
    { id: 'low-stock', label: 'Low Stock Alert', description: 'When inventory falls below minimum level', email: true, sms: false, inApp: true },
    { id: 'payment-received', label: 'Payment Received', description: 'When a patient completes a payment', email: false, sms: false, inApp: true },
    { id: 'overdue-invoice', label: 'Overdue Invoice', description: 'When an invoice passes its due date', email: true, sms: false, inApp: true },
    { id: 'new-patient', label: 'New Patient Registered', description: 'When a new patient record is created', email: false, sms: false, inApp: true },
  ],
  security: {
    autoLogout: true,
    twoFactorAuthentication: false,
    loginActivityAlerts: true,
  },
};

const fallbackUsers: SystemUser[] = [
  { id: '1', name: 'Admin User', email: 'admin@healthcare-mc.com', role: 'Administrator', department: 'Administration', employeeId: 'EMP-0001' },
  { id: '2', name: 'Dr. Robert Anderson', email: 'doctor@healthcare-mc.com', role: 'Doctor', department: 'General Medicine', employeeId: 'EMP-0002' },
];

function localValue<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalValue(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

async function fetchJson<T>(url: string, options?: RequestInit, fallbackData?: T): Promise<T> {
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    return (await res.json()) as T;
  } catch (error) {
    console.warn(`[API] Call to ${url} failed or server offline. Using local data fallback:`, error);
    if (fallbackData !== undefined) {
      return fallbackData;
    }
    throw error;
  }
}

// ─── Patient API ─────────────────────────────────────────────────────────────

export const patientApi = {
  async getAll(search?: string, type?: string): Promise<Patient[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (type && type !== 'all') params.append('type', type);

    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<Patient[]>(`${BASE_URL}/patients${query}`, undefined, mockPatients);
  },

  async getById(id: string): Promise<Patient | null> {
    const fallback = mockPatients.find((p) => p.id === id) || null;
    return fetchJson<Patient>(`${BASE_URL}/patients/${id}`, undefined, fallback as Patient);
  },

  async create(patient: Omit<Patient, 'id'>): Promise<Patient> {
    const payload = { ...patient, id: String(Date.now()) };
    return fetchJson<Patient>(
      `${BASE_URL}/patients`,
      { method: 'POST', body: JSON.stringify(payload) },
      payload as Patient
    );
  },

  async update(id: string, patient: Partial<Patient>): Promise<Patient> {
    return fetchJson<Patient>(
      `${BASE_URL}/patients/${id}`,
      { method: 'PUT', body: JSON.stringify(patient) },
      { id, ...patient } as Patient
    );
  },

  async delete(id: string): Promise<boolean> {
    try {
      await fetch(`${BASE_URL}/patients/${id}`, { method: 'DELETE' });
      return true;
    } catch {
      return true;
    }
  },
};

// ─── Doctor API ──────────────────────────────────────────────────────────────

export const doctorApi = {
  async getAll(department?: string): Promise<Doctor[]> {
    const query = department && department !== 'all' ? `?department=${encodeURIComponent(department)}` : '';
    return fetchJson<Doctor[]>(`${BASE_URL}/doctors${query}`, undefined, mockDoctors);
  },

  async create(doctor: Omit<Doctor, 'id'>): Promise<Doctor> {
    const payload = { ...doctor, id: String(Date.now()) };
    return fetchJson<Doctor>(
      `${BASE_URL}/doctors`,
      { method: 'POST', body: JSON.stringify(payload) },
      payload as Doctor
    );
  },

  async update(id: string, doctor: Partial<Doctor>): Promise<Doctor> {
    return fetchJson<Doctor>(
      `${BASE_URL}/doctors/${id}`,
      { method: 'PUT', body: JSON.stringify(doctor) },
      { id, ...doctor } as Doctor
    );
  },

  async updateStatus(id: string, status: 'available' | 'busy' | 'off-duty'): Promise<Doctor> {
    return fetchJson<Doctor>(
      `${BASE_URL}/doctors/${id}/status`,
      { method: 'PATCH', body: JSON.stringify({ status }) },
      { id, status } as Doctor
    );
  },

  async delete(id: string): Promise<boolean> {
    try {
      await fetch(`${BASE_URL}/doctors/${id}`, { method: 'DELETE' });
      return true;
    } catch {
      return true;
    }
  },
};

// ─── Appointment API ─────────────────────────────────────────────────────────

export const appointmentApi = {
  async getAll(status?: string, doctorId?: string, patientId?: string): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (doctorId && doctorId !== 'all') params.append('doctorId', doctorId);
    if (patientId) params.append('patientId', patientId);

    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<Appointment[]>(`${BASE_URL}/appointments${query}`, undefined, mockAppointments);
  },

  async create(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
    const payload = { ...appointment, id: String(Date.now()) };
    return fetchJson<Appointment>(
      `${BASE_URL}/appointments`,
      { method: 'POST', body: JSON.stringify(payload) },
      payload as Appointment
    );
  },

  async update(id: string, appointment: Partial<Appointment>): Promise<Appointment> {
    return fetchJson<Appointment>(
      `${BASE_URL}/appointments/${id}`,
      { method: 'PUT', body: JSON.stringify(appointment) },
      { id, ...appointment } as Appointment
    );
  },

  async updateStatus(id: string, status: string): Promise<Appointment> {
    return fetchJson<Appointment>(
      `${BASE_URL}/appointments/${id}/status`,
      { method: 'PATCH', body: JSON.stringify({ status }) },
      { id, status } as Appointment
    );
  },

  async delete(id: string): Promise<boolean> {
    try {
      await fetch(`${BASE_URL}/appointments/${id}`, { method: 'DELETE' });
      return true;
    } catch {
      return true;
    }
  },
};

// ─── Medical Record API ───────────────────────────────────────────────────────

export const medicalRecordApi = {
  async getAll(patientId?: string, doctorId?: string): Promise<MedicalRecord[]> {
    const params = new URLSearchParams();
    if (patientId) params.append('patientId', patientId);
    if (doctorId) params.append('doctorId', doctorId);

    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<MedicalRecord[]>(`${BASE_URL}/medical-records${query}`, undefined, mockMedicalRecords);
  },

  async create(record: Omit<MedicalRecord, 'id'>): Promise<MedicalRecord> {
    const payload = { ...record, id: String(Date.now()) };
    return fetchJson<MedicalRecord>(
      `${BASE_URL}/medical-records`,
      { method: 'POST', body: JSON.stringify(payload) },
      payload as MedicalRecord
    );
  },

  async delete(id: string): Promise<boolean> {
    try {
      await fetch(`${BASE_URL}/medical-records/${id}`, { method: 'DELETE' });
      return true;
    } catch {
      return true;
    }
  },
};

// ─── Inventory API ────────────────────────────────────────────────────────────

export const inventoryApi = {
  async getAll(category?: string, status?: string): Promise<InventoryItem[]> {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (status && status !== 'all') params.append('status', status);

    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<InventoryItem[]>(`${BASE_URL}/inventory${query}`, undefined, mockInventory);
  },

  async create(item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
    const payload = { ...item, id: String(Date.now()) };
    return fetchJson<InventoryItem>(
      `${BASE_URL}/inventory`,
      { method: 'POST', body: JSON.stringify(payload) },
      payload as InventoryItem
    );
  },

  async update(id: string, item: Partial<InventoryItem>): Promise<InventoryItem> {
    return fetchJson<InventoryItem>(
      `${BASE_URL}/inventory/${id}`,
      { method: 'PUT', body: JSON.stringify(item) },
      { id, ...item } as InventoryItem
    );
  },

  async updateQuantity(id: string, quantity: number): Promise<InventoryItem> {
    return fetchJson<InventoryItem>(
      `${BASE_URL}/inventory/${id}/quantity`,
      { method: 'PATCH', body: JSON.stringify({ quantity }) },
      { id, quantity } as InventoryItem
    );
  },

  async delete(id: string): Promise<boolean> {
    try {
      await fetch(`${BASE_URL}/inventory/${id}`, { method: 'DELETE' });
      return true;
    } catch {
      return true;
    }
  },
};

// ─── Transaction API ─────────────────────────────────────────────────────────

export const transactionApi = {
  async getAll(patientId?: string, status?: string): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (patientId) params.append('patientId', patientId);
    if (status && status !== 'all') params.append('status', status);

    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<Transaction[]>(`${BASE_URL}/transactions${query}`, undefined, mockTransactions);
  },

  async create(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const payload = { ...transaction, id: String(Date.now()) };
    return fetchJson<Transaction>(
      `${BASE_URL}/transactions`,
      { method: 'POST', body: JSON.stringify(payload) },
      payload as Transaction
    );
  },

  async update(id: string, transaction: Partial<Transaction>): Promise<Transaction> {
    return fetchJson<Transaction>(
      `${BASE_URL}/transactions/${id}`,
      { method: 'PUT', body: JSON.stringify(transaction) },
      { id, ...transaction } as Transaction
    );
  },

  async recordPayment(id: string, paymentAmount: number, paymentMethod?: string): Promise<Transaction> {
    return fetchJson<Transaction>(
      `${BASE_URL}/transactions/${id}/pay`,
      { method: 'PATCH', body: JSON.stringify({ paymentAmount, paymentMethod }) },
      { id, amountPaid: paymentAmount } as Transaction
    );
  },

  async delete(id: string): Promise<boolean> {
    try {
      await fetch(`${BASE_URL}/transactions/${id}`, { method: 'DELETE' });
      return true;
    } catch {
      return true;
    }
  },
};

// ─── Dashboard Stats API ──────────────────────────────────────────────────────

export interface DashboardStats {
  totalPatients: number;
  activePatients: number;
  doctorsOnDuty: number;
  appointmentsToday: number;
  totalRevenue: number;
  lowStockCount: number;
  emergencyCases: number;
}

export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    const fallbackStats: DashboardStats = {
      totalPatients: mockPatients.length,
      activePatients: mockPatients.filter((p) => p.status === 'active').length,
      doctorsOnDuty: mockDoctors.filter((d) => d.status === 'available').length,
      appointmentsToday: mockAppointments.length,
      totalRevenue: mockTransactions.reduce((acc, t) => acc + t.amountPaid, 0),
      lowStockCount: mockInventory.filter((i) => i.status !== 'in-stock').length,
      emergencyCases: 2,
    };

    return fetchJson<DashboardStats>(`${BASE_URL}/dashboard/stats`, undefined, fallbackStats);
  },
};

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  async login(email: string, password?: string) {
    return fetchJson<{ success: boolean; user?: any; token?: string; message?: string }>(
      `${BASE_URL}/auth/login`,
      { method: 'POST', body: JSON.stringify({ email, password }) },
      {
        success: true,
        user: {
          id: '1',
          name: 'Dr. Sarah Jenkins',
          email: 'admin@hospital.com',
          role: 'Admin',
          avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
        },
        token: 'mock-jwt-token',
      }
    );
  },
};

// ─── Settings and User Administration API ───────────────────────────────────

export const settingsApi = {
  async get(): Promise<HospitalSettings> {
    return fetchJson<HospitalSettings>(`${BASE_URL}/settings`, undefined, localValue('hms_settings', DEFAULT_HOSPITAL_SETTINGS));
  },

  async update(settings: HospitalSettings): Promise<HospitalSettings> {
    const saved = await fetchJson<HospitalSettings>(
      `${BASE_URL}/settings`,
      { method: 'PUT', body: JSON.stringify(settings) },
      settings
    );
    setLocalValue('hms_settings', saved);
    return saved;
  },
};

export const usersApi = {
  async getAll(): Promise<SystemUser[]> {
    return fetchJson<SystemUser[]>(`${BASE_URL}/users`, undefined, localValue('hms_users', fallbackUsers));
  },

  async create(user: Omit<SystemUser, 'id'>): Promise<SystemUser> {
    const payload = { ...user, id: String(Date.now()) };
    const created = await fetchJson<SystemUser>(
      `${BASE_URL}/users`,
      { method: 'POST', body: JSON.stringify(payload) },
      payload
    );
    const users = localValue<SystemUser[]>('hms_users', fallbackUsers);
    setLocalValue('hms_users', [...users, created]);
    return created;
  },

  async update(id: string, user: Partial<SystemUser>): Promise<SystemUser> {
    const updated = await fetchJson<SystemUser>(
      `${BASE_URL}/users/${id}`,
      { method: 'PUT', body: JSON.stringify(user) },
      { id, ...user } as SystemUser
    );
    const users = localValue<SystemUser[]>('hms_users', fallbackUsers);
    setLocalValue('hms_users', users.map((account) => account.id === id ? { ...account, ...updated } : account));
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    try {
      await fetch(`${BASE_URL}/users/${id}`, { method: 'DELETE' });
    } catch {
      // Keep the local fallback usable when the API is offline.
    }
    const users = localValue<SystemUser[]>('hms_users', fallbackUsers);
    setLocalValue('hms_users', users.filter((account) => account.id !== id));
    return true;
  },
};
