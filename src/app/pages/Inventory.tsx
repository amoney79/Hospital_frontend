import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Package,
  AlertTriangle,
  XCircle,
  DollarSign,
  Eye,
  Pencil,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { mockInventory, InventoryItem } from '../data/mockData';
import { inventoryApi } from '../services/api';

const CATEGORIES: InventoryItem['category'][] = [
  'Medications',
  'Surgical Supplies',
  'Equipment',
  'PPE',
  'Lab Supplies',
];

function deriveStatus(quantity: number, minStockLevel: number): InventoryItem['status'] {
  if (quantity === 0) return 'out-of-stock';
  if (quantity < minStockLevel) return 'low-stock';
  return 'in-stock';
}

function statusBadgeClass(status: InventoryItem['status']) {
  switch (status) {
    case 'in-stock':
      return 'bg-green-100 text-green-700';
    case 'low-stock':
      return 'bg-yellow-100 text-yellow-700';
    case 'out-of-stock':
      return 'bg-red-100 text-red-700';
  }
}

function statusLabel(status: InventoryItem['status']) {
  switch (status) {
    case 'in-stock':
      return 'In Stock';
    case 'low-stock':
      return 'Low Stock';
    case 'out-of-stock':
      return 'Out of Stock';
  }
}

type FormMode = 'add' | 'edit';

interface ItemFormProps {
  mode: FormMode;
  initial?: InventoryItem;
  onSubmit: (data: Omit<InventoryItem, 'id' | 'status'>) => void;
  onCancel: () => void;
}

