import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { mockAppointments, mockPatients, mockDoctors, Appointment } from '../data/mockData';
import { appointmentApi } from '../services/api';

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    appointmentApi.getAll().then(setAppointments).catch(() => setAppointments(mockAppointments));
  }, []);

  const filteredAppointments = appointments.filter((appointment) =>
    appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const patientId = formData.get('patientId') as string;
    const doctorId = formData.get('doctorId') as string;
    const patient = mockPatients.find((p) => p.id === patientId);
    const doctor = mockDoctors.find((d) => d.id === doctorId);

    const appointmentData = {
      patientId,
      patientName: patient?.name || '',
      doctorId,
      doctorName: doctor?.name || '',
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      type: formData.get('type') as string,
      status: (editingAppointment ? editingAppointment.status : 'scheduled') as Appointment['status'],
      reason: formData.get('reason') as string,
    };

    if (editingAppointment) {
      const updated = await appointmentApi.update(editingAppointment.id, appointmentData);
      setAppointments(appointments.map((a) => (a.id === editingAppointment.id ? { ...a, ...updated } : a)));
    } else {
      const created = await appointmentApi.create(appointmentData);
      setAppointments([...appointments, created]);
    }
    
    setIsDialogOpen(false);
    setEditingAppointment(null);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await appointmentApi.delete(id);
    setAppointments(appointments.filter((a) => a.id !== id));
  };

  const handleStatusChange = async (id: string, status: Appointment['status']) => {
    await appointmentApi.updateStatus(id, status);
    setAppointments(appointments.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">Manage patient appointments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingAppointment(null);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAppointment} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientId">Patient</Label>
                  <Select name="patientId" defaultValue={editingAppointment?.patientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPatients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="doctorId">Doctor</Label>
                  <Select name="doctorId" defaultValue={editingAppointment?.doctorId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockDoctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" name="date" type="date" defaultValue={editingAppointment?.date} required />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" name="time" type="time" defaultValue={editingAppointment?.time} required />
                </div>
                <div>
                  <Label htmlFor="type">Appointment Type</Label>
                  <Select name="type" defaultValue={editingAppointment?.type || 'Check-up'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Check-up">Check-up</SelectItem>
                      <SelectItem value="Consultation">Consultation</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                      <SelectItem value="Treatment">Treatment</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="reason">Reason for Visit</Label>
                  <Textarea id="reason" name="reason" defaultValue={editingAppointment?.reason} rows={3} required />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAppointment ? 'Update' : 'Schedule'} Appointment
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
            placeholder="Search appointments by patient or doctor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="space-y-4">
        {filteredAppointments.map((appointment) => (
          <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <CalendarIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{appointment.patientName}</h3>
                        <p className="text-sm text-gray-600">{appointment.doctorName}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mt-3">
                      <div>
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium ml-2">{appointment.date}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium ml-2">{appointment.time}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium ml-2">{appointment.type}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <Select
                          value={appointment.status}
                          onValueChange={(value) => handleStatusChange(appointment.id, value as Appointment['status'])}
                        >
                          <SelectTrigger className="w-auto inline-flex h-auto py-0 px-2 ml-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="text-gray-600 text-sm">Reason:</span>
                      <p className="text-sm mt-1">{appointment.reason}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 md:flex-col">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(appointment)}
                  >
                    <Edit className="w-4 h-4 md:mr-0 mr-1" />
                    <span className="md:hidden">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(appointment.id)}
                  >
                    <Trash2 className="w-4 h-4 md:mr-0 mr-1" />
                    <span className="md:hidden">Delete</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
