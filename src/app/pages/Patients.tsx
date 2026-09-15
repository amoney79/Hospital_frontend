import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Printer,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Droplet,
  AlertCircle,
  Calendar,
  BedDouble,
  Baby,
  ClipboardList,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { mockPatients, mockMedicalRecords, mockDoctors, Patient, MedicalRecord } from '../data/mockData';
import { patientApi, medicalRecordApi } from '../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type PatientType = 'inpatient' | 'outpatient' | 'maternity';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<PatientType, string> = {
  inpatient: 'In-Patient',
  outpatient: 'Outpatient',
  maternity: 'Maternity',
};

const TYPE_COLOR: Record<PatientType, string> = {
  inpatient: 'bg-blue-100 text-blue-700',
  outpatient: 'bg-purple-100 text-purple-700',
  maternity: 'bg-pink-100 text-pink-700',
};

const TYPE_ICON: Record<PatientType, React.ElementType> = {
  inpatient: BedDouble,
  outpatient: ClipboardList,
  maternity: Baby,
};

function TypeBadge({ type }: { type?: PatientType }) {
  const safeType: PatientType = (type && TYPE_LABEL[type]) ? type : 'outpatient';
  const Icon = TYPE_ICON[safeType] || ClipboardList;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ${TYPE_COLOR[safeType]}`}>
      <Icon className="w-3 h-3" />
      {TYPE_LABEL[safeType]}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number }) {
  if (!value && value !== 0) return null;
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}

// ─── Print ────────────────────────────────────────────────────────────────────

function printPatientRecord(patient: Patient, records: MedicalRecord[]) {
  const patientRecords = records.filter((r) => r.patientId === patient.id);
  const safeType: PatientType = (patient.patientType && TYPE_LABEL[patient.patientType]) ? patient.patientType : 'outpatient';
  const safeId = String(patient.id || '');
  const idDisplay = safeId ? safeId.padStart(4, '0') : '0000';

  const typeSection = (() => {
    if (safeType === 'inpatient') {
      return `
        <h2>In-Patient Details</h2>
        <div class="grid">
          <div class="field"><div class="label">Ward</div><div class="value">${patient.ward ?? '—'}</div></div>
          <div class="field"><div class="label">Room</div><div class="value">${patient.roomNumber ?? '—'}</div></div>
          <div class="field"><div class="label">Admission</div><div class="value">${patient.admissionDate ?? '—'}</div></div>
          <div class="field"><div class="label">Expected Discharge</div><div class="value">${patient.dischargeDate ?? '—'}</div></div>
          <div class="field"><div class="label">Attending Physician</div><div class="value">${patient.attendingPhysician ?? '—'}</div></div>
        </div>`;
    }
    if (safeType === 'outpatient') {
      return `
        <h2>Outpatient Details</h2>
        <div class="grid">
          <div class="field"><div class="label">Appointment Date</div><div class="value">${patient.appointmentDate ?? '—'}</div></div>
          <div class="field"><div class="label">Reason for Visit</div><div class="value">${patient.reasonForVisit ?? '—'}</div></div>
          <div class="field"><div class="label">Referred By</div><div class="value">${patient.referredBy ?? '—'}</div></div>
        </div>`;
    }
    if (safeType === 'maternity') {
      return `
        <h2>Maternity Details</h2>
        <div class="grid">
          <div class="field"><div class="label">Gestational Age</div><div class="value">${patient.gestationalAge ?? '—'}</div></div>
          <div class="field"><div class="label">Expected Due Date</div><div class="value">${patient.expectedDueDate ?? '—'}</div></div>
          <div class="field"><div class="label">OB-GYN</div><div class="value">${patient.obgyn ?? '—'}</div></div>
          <div class="field"><div class="label">Gravida / Para</div><div class="value">G${patient.gravida ?? 0} / P${patient.para ?? 0}</div></div>
          <div class="field"><div class="label">Last Menstrual Period</div><div class="value">${patient.lastMenstrualPeriod ?? '—'}</div></div>
        </div>`;
    }
    return '';
  })();

  const recordsHtml = patientRecords.length === 0
    ? '<p style="color:#6b7280;font-size:14px;">No medical records on file.</p>'
    : patientRecords.map((r) => `
        <div class="record">
          <div class="record-header">
            <div>
              <strong style="font-size:15px;">${r.diagnosis}</strong>
              <div style="font-size:12px;color:#6b7280;margin-top:2px;">${r.doctorName}</div>
            </div>
            <div style="font-size:13px;color:#6b7280;">${r.date}</div>
          </div>
          <div class="grid" style="margin-top:10px;">
            <div class="field"><div class="label">Prescription</div><div class="value">${r.prescription}</div></div>
            <div class="field"><div class="label">Follow-up</div><div class="value">${r.followUp}</div></div>
            <div class="field" style="grid-column:span 2"><div class="label">Notes</div><div class="value">${r.notes}</div></div>
          </div>
        </div>`).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Patient Record – ${patient.name}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;padding:40px;color:#111;font-size:14px}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:16px;border-bottom:2px solid #2563eb}
    .hospital{color:#2563eb;font-weight:700;font-size:18px;margin-bottom:2px}
    h2{font-size:15px;font-weight:700;color:#2563eb;border-bottom:1px solid #bfdbfe;padding-bottom:6px;margin:20px 0 12px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .field{padding:8px;background:#f9fafb;border-radius:6px}
    .label{font-size:11px;color:#6b7280;margin-bottom:2px}
    .value{font-size:13px;font-weight:500}
    .type-badge{display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600;margin-left:8px}
    .record{border:1px solid #e5e7eb;border-radius:8px;padding:14px;margin-bottom:12px}
    .record-header{display:flex;justify-content:space-between;margin-bottom:4px}
    @media print{body{padding:20px}}
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="hospital">HealthCare Medical Center</div>
      <div style="font-size:12px;color:#6b7280">500 Medical Drive, New York, NY 10001 · +1 (800) 555-0100</div>
    </div>
    <div style="text-align:right;font-size:12px;color:#6b7280">
      Printed: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}<br/>
      Patient ID: PAT-${idDisplay}
    </div>
  </div>

  <h2>Patient Information <span class="type-badge" style="background:#eff6ff;color:#2563eb">${TYPE_LABEL[safeType]}</span></h2>
  <div class="grid">
    <div class="field"><div class="label">Full Name</div><div class="value">${patient.name}</div></div>
    <div class="field"><div class="label">Age / Gender</div><div class="value">${patient.age} yrs · ${patient.gender}</div></div>
    <div class="field"><div class="label">Blood Type</div><div class="value">${patient.bloodType}</div></div>
    <div class="field"><div class="label">Status</div><div class="value" style="text-transform:capitalize">${patient.status}</div></div>
    <div class="field"><div class="label">Phone</div><div class="value">${patient.phone}</div></div>
    <div class="field"><div class="label">Email</div><div class="value">${patient.email}</div></div>
    <div class="field" style="grid-column:span 2"><div class="label">Address</div><div class="value">${patient.address}</div></div>
    <div class="field"><div class="label">Emergency Contact</div><div class="value">${patient.emergencyContact}</div></div>
    <div class="field"><div class="label">Last Visit</div><div class="value">${patient.lastVisit}</div></div>
  </div>

  ${typeSection}

  <h2 style="margin-top:24px">Medical Records (${patientRecords.length})</h2>
  ${recordsHtml}
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 300);
  }
}

// ─── Add/Edit Form ────────────────────────────────────────────────────────────

interface PatientFormProps {
  initial?: Patient;
  onSubmit: (p: Omit<Patient, 'id' | 'lastVisit' | 'status'>) => void;
  onCancel: () => void;
}

function PatientForm({ initial, onSubmit, onCancel }: PatientFormProps) {
  const [patientType, setPatientType] = useState<PatientType>(initial?.patientType ?? 'outpatient');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const base = {
      name: f.get('name') as string,
      age: Number(f.get('age')),
      gender: f.get('gender') as string,
      phone: f.get('phone') as string,
      email: f.get('email') as string,
      address: f.get('address') as string,
      bloodType: f.get('bloodType') as string,
      emergencyContact: f.get('emergencyContact') as string,
      patientType,
    };

    if (patientType === 'inpatient') {
      onSubmit({
        ...base,
        ward: f.get('ward') as string,
        roomNumber: f.get('roomNumber') as string,
        admissionDate: f.get('admissionDate') as string,
        dischargeDate: f.get('dischargeDate') as string,
        attendingPhysician: f.get('attendingPhysician') as string,
      });
    } else if (patientType === 'outpatient') {
      onSubmit({
        ...base,
        appointmentDate: f.get('appointmentDate') as string,
        reasonForVisit: f.get('reasonForVisit') as string,
        referredBy: f.get('referredBy') as string,
      });
    } else {
      onSubmit({
        ...base,
        gestationalAge: f.get('gestationalAge') as string,
        expectedDueDate: f.get('expectedDueDate') as string,
        obgyn: f.get('obgyn') as string,
        gravida: Number(f.get('gravida')),
        para: Number(f.get('para')),
        lastMenstrualPeriod: f.get('lastMenstrualPeriod') as string,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 mt-4">
      {/* Patient Type */}
      <div>
        <Label>Patient Type</Label>
        <div className="grid grid-cols-3 gap-2 mt-1">
          {(['inpatient', 'outpatient', 'maternity'] as PatientType[]).map((t) => {
            const Icon = TYPE_ICON[t];
            return (
              <button
                key={t}
                type="button"
                onClick={() => setPatientType(t)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                  patientType === t
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                {TYPE_LABEL[t]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Common fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" defaultValue={initial?.name} required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="age">Age</Label>
          <Input id="age" name="age" type="number" min="0" defaultValue={initial?.age} required className="mt-1" />
        </div>
        <div>
          <Label>Gender</Label>
          <Select name="gender" defaultValue={initial?.gender ?? 'Male'}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" defaultValue={initial?.phone} required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={initial?.email} required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="bloodType">Blood Type</Label>
          <Select name="bloodType" defaultValue={initial?.bloodType ?? 'A+'}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((bt) => (
                <SelectItem key={bt} value={bt}>{bt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="emergencyContact">Emergency Contact</Label>
          <Input id="emergencyContact" name="emergencyContact" type="tel" defaultValue={initial?.emergencyContact} required className="mt-1" />
        </div>
        <div className="col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" defaultValue={initial?.address} required className="mt-1" />
        </div>
      </div>

      {/* In-patient fields */}
      {patientType === 'inpatient' && (
        <div className="space-y-3 border-t pt-4">
          <p className="text-sm font-semibold text-blue-700 flex items-center gap-1">
            <BedDouble className="w-4 h-4" /> In-Patient Details
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ward">Ward</Label>
              <Input id="ward" name="ward" placeholder="e.g. Cardiology" defaultValue={initial?.ward} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="roomNumber">Room Number</Label>
              <Input id="roomNumber" name="roomNumber" placeholder="e.g. 204-B" defaultValue={initial?.roomNumber} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="admissionDate">Admission Date</Label>
              <Input id="admissionDate" name="admissionDate" type="date" defaultValue={initial?.admissionDate} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="dischargeDate">Expected Discharge</Label>
              <Input id="dischargeDate" name="dischargeDate" type="date" defaultValue={initial?.dischargeDate} className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="attendingPhysician">Attending Physician</Label>
              <Input id="attendingPhysician" name="attendingPhysician" placeholder="Dr. Name" defaultValue={initial?.attendingPhysician} className="mt-1" />
            </div>
          </div>
        </div>
      )}

      {/* Outpatient fields */}
      {patientType === 'outpatient' && (
        <div className="space-y-3 border-t pt-4">
          <p className="text-sm font-semibold text-purple-700 flex items-center gap-1">
            <ClipboardList className="w-4 h-4" /> Outpatient Details
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="appointmentDate">Appointment Date</Label>
              <Input id="appointmentDate" name="appointmentDate" type="date" defaultValue={initial?.appointmentDate} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="referredBy">Referred By</Label>
              <Input id="referredBy" name="referredBy" placeholder="e.g. Self-referral" defaultValue={initial?.referredBy} className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="reasonForVisit">Reason for Visit</Label>
              <Textarea id="reasonForVisit" name="reasonForVisit" rows={2} placeholder="Describe the reason for the visit" defaultValue={initial?.reasonForVisit} className="mt-1" />
            </div>
          </div>
        </div>
      )}

      {/* Maternity fields */}
      {patientType === 'maternity' && (
        <div className="space-y-3 border-t pt-4">
          <p className="text-sm font-semibold text-pink-700 flex items-center gap-1">
            <Baby className="w-4 h-4" /> Maternity Details
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gestationalAge">Gestational Age</Label>
              <Input id="gestationalAge" name="gestationalAge" placeholder="e.g. 28 weeks" defaultValue={initial?.gestationalAge} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="expectedDueDate">Expected Due Date</Label>
              <Input id="expectedDueDate" name="expectedDueDate" type="date" defaultValue={initial?.expectedDueDate} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="obgyn">OB-GYN</Label>
              <Input id="obgyn" name="obgyn" placeholder="Dr. Name" defaultValue={initial?.obgyn} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="lastMenstrualPeriod">Last Menstrual Period</Label>
              <Input id="lastMenstrualPeriod" name="lastMenstrualPeriod" type="date" defaultValue={initial?.lastMenstrualPeriod} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="gravida">Gravida (G)</Label>
              <Input id="gravida" name="gravida" type="number" min="0" defaultValue={initial?.gravida} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="para">Para (P)</Label>
              <Input id="para" name="para" type="number" min="0" defaultValue={initial?.para} className="mt-1" />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initial ? 'Update' : 'Add'} Patient</Button>
      </div>
    </form>
  );
}

// ─── Add Record Form ──────────────────────────────────────────────────────────

interface AddRecordFormProps {
  patient: Patient;
  onAdd: (r: MedicalRecord) => void;
}

function AddRecordForm({ patient, onAdd }: AddRecordFormProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const doctorId = f.get('doctorId') as string;
    const doctor = mockDoctors.find((d) => d.id === doctorId);
    onAdd({
      id: String(Date.now()),
      patientId: patient.id,
      patientName: patient.name,
      doctorId,
      doctorName: doctor?.name ?? '',
      date: f.get('date') as string,
      diagnosis: f.get('diagnosis') as string,
      prescription: f.get('prescription') as string,
      notes: f.get('notes') as string,
      followUp: f.get('followUp') as string,
    });
    setOpen(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="border rounded-lg">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
      >
        <span className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Write New Medical Record
        </span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="px-4 pb-4 space-y-3 border-t">
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <Label>Doctor</Label>
              <Select name="doctorId" required>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select doctor" /></SelectTrigger>
                <SelectContent>
                  {mockDoctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="recDate">Date</Label>
              <Input id="recDate" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Input id="diagnosis" name="diagnosis" required className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="prescription">Prescription</Label>
              <Textarea id="prescription" name="prescription" rows={2} required className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="notes">Doctor's Notes</Label>
              <Textarea id="notes" name="notes" rows={2} required className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="followUp">Follow-up</Label>
              <Input id="followUp" name="followUp" placeholder="e.g. 2026-06-01 or As needed" required className="mt-1" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm">Save Record</Button>
          </div>
        </form>
      )}
    </div>
  );
}

// ─── Patient Detail Dialog ────────────────────────────────────────────────────

interface PatientDetailProps {
  patient: Patient;
  records: MedicalRecord[];
  onAddRecord: (r: MedicalRecord) => void;
  onEdit: () => void;
  onClose: () => void;
}

function PatientDetail({ patient, records, onAddRecord, onEdit, onClose }: PatientDetailProps) {
  const patientRecords = records.filter((r) => r.patientId === patient.id);

  return (
    <div className="space-y-6 mt-2">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{patient.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <TypeBadge type={patient.patientType} />
              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                patient.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>{patient.status}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-1" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => printPatientRecord(patient, records)}>
            <Printer className="w-4 h-4 mr-1" /> Print
          </Button>
        </div>
      </div>

      {/* Personal info */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Personal Information</p>
        <div className="grid grid-cols-2 gap-2">
          <InfoRow label="Age" value={`${patient.age} years`} />
          <InfoRow label="Gender" value={patient.gender} />
          <InfoRow label="Blood Type" value={patient.bloodType} />
          <InfoRow label="Last Visit" value={patient.lastVisit} />
          <div className="bg-gray-50 rounded-lg p-3 col-span-2 flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-sm font-medium text-gray-900">{patient.phone}</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 col-span-2 flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-900">{patient.email}</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 col-span-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Address</p>
              <p className="text-sm font-medium text-gray-900">{patient.address}</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 col-span-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Emergency Contact</p>
              <p className="text-sm font-medium text-gray-900">{patient.emergencyContact}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Type-specific info */}
      {patient.patientType === 'inpatient' && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2 flex items-center gap-1">
            <BedDouble className="w-3.5 h-3.5" /> In-Patient Details
          </p>
          <div className="grid grid-cols-2 gap-2">
            <InfoRow label="Ward" value={patient.ward} />
            <InfoRow label="Room Number" value={patient.roomNumber} />
            <InfoRow label="Admission Date" value={patient.admissionDate} />
            <InfoRow label="Expected Discharge" value={patient.dischargeDate} />
            <InfoRow label="Attending Physician" value={patient.attendingPhysician} />
          </div>
        </div>
      )}

      {patient.patientType === 'outpatient' && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 mb-2 flex items-center gap-1">
            <ClipboardList className="w-3.5 h-3.5" /> Outpatient Details
          </p>
          <div className="grid grid-cols-2 gap-2">
            <InfoRow label="Appointment Date" value={patient.appointmentDate} />
            <InfoRow label="Referred By" value={patient.referredBy} />
            <div className="bg-gray-50 rounded-lg p-3 col-span-2">
              <p className="text-xs text-gray-500 mb-0.5">Reason for Visit</p>
              <p className="text-sm font-medium text-gray-900">{patient.reasonForVisit ?? '—'}</p>
            </div>
          </div>
        </div>
      )}

      {patient.patientType === 'maternity' && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-pink-600 mb-2 flex items-center gap-1">
            <Baby className="w-3.5 h-3.5" /> Maternity Details
          </p>
          <div className="grid grid-cols-2 gap-2">
            <InfoRow label="Gestational Age" value={patient.gestationalAge} />
            <InfoRow label="Expected Due Date" value={patient.expectedDueDate} />
            <InfoRow label="OB-GYN" value={patient.obgyn} />
            <InfoRow label="LMP" value={patient.lastMenstrualPeriod} />
            <InfoRow label="Gravida" value={patient.gravida !== undefined ? `G${patient.gravida}` : undefined} />
            <InfoRow label="Para" value={patient.para !== undefined ? `P${patient.para}` : undefined} />
          </div>
        </div>
      )}

      {/* Medical Records */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1">
          <FileText className="w-3.5 h-3.5" /> Medical Records ({patientRecords.length})
        </p>

        <AddRecordForm patient={patient} onAdd={onAddRecord} />

        {patientRecords.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm mt-3">
            No records yet. Use the form above to add the first one.
          </div>
        ) : (
          <div className="space-y-3 mt-3">
            {patientRecords.map((record) => (
              <div key={record.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{record.diagnosis}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{record.doctorName}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {record.date}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="bg-gray-50 rounded p-2">
                    <span className="text-xs text-gray-500">Prescription: </span>
                    {record.prescription}
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <span className="text-xs text-gray-500">Notes: </span>
                    {record.notes}
                  </div>
                  <div className="bg-blue-50 rounded p-2">
                    <span className="text-xs text-blue-600">Follow-up: </span>
                    {record.followUp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);

  useEffect(() => {
    patientApi.getAll().then(setPatients).catch(() => setPatients(mockPatients));
    medicalRecordApi.getAll().then(setRecords).catch(() => setRecords(mockMedicalRecords));
  }, []);

  const filtered = patients.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm);
    const matchType = typeFilter === 'all' || p.patientType === typeFilter;
    return matchSearch && matchType;
  });

  const handleSave = async (data: Omit<Patient, 'id' | 'lastVisit' | 'status'>) => {
    if (editingPatient) {
      const payload: Partial<Patient> = {
        ...editingPatient,
        ...data,
      };
      const updated = await patientApi.update(editingPatient.id, payload);
      setPatients(patients.map((p) => (p.id === editingPatient.id ? { ...p, ...updated } : p)));
      if (viewingPatient?.id === editingPatient.id) {
        setViewingPatient({ ...viewingPatient, ...updated });
      }
    } else {
      const created = await patientApi.create({
        ...data,
        lastVisit: new Date().toISOString().split('T')[0],
        status: 'active',
      });
      setPatients([created, ...patients]);
    }
    setIsFormOpen(false);
    setEditingPatient(null);
  };

  const handleDelete = async (id: string) => {
    await patientApi.delete(id);
    setPatients(patients.filter((p) => p.id !== id));
    if (viewingPatient?.id === id) setViewingPatient(null);
  };

  const openEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setIsFormOpen(true);
  };

  const handleAddRecord = async (record: MedicalRecord) => {
    const saved = await medicalRecordApi.create(record);
    setRecords([saved, ...records]);
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-1">
            {patients.length} patients · {patients.filter((p) => p.status === 'active').length} active
          </p>
        </div>
        <Button onClick={() => { setEditingPatient(null); setIsFormOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="inpatient">In-Patient</SelectItem>
            <SelectItem value="outpatient">Outpatient</SelectItem>
            <SelectItem value="maternity">Maternity</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Patient grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((patient) => (
          <Card
            key={patient.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setViewingPatient(patient)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 leading-tight">{patient.name}</h3>
                    <p className="text-xs text-gray-500">{patient.age} yrs · {patient.gender}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                  patient.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {patient.status}
                </span>
              </div>

              <div className="mb-3">
                <TypeBadge type={patient.patientType} />
              </div>

              <div className="space-y-1.5 text-sm mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Droplet className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>{patient.bloodType}</span>
                  <span className="text-gray-300">·</span>
                  <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{patient.phone}</span>
                </div>
                {patient.patientType === 'inpatient' && patient.ward && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <BedDouble className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{patient.ward} · Room {patient.roomNumber}</span>
                  </div>
                )}
                {patient.patientType === 'outpatient' && patient.appointmentDate && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Appt: {patient.appointmentDate}</span>
                  </div>
                )}
                {patient.patientType === 'maternity' && patient.expectedDueDate && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Baby className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                    <span>EDD: {patient.expectedDueDate}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {records.filter((r) => r.patientId === patient.id).length} medical record(s)
                  </span>
                </div>
              </div>

              <div
                className="flex gap-2 pt-3 border-t"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openEdit(patient)}
                >
                  <Edit className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 hover:border-red-200"
                  onClick={() => handleDelete(patient.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400">
            <User className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No patients match your search.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setEditingPatient(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPatient ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
          </DialogHeader>
          <PatientForm
            initial={editingPatient ?? undefined}
            onSubmit={handleSave}
            onCancel={() => { setIsFormOpen(false); setEditingPatient(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!viewingPatient} onOpenChange={(open) => { if (!open) setViewingPatient(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Profile</DialogTitle>
          </DialogHeader>
          {viewingPatient && (
            <PatientDetail
              patient={viewingPatient}
              records={records}
              onAddRecord={handleAddRecord}
              onEdit={() => {
                setViewingPatient(null);
                openEdit(viewingPatient);
              }}
              onClose={() => setViewingPatient(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