function ItemForm({ mode, initial, onSubmit, onCancel }: ItemFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const quantity = Number(f.get('quantity'));
    const minStockLevel = Number(f.get('minStockLevel'));
    onSubmit({
      name: f.get('name') as string,
      sku: f.get('sku') as string,
      category: f.get('category') as InventoryItem['category'],
      quantity,
      minStockLevel,
      unitPrice: Number(f.get('unitPrice')),
      supplier: f.get('supplier') as string,
      expiryDate: f.get('expiryDate') as string,
      location: f.get('location') as string,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="name">Item Name</Label>
          <Input id="name" name="name" defaultValue={initial?.name} required />
        </div>
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" defaultValue={initial?.sku} required />
        </div>
        <div>
          <Label>Category</Label>
          <Select name="category" defaultValue={initial?.category ?? 'Medications'}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="0"
            defaultValue={initial?.quantity ?? 0}
            required
          />
        </div>
        <div>
          <Label htmlFor="minStockLevel">Min Stock Level</Label>
          <Input
            id="minStockLevel"
            name="minStockLevel"
            type="number"
            min="0"
            defaultValue={initial?.minStockLevel ?? 0}
            required
          />
        </div>
        <div>
          <Label htmlFor="unitPrice">Unit Price ($)</Label>
          <Input
            id="unitPrice"
            name="unitPrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={initial?.unitPrice ?? ''}
            required
          />
        </div>
        <div>
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input
            id="expiryDate"
            name="expiryDate"
            defaultValue={initial?.expiryDate ?? ''}
            placeholder="YYYY-MM-DD or N/A"
            required
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="supplier">Supplier</Label>
          <Input id="supplier" name="supplier" defaultValue={initial?.supplier} required />
        </div>
        <div className="col-span-2">
          <Label htmlFor="location">Storage Location</Label>
          <Input id="location" name="location" defaultValue={initial?.location} required />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{mode === 'add' ? 'Add Item' : 'Save Changes'}</Button>
      </div>
    </form>
  );
}

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [viewItem, setViewItem] = useState<InventoryItem | null>(null);
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState('');

  useEffect(() => {
    inventoryApi.getAll().then(setItems).catch(() => setItems(mockInventory));
  }, []);

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalItems = items.length;
  const lowStockCount = items.filter((i) => i.status === 'low-stock').length;
  const outOfStockCount = items.filter((i) => i.status === 'out-of-stock').length;
  const totalValue = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  const handleAdd = async (data: Omit<InventoryItem, 'id' | 'status'>) => {
    const created = await inventoryApi.create({
      ...data,
      status: deriveStatus(data.quantity, data.minStockLevel),
    });
    setItems([...items, created]);
    setIsAddOpen(false);
  };

  const handleEdit = async (data: Omit<InventoryItem, 'id' | 'status'>) => {
    if (!editItem) return;
    const updated = await inventoryApi.update(editItem.id, {
      ...data,
      status: deriveStatus(data.quantity, data.minStockLevel),
    });
    setItems(items.map((i) => (i.id === editItem.id ? { ...i, ...updated } : i)));
    setEditItem(null);
  };

  const handleRestock = async () => {
    if (!restockItem) return;
    const added = Number(restockQty);
    if (!added || added <= 0) return;
    const newQty = restockItem.quantity + added;
    const updated = await inventoryApi.updateQuantity(restockItem.id, newQty);
    setItems(
      items.map((i) => (i.id === restockItem.id ? { ...i, quantity: newQty, status: deriveStatus(newQty, i.minStockLevel), ...updated } : i))
    );
    setRestockItem(null);
    setRestockQty('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Inventory</h1>
          <p className="text-gray-600 mt-1">Manage medical supplies and equipment stock</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
            </DialogHeader>
            <ItemForm mode="add" onSubmit={handleAdd} onCancel={() => setIsAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-semibold mt-2 text-gray-900">{totalItems}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock Alerts</p>
                <p className="text-2xl font-semibold mt-2 text-yellow-600">{lowStockCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-50">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-2xl font-semibold mt-2 text-red-600">{outOfStockCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-semibold mt-2 text-green-600">
                  ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search by name, SKU, or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Item</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">SKU</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Qty / Min</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Unit Price</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Expiry</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No inventory items match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.supplier}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">{item.sku}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-semibold ${
                            item.status === 'out-of-stock'
                              ? 'text-red-600'
                              : item.status === 'low-stock'
                              ? 'text-yellow-600'
                              : 'text-gray-900'
                          }`}
                        >
                          {item.quantity}
                        </span>
                        <span className="text-gray-400 text-sm"> / {item.minStockLevel}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.expiryDate}</td>
                      <td className="px-6 py-4">
                        <Badge className={statusBadgeClass(item.status)}>
                          {statusLabel(item.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="View details"
                            onClick={() => setViewItem(item)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Edit item"
                            onClick={() => setEditItem(item)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Restock"
                            onClick={() => {
                              setRestockItem(item);
                              setRestockQty('');
                            }}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Item Dialog */}
      <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Item Details</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4 mt-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{viewItem.name}</h3>
                  <p className="text-sm font-mono text-gray-500 mt-0.5">{viewItem.sku}</p>
                </div>
                <Badge className={statusBadgeClass(viewItem.status)}>
                  {statusLabel(viewItem.status)}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Category', value: viewItem.category },
                  { label: 'Supplier', value: viewItem.supplier },
                  { label: 'Quantity', value: String(viewItem.quantity) },
                  { label: 'Min Stock Level', value: String(viewItem.minStockLevel) },
                  { label: 'Unit Price', value: `$${viewItem.unitPrice.toFixed(2)}` },
                  {
                    label: 'Total Value',
                    value: `$${(viewItem.quantity * viewItem.unitPrice).toFixed(2)}`,
                  },
                  { label: 'Expiry Date', value: viewItem.expiryDate },
                  { label: 'Location', value: viewItem.location },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs mb-1">{label}</p>
                    <p className="font-medium text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setViewItem(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          {editItem && (
            <ItemForm
              mode="edit"
              initial={editItem}
              onSubmit={handleEdit}
              onCancel={() => setEditItem(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog
        open={!!restockItem}
        onOpenChange={(open) => {
          if (!open) {
            setRestockItem(null);
            setRestockQty('');
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Restock Item</DialogTitle>
          </DialogHeader>
          {restockItem && (
            <div className="space-y-4 mt-2">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <p className="font-medium text-gray-900">{restockItem.name}</p>
                <div className="flex justify-between text-gray-600">
                  <span>Current stock:</span>
                  <span className="font-medium">{restockItem.quantity}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Min stock level:</span>
                  <span className="font-medium">{restockItem.minStockLevel}</span>
                </div>
              </div>
              <div>
                <Label htmlFor="restockQty">Quantity to Add</Label>
                <Input
                  id="restockQty"
                  type="number"
                  min="1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  placeholder="Enter quantity"
                  className="mt-1"
                />
              </div>
              {restockQty && Number(restockQty) > 0 && (
                <p className="text-sm text-gray-500">
                  New quantity will be{' '}
                  <span className="font-semibold text-gray-900">
                    {restockItem.quantity + Number(restockQty)}
                  </span>
                </p>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRestockItem(null);
                    setRestockQty('');
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleRestock} disabled={!restockQty || Number(restockQty) <= 0}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Restock
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
