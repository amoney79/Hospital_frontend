import { useEffect, useState } from 'react';
import { Search, FileText, PlusCircle, Download, Trash2 } from 'lucide-react';
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
    const datePrefix = reportType === 'daily' ? reportDate : selectedDate.slice(0, 7);

    // Count patients added to the specific date or month requested
    const matchingPatients = patients.filter((patient) => {
      const pDate = patient.createdAt || patient.admissionDate || patient.appointmentDate || patient.lastVisit || '';
      return reportType === 'daily'
        ? pDate.slice(0, 10) === reportDate
        : pDate.startsWith(datePrefix);
    });

    // Calculate revenue accurately for the specific date or month requested
    const matchingTransactions = transactions.filter((tx) => {
      const txDate = tx.date ? tx.date.slice(0, 10) : '';
      return reportType === 'daily'
        ? txDate === reportDate
        : txDate.startsWith(datePrefix);
    });

    const revenueCash = matchingTransactions
      .filter((tx) => tx.paymentMethod === 'Cash')
      .reduce((sum, tx) => sum + (tx.amountPaid || 0), 0);

    const revenueBank = matchingTransactions
      .filter((tx) => tx.paymentMethod !== 'Cash')
      .reduce((sum, tx) => sum + (tx.amountPaid || 0), 0);

    const totalRevenue = revenueCash + revenueBank;
    const expenditure = Math.round(totalRevenue * 0.38);
    const surplus = totalRevenue - expenditure;

    const generated: Omit<Report, 'id'> = {
      type: reportType,
      date: selectedDate,
      patients: matchingPatients.length,
      revenueCash,
      revenueBank,
      expenditure,
      surplus,
      comments: `Auto-generated ${reportType} report for ${selectedDate} (${matchingPatients.length} patients registered/visited)`,
      generatedAt: new Date().toISOString(),
    };

    const created = await reportApi.create(generated);
    setReports((current) => [created, ...current]);
    setIsDialogOpen(false);
  };

  const handleExport = (report: Report) => {
    const totalRev = report.revenueCash + report.revenueBank;
    const csvRows = [
      ['AFYACARE HOSPITAL SYSTEM - PERFORMANCE REPORT'],
      ['Report ID', report.id],
      ['Type', report.type.toUpperCase()],
      ['Target Date / Period', report.date],
      ['Generated On', report.generatedAt || new Date().toISOString()],
      [''],
      ['Metric', 'Amount / Count'],
      ['Patients Count (Target Date)', String(report.patients)],
      ['Revenue - Cash (KES)', String(report.revenueCash)],
      ['Revenue - Bank / M-Pesa (KES)', String(report.revenueBank)],
      ['Total Revenue (KES)', String(totalRev)],
      ['Operating Expenditure (KES)', String(report.expenditure)],
      ['Net Surplus (KES)', String(report.surplus)],
      ['Comments', `"${report.comments || ''}"`],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((row) => row.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hospital_Report_${report.type}_${report.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      await reportApi.delete(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Daily and monthly hospital performance summaries with accurate date tracking</p>
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
          <Card key={report.id} className="hover:shadow-lg transition-shadow flex flex-col justify-between">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div>
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
                  <ReportRow label="Patients Registered / Attended" value={String(report.patients)} />
                  <ReportRow label="Revenue (Cash)" value={formatCurrency(report.revenueCash)} />
                  <ReportRow label="Revenue (Bank / M-Pesa)" value={formatCurrency(report.revenueBank)} />
                  <ReportRow label="Expenditure" value={formatCurrency(report.expenditure)} />
                  <ReportRow label="Net Surplus" value={formatCurrency(report.surplus)} />
                </div>

                {report.comments && (
                  <p className="mt-3 text-xs text-gray-500 italic border-t pt-2">{report.comments}</p>
                )}

                {report.generatedAt ? (
                  <p className="mt-2 text-[11px] text-gray-400">Generated {new Date(report.generatedAt).toLocaleString()}</p>
                ) : null}
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleExport(report)}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => handleDelete(report.id)}>
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

function ReportRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}