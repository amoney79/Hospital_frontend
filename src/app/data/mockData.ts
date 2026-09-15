export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  address: string;
  bloodType: string;
  emergencyContact: string;
  lastVisit: string;
  status: 'active' | 'inactive';
  patientType: 'inpatient' | 'outpatient' | 'maternity';
  // In-patient
  ward?: string;
  roomNumber?: string;
  admissionDate?: string;
  dischargeDate?: string;
  attendingPhysician?: string;
  // Outpatient
  appointmentDate?: string;
  reasonForVisit?: string;
  referredBy?: string;
  // Maternity
  gestationalAge?: string;
  expectedDueDate?: string;
  obgyn?: string;
  gravida?: number;
  para?: number;
  lastMenstrualPeriod?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  department: string;
  experience: number;
  availability: string;
  status: 'available' | 'busy' | 'off-duty';
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'in-progress';
  reason: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  followUp: string;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  date: string;
  dueDate: string;
  serviceType: string;
  description: string;
  amount: number;
  amountPaid: number;
  paymentMethod: 'Cash' | 'Credit Card' | 'Debit Card' | 'Insurance' | 'Bank Transfer';
  status: 'paid' | 'pending' | 'overdue' | 'partial';
}

export const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'John Smith',
    age: 45,
    gender: 'Male',
    phone: '+1 (555) 123-4567',
    email: 'john.smith@email.com',
    address: '123 Main St, New York, NY 10001',
    bloodType: 'A+',
    emergencyContact: '+1 (555) 987-6543',
    lastVisit: '2026-03-28',
    status: 'active',
    patientType: 'inpatient',
    ward: 'Cardiology',
    roomNumber: '204-B',
    admissionDate: '2026-03-25',
    dischargeDate: '2026-04-05',
    attendingPhysician: 'Dr. Robert Anderson',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    age: 32,
    gender: 'Female',
    phone: '+1 (555) 234-5678',
    email: 'sarah.j@email.com',
    address: '456 Oak Ave, Brooklyn, NY 11201',
    bloodType: 'O-',
    emergencyContact: '+1 (555) 876-5432',
    lastVisit: '2026-04-01',
    status: 'active',
    patientType: 'outpatient',
    appointmentDate: '2026-04-03',
    reasonForVisit: 'Pediatric consultation and routine check-up',
    referredBy: 'Self-referral',
  },
  {
    id: '3',
    name: 'Michael Chen',
    age: 58,
    gender: 'Male',
    phone: '+1 (555) 345-6789',
    email: 'mchen@email.com',
    address: '789 Pine Rd, Queens, NY 11354',
    bloodType: 'B+',
    emergencyContact: '+1 (555) 765-4321',
    lastVisit: '2026-03-15',
    status: 'active',
    patientType: 'inpatient',
    ward: 'Orthopedics',
    roomNumber: '311-A',
    admissionDate: '2026-03-10',
    dischargeDate: '2026-03-22',
    attendingPhysician: 'Dr. James Wilson',
  },
  {
    id: '4',
    name: 'Emily Davis',
    age: 28,
    gender: 'Female',
    phone: '+1 (555) 456-7890',
    email: 'emily.d@email.com',
    address: '321 Elm St, Manhattan, NY 10002',
    bloodType: 'AB+',
    emergencyContact: '+1 (555) 654-3210',
    lastVisit: '2026-03-30',
    status: 'active',
    patientType: 'maternity',
    gestationalAge: '28 weeks',
    expectedDueDate: '2026-06-20',
    obgyn: 'Dr. Maria Garcia',
    gravida: 2,
    para: 1,
    lastMenstrualPeriod: '2025-09-27',
  },
];

export const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Robert Anderson',
    specialty: 'Cardiology',
    phone: '+1 (555) 111-2222',
    email: 'r.anderson@hospital.com',
    department: 'Cardiology',
    experience: 15,
    availability: 'Mon-Fri, 9AM-5PM',
    status: 'available'
  },
  {
    id: '2',
    name: 'Dr. Maria Garcia',
    specialty: 'Pediatrics',
    phone: '+1 (555) 222-3333',
    email: 'm.garcia@hospital.com',
    department: 'Pediatrics',
    experience: 10,
    availability: 'Mon-Sat, 8AM-4PM',
    status: 'available'
  },
  {
    id: '3',
    name: 'Dr. James Wilson',
    specialty: 'Orthopedics',
    phone: '+1 (555) 333-4444',
    email: 'j.wilson@hospital.com',
    department: 'Orthopedics',
    experience: 20,
    availability: 'Tue-Sat, 10AM-6PM',
    status: 'busy'
  },
  {
    id: '4',
    name: 'Dr. Lisa Brown',
    specialty: 'Dermatology',
    phone: '+1 (555) 444-5555',
    email: 'l.brown@hospital.com',
    department: 'Dermatology',
    experience: 8,
    availability: 'Mon-Fri, 9AM-3PM',
    status: 'available'
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'John Smith',
    doctorId: '1',
    doctorName: 'Dr. Robert Anderson',
    date: '2026-04-05',
    time: '10:00 AM',
    type: 'Check-up',
    status: 'scheduled',
    reason: 'Regular cardiac check-up'
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Sarah Johnson',
    doctorId: '2',
    doctorName: 'Dr. Maria Garcia',
    date: '2026-04-03',
    time: '2:00 PM',
    type: 'Consultation',
    status: 'scheduled',
    reason: 'Pediatric consultation'
  },
  {
    id: '3',
    patientId: '3',
    patientName: 'Michael Chen',
    doctorId: '3',
    doctorName: 'Dr. James Wilson',
    date: '2026-04-02',
    time: '11:30 AM',
    type: 'Follow-up',
    status: 'in-progress',
    reason: 'Post-surgery follow-up'
  },
  {
    id: '4',
    patientId: '4',
    patientName: 'Emily Davis',
    doctorId: '4',
    doctorName: 'Dr. Lisa Brown',
    date: '2026-04-01',
    time: '9:00 AM',
    type: 'Treatment',
    status: 'completed',
    reason: 'Skin treatment'
  }
];

