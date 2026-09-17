import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, UserCog, BriefcaseBusiness } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Staff as StaffRecord, staffApi } from '../services/api';

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  probation: 'bg-amber-100 text-amber-700',
  retired: 'bg-slate-200 text-slate-700',
  terminated: 'bg-red-100 text-red-700',
};

export default function Staff() {
  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffRecord | null>(null);

  useEffect(() => {
    void staffApi.getAll().then(setStaff);
  }, []);

  const filteredStaff = staff.filter((member) => {
    const haystack = `${member.name} ${member.role} ${member.department} ${member.jobTitle}`.toLowerCase();
    return haystack.includes(searchTerm.toLowerCase());
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const data: Omit<StaffRecord, 'id'> = {
      name: String(formData.get('name') ?? ''),
      dob: String(formData.get('dob') ?? ''),
      gender: String(formData.get('gender') ?? 'Male'),
      nationalId: String(formData.get('nationalId') ?? ''),
      role: String(formData.get('role') ?? ''),
      department: String(formData.get('department') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      email: String(formData.get('email') ?? ''),
      address: String(formData.get('address') ?? ''),
      emergencyContact: String(formData.get('emergencyContact') ?? ''),
      jobTitle: String(formData.get('jobTitle') ?? ''),
      employmentType: String(formData.get('employmentType') ?? 'Full-time'),
      hireDate: String(formData.get('hireDate') ?? ''),
      employmentStatus: String(formData.get('employmentStatus') ?? 'Permanent'),
      shiftSchedule: String(formData.get('shiftSchedule') ?? 'Day'),
      education: String(formData.get('education') ?? ''),
      certifications: parseCsv(formData.get('certifications')),
      training: String(formData.get('training') ?? ''),
      skills: parseCsv(formData.get('skills')),
      languages: parseCsv(formData.get('languages')),
      licenseNumber: String(formData.get('licenseNumber') ?? ''),
      backgroundCheck: String(formData.get('backgroundCheck') ?? 'Cleared'),
      medicalClearance: String(formData.get('medicalClearance') ?? ''),
      immunizationRecords: String(formData.get('immunizationRecords') ?? ''),
      workPermit: String(formData.get('workPermit') ?? ''),
      experience: Number(formData.get('experience') ?? 0),
      status: (String(formData.get('status') ?? editingStaff?.status ?? 'active') as StaffRecord['status']),
    };

    const saved = editingStaff
      ? await staffApi.update(editingStaff.id, data)
      : await staffApi.create(data);

    setStaff((current) => {
      if (editingStaff) {
        return current.map((member) => (member.id === editingStaff.id ? { ...member, ...saved } : member));
      }
      return [saved, ...current];
    });

    setIsDialogOpen(false);
    setEditingStaff(null);
    event.currentTarget.reset();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Hospital Staff</h1>
          <p className="text-gray-600 mt-1">Manage all staff records and compliance details</p>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingStaff(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
            </DialogHeader>
            <StaffForm editingStaff={editingStaff} onSubmit={handleSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search by name, role, department or title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStaff.map((member) => (
          <Card key={member.id} className="shadow-sm border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <UserCog className="w-4 h-4 text-blue-600" />
                    <h3 className="font-semibold text-gray-900 truncate">{member.name}</h3>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">{member.role}</p>
                  <p className="text-xs text-gray-500 mt-1">{member.department}</p>
                </div>
                <span className={`text-[10px] rounded-full px-2 py-1 font-medium ${statusStyles[member.status] ?? 'bg-slate-100 text-slate-700'}`}>
                  {member.status}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p><span className="font-medium text-gray-700">Job:</span> {member.jobTitle}</p>
                <p><span className="font-medium text-gray-700">Phone:</span> {member.phone}</p>
                <p><span className="font-medium text-gray-700">Email:</span> {member.email}</p>
                <p><span className="font-medium text-gray-700">Experience:</span> {member.experience} years</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => { setEditingStaff(member); setIsDialogOpen(true); }}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-600" onClick={async () => { await staffApi.delete(member.id); setStaff((current) => current.filter((item) => item.id !== member.id)); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StaffForm({
  editingStaff,
  onSubmit,
}: {
  editingStaff: StaffRecord | null;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <StaffInput id="name" label="Full Name" value={editingStaff?.name} required />
      <StaffInput id="dob" label="Date of Birth" type="date" value={editingStaff?.dob} />
      <div>
        <Label htmlFor="gender">Gender</Label>
        <select id="gender" name="gender" defaultValue={editingStaff?.gender ?? 'Male'} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <StaffInput id="nationalId" label="National ID" value={editingStaff?.nationalId} />
      <div>
        <Label htmlFor="role">Role</Label>
        <select id="role" name="role" defaultValue={editingStaff?.role ?? 'Doctor'} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <option value="Administrator">Administrator</option>
          <option value="Doctor">Doctor</option>
          <option value="Nurse">Nurse</option>
          <option value="Lab Technician">Lab Technician</option>
          <option value="Receptionist">Receptionist</option>
          <option value="Pharmacist">Pharmacist</option>
          <option value="Accountant">Accountant</option>
        </select>
      </div>
      <StaffInput id="department" label="Department" value={editingStaff?.department} required />
      <StaffInput id="jobTitle" label="Job Title" value={editingStaff?.jobTitle} required />
      <div>
        <Label htmlFor="employmentType">Employment Type</Label>
        <select id="employmentType" name="employmentType" defaultValue={editingStaff?.employmentType ?? 'Full-time'} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
        </select>
      </div>
      <StaffInput id="hireDate" label="Hire Date" type="date" value={editingStaff?.hireDate} />
      <div>
        <Label htmlFor="employmentStatus">Employment Status</Label>
        <select id="employmentStatus" name="employmentStatus" defaultValue={editingStaff?.employmentStatus ?? 'Permanent'} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <option value="Permanent">Permanent</option>
          <option value="Temporary">Temporary</option>
          <option value="Contract">Contract</option>
          <option value="Intern">Intern</option>
        </select>
      </div>
      <div>
        <Label htmlFor="shiftSchedule">Shift Schedule</Label>
        <select id="shiftSchedule" name="shiftSchedule" defaultValue={editingStaff?.shiftSchedule ?? 'Day'} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <option value="Day">Day</option>
          <option value="Night">Night</option>
          <option value="Rotating">Rotating</option>
          <option value="On-call">On-call</option>
        </select>
      </div>
      <StaffInput id="phone" label="Phone" value={editingStaff?.phone} required />
      <StaffInput id="email" label="Email" type="email" value={editingStaff?.email} required />
      <div className="md:col-span-2">
        <StaffTextarea id="address" label="Address" value={editingStaff?.address} required />
      </div>
      <StaffInput id="emergencyContact" label="Emergency Contact" value={editingStaff?.emergencyContact} required />
      <StaffInput id="education" label="Education" value={editingStaff?.education} />
      <StaffInput id="certifications" label="Certifications" value={editingStaff?.certifications?.join(', ')} />
      <StaffInput id="training" label="Training" value={editingStaff?.training} />
      <StaffInput id="skills" label="Skills" value={editingStaff?.skills?.join(', ')} />
      <StaffInput id="languages" label="Languages" value={editingStaff?.languages?.join(', ')} />
      <StaffInput id="licenseNumber" label="License Number" value={editingStaff?.licenseNumber ?? ''} />
      <StaffInput id="backgroundCheck" label="Background Check" value={editingStaff?.backgroundCheck ?? 'Cleared'} />
      <StaffInput id="medicalClearance" label="Medical Clearance" value={editingStaff?.medicalClearance ?? ''} />
      <StaffInput id="immunizationRecords" label="Immunization Records" value={editingStaff?.immunizationRecords ?? ''} />
      <StaffInput id="workPermit" label="Work Permit" value={editingStaff?.workPermit ?? ''} />
      <StaffInput id="experience" label="Experience (years)" type="number" value={editingStaff?.experience ?? 0} />
      <div>
        <Label htmlFor="status">Status</Label>
        <select id="status" name="status" defaultValue={editingStaff?.status ?? 'active'} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <option value="active">Active</option>
          <option value="probation">Probation</option>
          <option value="retired">Retired</option>
          <option value="terminated">Terminated</option>
        </select>
      </div>

      <div className="md:col-span-2 flex justify-end mt-2">
        <Button type="submit">{editingStaff ? 'Update Staff' : 'Add Staff'}</Button>
      </div>
    </form>
  );
}

function StaffInput({
  id,
  label,
  value,
  type = 'text',
  required = false,
}: {
  id: string;
  label: string;
  value?: string | number;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} type={type} defaultValue={value ?? ''} required={required} className="mt-1" />
    </div>
  );
}

function StaffTextarea({
  id,
  label,
  value,
  required = false,
}: {
  id: string;
  label: string;
  value?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Textarea id={id} name={id} defaultValue={value ?? ''} required={required} className="mt-1 min-h-[100px]" />
    </div>
  );
}

function parseCsv(value: FormDataEntryValue | null | undefined) {
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
