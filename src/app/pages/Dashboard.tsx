import { useState, useEffect } from 'react';
import { Users, Calendar, Activity, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { mockPatients, mockDoctors, mockAppointments, mockTransactions } from '../data/mockData';
import { dashboardApi, DashboardStats } from '../services/api';

export default function Dashboard() {
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);

  useEffect(() => {
    dashboardApi.getStats().then(setStatsData).catch(() => setStatsData(null));
  }, []);

  const totalPatients = statsData?.totalPatients ?? mockPatients.length;
  const availableDoctors = statsData?.doctorsOnDuty ?? mockDoctors.filter((d) => d.status === 'available').length;
  const todayAppointments = statsData?.appointmentsToday ?? mockAppointments.length;
  const totalRevenue = statsData?.totalRevenue ?? mockTransactions.filter((t) => t.status === 'paid').reduce((sum, t) => sum + t.amount, 0);

  const stats = [
    {
      title: 'Total Patients',
      value: totalPatients,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Available Doctors',
      value: availableDoctors,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: "Today's Appointments",
      value: todayAppointments,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total Revenue',
      value: `${totalRevenue.toFixed(0)}`,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const recentAppointments = mockAppointments.slice(0, 3);
  const recentTransactions = mockTransactions.slice(0, 4);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to TibaCare Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-semibold mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{appointment.patientName}</p>
                    <p className="text-sm text-gray-600">{appointment.doctorName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                        appointment.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-700'
                          : appointment.status === 'in-progress'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{transaction.patientName}</p>
                    <p className="text-sm text-gray-600">{transaction.serviceType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Ksh{transaction.amount.toFixed(2)}</p>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                        transaction.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : transaction.status === 'partial'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}