export const mockMedicalRecords: MedicalRecord[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'John Smith',
    doctorId: '1',
    doctorName: 'Dr. Robert Anderson',
    date: '2026-03-28',
    diagnosis: 'Hypertension',
    prescription: 'Lisinopril 10mg, once daily',
    notes: 'Blood pressure elevated. Advised lifestyle changes and medication.',
    followUp: '2026-05-28'
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Sarah Johnson',
    doctorId: '2',
    doctorName: 'Dr. Maria Garcia',
    date: '2026-04-01',
    diagnosis: 'Common Cold',
    prescription: 'Rest and fluids, Acetaminophen as needed',
    notes: 'Mild symptoms. No complications expected.',
    followUp: 'As needed'
  },
  {
    id: '3',
    patientId: '3',
    patientName: 'Michael Chen',
    doctorId: '3',
    doctorName: 'Dr. James Wilson',
    date: '2026-03-15',
    diagnosis: 'Knee Arthritis',
    prescription: 'Physical therapy 3x/week, Ibuprofen 400mg as needed',
    notes: 'Degenerative arthritis in left knee. Surgery may be needed in future.',
    followUp: '2026-06-15'
  }
];

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: 'Medications' | 'Surgical Supplies' | 'Equipment' | 'PPE' | 'Lab Supplies';
  quantity: number;
  minStockLevel: number;
  unitPrice: number;
  supplier: string;
  expiryDate: string;
  location: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

