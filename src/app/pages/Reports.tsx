import { useEffect, useState } from 'react';
import { Search, FileText, PlusCircle, Download } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { patientApi, reportApi, transactionApi, type Report } from '../services/api';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(value);
}

function toMonthKey(value: string) {
  if (!value) return '';
  return new Date(`${value}-01T00:00:00`).toISOString().slice(0, 7);
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reportType, setReportType] = useState<'daily' | 'monthly'>('daily');
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    void reportApi.getAll().then(setReports);
  }, []);

  const filteredReports = reports.filter((report) => {
    const haystack = `${report.date} ${report.type}`.toLowerCase();
    return haystack.includes(searchTerm.toLowerCase());
  });

  const handleGenerate = async () => {
    const [patients, transactions] = await Promise.all([
      patientApi.getAll(),
      transactionApi.getAll(),
    ]);

    const selectedDate = reportType === 'daily' ? reportDate : toMonthKey(reportDate);
    const revenueCash = transactions
      .filter((tx) => {
        const txDate = tx.date.slice(0, 10);
        return reportType === 'daily' ? txDate === reportDate : tx.date.startsWith(selectedDate.slice(0, 7));
      })
      .filter((tx) => tx.paymentMethod === 'Cash')
      .reduce((sum, tx) => sum + tx.amountPaid, 0);

    const revenueBank = transactions
      .filter((tx) => {
        const txDate = tx.date.slice(0, 10);
        return reportType === 'daily' ? txDate === reportDate : tx.date.startsWith(selectedDate.slice(0, 7));
      })
      .filter((tx) => tx.paymentMethod !== 'Cash')
      .reduce((sum, tx) => sum + tx.amountPaid, 0);

    const expenditure = Math.round((revenueCash + revenueBank) * 0.38);
    const surplus = revenueCash + revenueBank - expenditure;

    const generated: Omit<Report, 'id'> = {
      type: reportType,
      date: selectedDate,
      patients: patients.length,
      revenueCash,
      revenueBank,
      expenditure,
      surplus,
      comments: `Auto-generated ${reportType} report for ${selectedDate}`,
      generatedAt: new Date().toISOString(),
    };

    const created = await reportApi.create(generated);
    setReports((current) => [created, ...current]);
    setIsDialogOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Daily and monthly hospital performance summaries</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Generate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Generate Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="reportType">Report Type</Label>
                <select
                  id="reportType"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as 'daily' | 'monthly')}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <Label htmlFor="reportDate">Date</Label>
                <Input
                  id="reportDate"
                  type={reportType === 'daily' ? 'date' : 'month'}
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleGenerate}>
                  Save Report
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search reports by date or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{report.type === 'daily' ? 'Daily Report' : 'Monthly Summary'}</h3>
                  <p className="text-sm text-gray-600">{report.date}</p>
                </div>
                <div className="rounded-full bg-slate-100 p-2">
                  <FileText className="w-5 h-5 text-gray-500" />
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <ReportRow label="Patients" value={String(report.patients)} />
                <ReportRow label="Revenue (Cash)" value={formatCurrency(report.revenueCash)} />
                <ReportRow label="Revenue (Bank)" value={formatCurrency(report.revenueBank)} />
                <ReportRow label="Expenditure" value={formatCurrency(report.expenditure)} />
                <ReportRow label="Net Surplus" value={formatCurrency(report.surplus)} />
              </div>

              {report.generatedAt ? (
                <p className="mt-4 text-[11px] text-gray-500">Generated {new Date(report.generatedAt).toLocaleString()}</p>
              ) : null}

              <Button variant="outline" size="sm" className="mt-4 w-full">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ReportRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}