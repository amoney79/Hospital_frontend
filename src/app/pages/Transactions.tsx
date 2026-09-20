import { useState, useEffect } from 'react';
import { Plus, Search, Wallet, Download, Eye } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { mockTransactions, mockPatients, Transaction } from '../data/mockData';
import { Badge } from '../components/ui/badge';
import { transactionApi } from '../services/api';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentTransaction, setPaymentTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    transactionApi.getAll().then(setTransactions).catch(() => setTransactions(mockTransactions));
  }, []);

  const filteredTransactions = transactions.filter((transaction) =>
    transaction.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const patientId = formData.get('patientId') as string;
    const patient = mockPatients.find((p) => p.id === patientId);

    const transactionData = {
      invoiceNumber: `INV-2026-${String(transactions.length + 1).padStart(3, '0')}`,
      patientId,
      patientName: patient?.name || '',
      date: formData.get('date') as string,
      dueDate: formData.get('dueDate') as string,
      serviceType: formData.get('serviceType') as string,
      description: formData.get('description') as string,
      amount: Number(formData.get('amount')),
      amountPaid: 0,
      paymentMethod: 'Cash' as Transaction['paymentMethod'],
      status: 'pending' as Transaction['status'],
    };

    const created = await transactionApi.create(transactionData);
    setTransactions([...transactions, created]);
    setIsDialogOpen(false);
  };

  const handleProcessPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!paymentTransaction) return;

    const formData = new FormData(e.currentTarget);
    const paymentAmount = Number(formData.get('paymentAmount'));
    const paymentMethod = formData.get('paymentMethod') as Transaction['paymentMethod'];

    const updated = await transactionApi.recordPayment(paymentTransaction.id, paymentAmount, paymentMethod);

    setTransactions(transactions.map((t) => (t.id === paymentTransaction.id ? { ...t, ...updated } : t)));
    setIsPaymentDialogOpen(false);
    setPaymentTransaction(null);
  };

  const totalRevenue = transactions
    .filter((t) => t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingAmount = transactions
    .filter((t) => t.status === 'pending' || t.status === 'partial')
    .reduce((sum, t) => sum + (t.amount - t.amountPaid), 0);

  const overdueAmount = transactions
    .filter((t) => t.status === 'overdue')
    .reduce((sum, t) => sum + (t.amount - t.amountPaid), 0);

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'partial':
        return 'bg-blue-100 text-blue-700';
      case 'overdue':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Manage billing and payments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTransaction} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientId">Patient</Label>
                  <Select name="patientId" required>
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
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Input id="serviceType" name="serviceType" required />
                </div>
                <div>
                  <Label htmlFor="date">Invoice Date</Label>
                  <Input id="date" name="date" type="date" required />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" name="dueDate" type="date" required />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="amount">Amount (Ksh)</Label>
                  <Input id="amount" name="amount" type="number" step="0.01" required />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" rows={3} required />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Invoice</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold mt-2 text-green-600">
                  Ksh {totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <Wallet className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Payments</p>
                <p className="text-2xl font-semibold mt-2 text-yellow-600">
                  Ksh {pendingAmount.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50">
                <Wallet className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-semibold mt-2 text-red-600">
                  Ksh {overdueAmount.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-50">
                <Wallet className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search by patient, invoice number, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Invoice</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Patient</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Service</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Due Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Paid</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-blue-600">{transaction.invoiceNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">{transaction.patientName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-900">{transaction.serviceType}</p>
                        <p className="text-sm text-gray-500">{transaction.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{transaction.date}</td>
                    <td className="px-6 py-4 text-gray-600">{transaction.dueDate}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      Ksh {transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      Ksh {transaction.amountPaid.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {transaction.status !== 'paid' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPaymentTransaction(transaction);
                              setIsPaymentDialogOpen(true);
                            }}
                          >
                            <Wallet className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Transaction Dialog */}
      <Dialog open={!!selectedTransaction} onOpenChange={(open) => !open && setSelectedTransaction(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Invoice Number</Label>
                  <p className="font-medium text-blue-600">{selectedTransaction.invoiceNumber}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedTransaction.status)}>
                    {selectedTransaction.status}
                  </Badge>
                </div>
                <div>
                  <Label>Patient</Label>
                  <p className="font-medium">{selectedTransaction.patientName}</p>
                </div>
                <div>
                  <Label>Service Type</Label>
                  <p className="font-medium">{selectedTransaction.serviceType}</p>
                </div>
                <div>
                  <Label>Invoice Date</Label>
                  <p className="font-medium">{selectedTransaction.date}</p>
                </div>
                <div>
                  <Label>Due Date</Label>
                  <p className="font-medium">{selectedTransaction.dueDate}</p>
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <p className="font-medium">{selectedTransaction.paymentMethod}</p>
                </div>
                <div>
                  <Label>Amount</Label>
                  <p className="text-lg font-semibold">Ksh {selectedTransaction.amount.toFixed(2)}</p>
                </div>
                <div>
                  <Label>Amount Paid</Label>
                  <p className="text-lg font-semibold text-green-600">
                    Ksh {selectedTransaction.amountPaid.toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label>Balance Due</Label>
                  <p className="text-lg font-semibold text-red-600">
                    Ksh {(selectedTransaction.amount - selectedTransaction.amountPaid).toFixed(2)}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <p className="text-gray-700">{selectedTransaction.description}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedTransaction(null)}>
                  Close
                </Button>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Download Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
          </DialogHeader>
          {paymentTransaction && (
            <form onSubmit={handleProcessPayment} className="space-y-4 mt-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice:</span>
                  <span className="font-medium">{paymentTransaction.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Patient:</span>
                  <span className="font-medium">{paymentTransaction.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium">Ksh {paymentTransaction.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Already Paid:</span>
                  <span className="font-medium text-green-600">Ksh {paymentTransaction.amountPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-900 font-medium">Balance Due:</span>
                  <span className="font-semibold text-red-600">
                    Ksh {(paymentTransaction.amount - paymentTransaction.amountPaid).toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="paymentAmount">Payment Amount (Ksh)</Label>
                <Input
                  id="paymentAmount"
                  name="paymentAmount"
                  type="number"
                  step="0.01"
                  max={paymentTransaction.amount - paymentTransaction.amountPaid}
                  required
                />
              </div>

              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select name="paymentMethod" defaultValue="Cash">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Debit Card">Debit Card</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsPaymentDialogOpen(false);
                    setPaymentTransaction(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Process Payment</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
