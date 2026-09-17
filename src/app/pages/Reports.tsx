import { useEffect, useState } from 'react';
import { Search, FileText } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Report, reportApi } from '../services/api';

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { reportApi.getAll().then(setReports); }, []);

  const filteredReports = reports.filter((report) =>
    report.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">Daily & Monthly Financial Reports</p>
      </div>
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input placeholder="Search reports by date or type..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{report.type === 'daily' ? 'Daily Report' : 'Monthly Summary'}</h3>
                  <p className="text-sm text-gray-600">{report.date}</p>
                </div>
                <FileText className="w-5 h-5 text-gray-500" />
              </div>
              <div className="space-y-2 text-sm">
                <ReportRow label="Patients" value={String(report.patients)} />
                <ReportRow label="Revenue (Cash)" value={`KES ${report.revenueCash.toLocaleString()}`} />
                <ReportRow label="Revenue (Bank)" value={`KES ${report.revenueBank.toLocaleString()}`} />
                <ReportRow label="Expenditure" value={`KES ${report.expenditure.toLocaleString()}`} />
                <ReportRow label="Net Surplus" value={`KES ${report.surplus.toLocaleString()}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ReportRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-gray-600">{label}:</span><span className="font-medium">{value}</span></div>;
}