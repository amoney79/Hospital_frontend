import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { mockDoctors, Doctor } from '../data/mockData';
import { doctorApi } from '../services/api';

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    doctorApi.getAll().then(setDoctors).catch(() => setDoctors(mockDoctors));
  }, []);

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDoctor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const doctorData = {
      name: formData.get('name') as string,
      specialty: formData.get('specialty') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      department: formData.get('department') as string,
      experience: Number(formData.get('experience')),
      availability: formData.get('availability') as string,
      status: (editingDoctor ? editingDoctor.status : 'available') as 'available' | 'busy' | 'off-duty',
    };

    if (editingDoctor) {
      const updated = await doctorApi.update(editingDoctor.id, doctorData);
      setDoctors(doctors.map((d) => (d.id === editingDoctor.id ? { ...d, ...updated } : d)));
    } else {
      const created = await doctorApi.create(doctorData);
      setDoctors([...doctors, created]);
    }
    
    setIsDialogOpen(false);
    setEditingDoctor(null);
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await doctorApi.delete(id);
    setDoctors(doctors.filter((d) => d.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Doctors</h1>
          <p className="text-gray-600 mt-1">Manage medical staff</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingDoctor(null);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddDoctor} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" defaultValue={editingDoctor?.name} required />
                </div>
                <div>
                  <Label htmlFor="specialty">Specialty</Label>
                  <Input id="specialty" name="specialty" defaultValue={editingDoctor?.specialty} required />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" name="department" defaultValue={editingDoctor?.department} required />
                </div>
                <div>
                  <Label htmlFor="experience">Experience (years)</Label>
                  <Input id="experience" name="experience" type="number" defaultValue={editingDoctor?.experience} required />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" type="tel" defaultValue={editingDoctor?.phone} required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={editingDoctor?.email} required />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Input id="availability" name="availability" defaultValue={editingDoctor?.availability} placeholder="e.g., Mon-Fri, 9AM-5PM" required />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingDoctor ? 'Update' : 'Add'} Doctor
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search doctors by name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{doctor.name}</h3>
                  <p className="text-sm text-gray-600">{doctor.specialty}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  doctor.status === 'available' 
                    ? 'bg-green-100 text-green-700'
                    : doctor.status === 'busy'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {doctor.status}
                </span>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium">{doctor.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Experience:</span>
                  <span className="font-medium">{doctor.experience} years</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{doctor.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium truncate">{doctor.email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-600 flex-shrink-0">Availability:</span>
                  <span className="font-medium">{doctor.availability}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(doctor)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(doctor.id)}
                >
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
