import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Staff as StaffRecord, staffApi } from '../services/api';

export default function Staff() {
  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffRecord | null>(null);

  useEffect(() => { staffApi.getAll().then(setStaff); }, []);

  const filteredStaff = staff.filter((member) => member.name.toLowerCase().includes(searchTerm.toLowerCase()) || member.role.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      name: String(formData.get('name')), role: String(formData.get('role')), department: String(formData.get('department')),
      phone: String(formData.get('phone')), email: String(formData.get('email')), education: String(formData.get('education')),
      certifications: String(formData.get('certifications')).split(',').map((item) => item.trim()).filter(Boolean),
      experience: Number(formData.get('experience')), status: editingStaff?.status ?? 'active' as const,
    };
    const saved = editingStaff ? await staffApi.update(editingStaff.id, data) : await staffApi.create(data);
    setStaff((current) => editingStaff ? current.map((member) => member.id === editingStaff.id ? { ...member, ...saved } : member) : [...current, saved]);
    setIsDialogOpen(false);
    setEditingStaff(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8"><div><h1 className="text-3xl font-semibold text-gray-900">Hospital Staff</h1><p className="text-gray-600 mt-1">Manage all staff records</p></div><Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingStaff(null); }}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Staff</Button></DialogTrigger><DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editingStaff ? 'Edit Staff' : 'Add New Staff'}</DialogTitle></DialogHeader><StaffForm editingStaff={editingStaff} onSubmit={handleSubmit} /></DialogContent></Dialog></div>
      <div className="mb-6 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><Input placeholder="Search staff by name or role..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{filteredStaff.map((member) => <Card key={member.id}><CardContent className="p-6"><div className="flex items-start justify-between"><div><h3 className="font-semibold text-gray-900">{member.name}</h3><p className="text-sm text-blue-600">{member.role}</p><p className="text-sm text-gray-500">{member.department}</p></div><span className="text-xs rounded-full bg-green-100 text-green-700 px-2 py-1">{member.status}</span></div><div className="mt-4 text-sm text-gray-600 space-y-1"><p>{member.phone}</p><p>{member.email}</p><p>{member.experience} years experience</p></div><div className="mt-4 flex gap-2"><Button variant="outline" size="sm" onClick={() => { setEditingStaff(member); setIsDialogOpen(true); }}><Edit className="w-4 h-4 mr-1" />Edit</Button><Button variant="outline" size="sm" className="text-red-600" onClick={async () => { await staffApi.delete(member.id); setStaff((current) => current.filter((item) => item.id !== member.id)); }}><Trash2 className="w-4 h-4" /></Button></div></CardContent></Card>)}</div>
    </div>
  );
}

function StaffForm({ editingStaff, onSubmit }: { editingStaff: StaffRecord | null; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  return <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4 mt-4"><StaffInput id="name" label="Full Name" value={editingStaff?.name} /><StaffInput id="role" label="Role" value={editingStaff?.role} /><StaffInput id="department" label="Department" value={editingStaff?.department} /><StaffInput id="experience" label="Experience (years)" type="number" value={editingStaff?.experience} /><StaffInput id="phone" label="Phone" value={editingStaff?.phone} /><StaffInput id="email" label="Email" type="email" value={editingStaff?.email} /><StaffInput id="education" label="Education" value={editingStaff?.education} /><StaffInput id="certifications" label="Certifications (comma separated)" value={editingStaff?.certifications.join(', ')} /><div className="col-span-2 flex justify-end"><Button type="submit">{editingStaff ? 'Update Staff' : 'Add Staff'}</Button></div></form>;
}

function StaffInput({ id, label, value, type = 'text' }: { id: string; label: string; value?: string | number; type?: string }) {
  return <div><Label htmlFor={id}>{label}</Label><Input id={id} name={id} type={type} defaultValue={value} required className="mt-1" /></div>;
}