export const mockInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Amoxicillin 500mg Capsules',
    sku: 'MED-AMX-500',
    category: 'Medications',
    quantity: 1200,
    minStockLevel: 200,
    unitPrice: 0.45,
    supplier: 'PharmaCorp Inc.',
    expiryDate: '2027-06-30',
    location: 'Pharmacy - Shelf A3',
    status: 'in-stock',
  },
  {
    id: '2',
    name: 'Lisinopril 10mg Tablets',
    sku: 'MED-LIS-010',
    category: 'Medications',
    quantity: 85,
    minStockLevel: 150,
    unitPrice: 0.32,
    supplier: 'MediSupply Co.',
    expiryDate: '2027-03-15',
    location: 'Pharmacy - Shelf B1',
    status: 'low-stock',
  },
  {
    id: '3',
    name: 'Surgical Gloves (Box of 100)',
    sku: 'SUP-GLV-100',
    category: 'Surgical Supplies',
    quantity: 340,
    minStockLevel: 50,
    unitPrice: 12.99,
    supplier: 'SafeGuard Medical',
    expiryDate: '2028-12-31',
    location: 'Supply Room - Cabinet 2',
    status: 'in-stock',
  },
  {
    id: '4',
    name: 'Sterile Gauze Pads 4x4',
    sku: 'SUP-GAZ-4X4',
    category: 'Surgical Supplies',
    quantity: 0,
    minStockLevel: 100,
    unitPrice: 5.50,
    supplier: 'MedEquip Ltd.',
    expiryDate: '2029-01-01',
    location: 'Supply Room - Cabinet 3',
    status: 'out-of-stock',
  },
  {
    id: '5',
    name: 'N95 Respirator Masks (Box of 20)',
    sku: 'PPE-N95-020',
    category: 'PPE',
    quantity: 60,
    minStockLevel: 40,
    unitPrice: 24.99,
    supplier: 'SafeGuard Medical',
    expiryDate: '2027-09-30',
    location: 'PPE Storage - Rack 1',
    status: 'in-stock',
  },
  {
    id: '6',
    name: 'Disposable Syringes 5ml',
    sku: 'SUP-SYR-5ML',
    category: 'Surgical Supplies',
    quantity: 30,
    minStockLevel: 200,
    unitPrice: 0.18,
    supplier: 'PharmaCorp Inc.',
    expiryDate: '2028-05-20',
    location: 'Supply Room - Cabinet 1',
    status: 'low-stock',
  },
  {
    id: '7',
    name: 'Digital Blood Pressure Monitor',
    sku: 'EQP-BPM-001',
    category: 'Equipment',
    quantity: 12,
    minStockLevel: 5,
    unitPrice: 89.99,
    supplier: 'MedEquip Ltd.',
    expiryDate: 'N/A',
    location: 'Equipment Room - Shelf E1',
    status: 'in-stock',
  },
  {
    id: '8',
    name: 'Ibuprofen 400mg Tablets',
    sku: 'MED-IBU-400',
    category: 'Medications',
    quantity: 500,
    minStockLevel: 100,
    unitPrice: 0.28,
    supplier: 'MediSupply Co.',
    expiryDate: '2026-12-01',
    location: 'Pharmacy - Shelf A1',
    status: 'in-stock',
  },
  {
    id: '9',
    name: 'Blood Glucose Test Strips',
    sku: 'LAB-BGS-100',
    category: 'Lab Supplies',
    quantity: 45,
    minStockLevel: 60,
    unitPrice: 18.50,
    supplier: 'LabTech Solutions',
    expiryDate: '2026-11-30',
    location: 'Lab - Storage B',
    status: 'low-stock',
  },
  {
    id: '10',
    name: 'Protective Face Shields',
    sku: 'PPE-FCS-001',
    category: 'PPE',
    quantity: 150,
    minStockLevel: 30,
    unitPrice: 3.75,
    supplier: 'SafeGuard Medical',
    expiryDate: '2029-06-30',
    location: 'PPE Storage - Rack 2',
    status: 'in-stock',
  },
  {
    id: '11',
    name: 'Portable Pulse Oximeter',
    sku: 'EQP-POX-002',
    category: 'Equipment',
    quantity: 8,
    minStockLevel: 4,
    unitPrice: 45.00,
    supplier: 'MedEquip Ltd.',
    expiryDate: 'N/A',
    location: 'Equipment Room - Shelf E2',
    status: 'in-stock',
  },
  {
    id: '12',
    name: 'Urine Test Strips (Pack of 100)',
    sku: 'LAB-UTS-100',
    category: 'Lab Supplies',
    quantity: 0,
    minStockLevel: 20,
    unitPrice: 14.25,
    supplier: 'LabTech Solutions',
    expiryDate: '2027-02-28',
    location: 'Lab - Storage A',
    status: 'out-of-stock',
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2026-001',
    patientId: '1',
    patientName: 'John Smith',
    date: '2026-03-28',
    dueDate: '2026-04-12',
    serviceType: 'Cardiology Consultation',
    description: 'Regular cardiac check-up and ECG test',
    amount: 350.00,
    amountPaid: 350.00,
    paymentMethod: 'Credit Card',
    status: 'paid'
  },
  {
    id: '2',
    invoiceNumber: 'INV-2026-002',
    patientId: '2',
    patientName: 'Sarah Johnson',
    date: '2026-04-01',
    dueDate: '2026-04-15',
    serviceType: 'Pediatrics Consultation',
    description: 'Pediatric consultation and vaccination',
    amount: 180.00,
    amountPaid: 180.00,
    paymentMethod: 'Insurance',
    status: 'paid'
  },
  {
    id: '3',
    invoiceNumber: 'INV-2026-003',
    patientId: '3',
    patientName: 'Michael Chen',
    date: '2026-03-15',
    dueDate: '2026-03-30',
    serviceType: 'Orthopedics Surgery',
    description: 'Knee arthroscopy and post-surgery care',
    amount: 2500.00,
    amountPaid: 1500.00,
    paymentMethod: 'Bank Transfer',
    status: 'partial'
  },
  {
    id: '4',
    invoiceNumber: 'INV-2026-004',
    patientId: '4',
    patientName: 'Emily Davis',
    date: '2026-03-30',
    dueDate: '2026-03-25',
    serviceType: 'Dermatology Treatment',
    description: 'Skin treatment and medication',
    amount: 220.00,
    amountPaid: 0,
    paymentMethod: 'Cash',
    status: 'overdue'
  },
  {
    id: '5',
    invoiceNumber: 'INV-2026-005',
    patientId: '1',
    patientName: 'John Smith',
    date: '2026-04-02',
    dueDate: '2026-04-16',
    serviceType: 'Laboratory Tests',
    description: 'Blood work and cholesterol screening',
    amount: 150.00,
    amountPaid: 0,
    paymentMethod: 'Debit Card',
    status: 'pending'
  },
  {
    id: '6',
    invoiceNumber: 'INV-2026-006',
    patientId: '2',
    patientName: 'Sarah Johnson',
    date: '2026-03-25',
    dueDate: '2026-04-08',
    serviceType: 'Emergency Visit',
    description: 'Emergency room visit and treatment',
    amount: 450.00,
    amountPaid: 450.00,
    paymentMethod: 'Credit Card',
    status: 'paid'
  }
];