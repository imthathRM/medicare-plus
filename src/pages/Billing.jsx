import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  PlusCircle,
  Eye,
  CreditCard,
  Printer,
  Filter,
  Trash2,
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { DataTable } from '../components/common/DataTable';
import { SearchInput } from '../components/common/SearchInput';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { FormField, Input, Select } from '../components/common/FormField';
import { formatDate, formatLKR } from '../utils/formatters';

export const Billing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    invoices,
    patients,
    hospitalProfile,
    addInvoice,
    recordInvoicePayment,
  } = useHospitalData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(() => searchParams.get('action') === 'new');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceToPay, setInvoiceToPay] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // Form for New Invoice
  const [formData, setFormData] = useState(() => {
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 14);
    return {
      patientId: patients[0]?.id || '',
      department: 'Cardiology',
      dueDate: dueDate.toISOString().split('T')[0],
      items: [
        { id: 1, description: 'Specialist Consultation Fee', quantity: 1, unitPrice: 4500, amount: 4500 },
        { id: 2, description: 'ECG Diagnostic Test', quantity: 1, unitPrice: 3500, amount: 3500 },
      ],
      notes: 'Outpatient diagnostic invoice.',
    };
  });
  const [formErrors, setFormErrors] = useState({});

  const handleOpenAdd = useCallback(() => {
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 14);

    setFormData({
      patientId: patients[0]?.id || '',
      department: 'Cardiology',
      dueDate: dueDate.toISOString().split('T')[0],
      items: [
        { id: 1, description: 'Specialist Consultation Fee', quantity: 1, unitPrice: 4500, amount: 4500 },
        { id: 2, description: 'ECG Diagnostic Test', quantity: 1, unitPrice: 3500, amount: 3500 },
      ],
      notes: 'Outpatient diagnostic invoice.',
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  }, [patients]);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setSearchParams((prev) => {
        prev.delete('action');
        return prev;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.patientName.toLowerCase().includes(q) ||
        inv.id.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  const handleOpenView = (inv) => {
    setSelectedInvoice(inv);
    setIsViewModalOpen(true);
  };

  const handleOpenPayment = (inv) => {
    setInvoiceToPay(inv);
    const balance = inv.totalAmount - (inv.paidAmount || 0);
    setPaymentAmount(balance > 0 ? balance.toString() : '0');
    setPaymentMethod('Cash');
    setIsPaymentModalOpen(true);
  };

  const handleAddItemRow = () => {
    const nextId = formData.items.length + 1;
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { id: nextId, description: 'Clinical Service', quantity: 1, unitPrice: 1000, amount: 1000 },
      ],
    });
  };

  const handleRemoveItemRow = (index) => {
    if (formData.items.length === 1) return;
    const updated = formData.items.filter((_, idx) => idx !== index);
    setFormData({ ...formData, items: updated });
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    const item = { ...updated[index], [field]: value };

    if (field === 'quantity' || field === 'unitPrice') {
      const q = Number(field === 'quantity' ? value : item.quantity) || 0;
      const p = Number(field === 'unitPrice' ? value : item.unitPrice) || 0;
      item.amount = q * p;
    }

    updated[index] = item;
    setFormData({ ...formData, items: updated });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.patientId) {
      setFormErrors({ patientId: 'Please select a patient' });
      return;
    }

    const patient = patients.find((p) => p.id === formData.patientId);
    const total = calculateSubtotal();

    addInvoice({
      patientId: formData.patientId,
      patientName: patient?.name || 'Walk-in Patient',
      department: formData.department,
      dueDate: formData.dueDate,
      items: formData.items,
      subtotal: total,
      tax: 0,
      discount: 0,
      totalAmount: total,
      paidAmount: 0,
      status: 'Pending',
      paymentMethod: 'Unpaid',
      notes: formData.notes,
    });

    setIsAddModalOpen(false);
  };

  const handleRecordPayment = (e) => {
    e.preventDefault();
    const amount = Number(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    recordInvoicePayment(invoiceToPay.id, amount, paymentMethod);
    setIsPaymentModalOpen(false);
  };

  const columns = [
    {
      header: 'Invoice No.',
      key: 'invoiceNumber',
      render: (row) => (
        <div>
          <span className="font-mono text-xs font-bold text-[#1E3A5F] dark:text-[#F1F5F9]">{row.invoiceNumber}</span>
          <p className="text-[11px] text-[#64748B] dark:text-slate-400 font-mono">{row.id}</p>
        </div>
      ),
    },
    {
      header: 'Patient Reference',
      key: 'patientName',
      render: (row) => (
        <div>
          <p className="font-semibold text-[#1E3A5F] dark:text-[#F1F5F9] text-xs sm:text-sm">{row.patientName}</p>
          <span className="text-[11px] text-[#64748B] dark:text-slate-400 font-mono">{row.patientId}</span>
        </div>
      ),
    },
    {
      header: 'Invoice Date',
      key: 'date',
      render: (row) => (
        <div className="text-xs text-[#64748B] dark:text-[#CBD5E1] whitespace-nowrap">
          <p className="font-medium text-[#334155] dark:text-[#F1F5F9]">{formatDate(row.date)}</p>
          <span className="text-[10px] text-[#64748B] dark:text-slate-400">Due: {formatDate(row.dueDate)}</span>
        </div>
      ),
    },
    {
      header: 'Total Amount (LKR)',
      key: 'totalAmount',
      render: (row) => (
        <div>
          <span className="font-bold text-[#1E3A5F] dark:text-[#F1F5F9] text-xs sm:text-sm">
            {formatLKR(row.totalAmount)}
          </span>
          {row.paidAmount > 0 && row.paidAmount < row.totalAmount && (
            <p className="text-[11px] text-[#B45309] dark:text-[#FBBF24] font-medium">
              Paid: {formatLKR(row.paidAmount)}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <Badge status={row.status} size="sm" />,
    },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right actions-column',
      cellClassName: 'text-right actions-column',
      render: (row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleOpenView(row)}
            className="p-1.5 rounded-lg text-[#64748B] dark:text-[#CBD5E1] hover:text-[#2563EB] dark:hover:text-[#60A5FA] hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors"
            title="View Details / Print"
          >
            <Eye className="w-4 h-4" />
          </button>
          {row.status !== 'Paid' && (
            <button
              onClick={() => handleOpenPayment(row)}
              className="p-1.5 rounded-lg text-[#64748B] dark:text-[#CBD5E1] hover:text-[#15803D] dark:hover:text-[#4ADE80] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
              title="Record Payment"
            >
              <CreditCard className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1E3A5F] dark:text-[#F1F5F9] tracking-tight">Hospital Invoicing & Billing</h2>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#CBD5E1] mt-0.5">
            Generate patient billing invoices, process settlements (in LKR), and track insurance claims
          </p>
        </div>
        <Button variant="primary" leftIcon={PlusCircle} onClick={handleOpenAdd}>
          Create New Invoice
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#1E293B] p-4 rounded-lg border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by invoice #, patient, or ID..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-[#CBD5E1]">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-[#F7F9FC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-[#334155] rounded-lg px-3 py-2 text-[#334155] dark:text-[#F1F5F9] font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 dark:focus:ring-[#60A5FA]/20 focus:border-[#2563EB] dark:focus:border-[#60A5FA]"
          >
            <option value="ALL">All Invoices</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>

          {(searchQuery || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              className="text-xs text-[#2563EB] dark:text-[#60A5FA] hover:underline font-medium px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Invoices Data Table */}
      <DataTable
        columns={columns}
        data={filteredInvoices}
        pageSize={8}
        emptyTitle="No invoices found"
        emptyMessage="No billing records match your search query."
        onRowClick={handleOpenView}
      />

      {/* Modal: View Printable Invoice Details */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Patient Billing Statement"
        description="Official healthcare tax receipt and line-item breakdown"
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-400">All amounts in Sri Lankan Rupees (LKR)</span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                leftIcon={Printer}
                onClick={() => window.print()}
              >
                Print Statement
              </Button>
              <Button variant="primary" onClick={() => setIsViewModalOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        }
      >
        {selectedInvoice && (
          <div className="space-y-6 text-xs print-card p-1">
            {/* Invoice Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-[#334155] pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-[#F1F5F9] tracking-tight">
                  {hospitalProfile.name}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{hospitalProfile.address}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Hotline: {hospitalProfile.hotline} • Reg: {hospitalProfile.registrationNumber}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Tax ID: {hospitalProfile.taxId}</p>
              </div>
              <div className="text-right">
                <Badge status={selectedInvoice.status} size="md" />
                <p className="text-sm font-mono font-bold text-slate-900 dark:text-[#F1F5F9] mt-2">
                  {selectedInvoice.invoiceNumber}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">Issued: {formatDate(selectedInvoice.date)}</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">Due: {formatDate(selectedInvoice.dueDate)}</p>
              </div>
            </div>

            {/* Billed To */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-[#334155] flex justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Billed To (Patient)</p>
                <h4 className="text-sm font-bold text-slate-900 dark:text-[#F1F5F9] mt-0.5">{selectedInvoice.patientName}</h4>
                <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px] mt-0.5">Patient ID: {selectedInvoice.patientId}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Payment Method</p>
                <p className="text-slate-800 dark:text-[#CBD5E1] font-medium mt-0.5">{selectedInvoice.paymentMethod || 'Cash / Credit'}</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 dark:border-[#334155] rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/90 text-[11px] font-semibold text-slate-600 dark:text-[#CBD5E1] uppercase border-b border-slate-200 dark:border-[#334155]">
                  <tr>
                    <th className="px-4 py-2.5">Service Description</th>
                    <th className="px-4 py-2.5 text-center">Qty</th>
                    <th className="px-4 py-2.5 text-right">Unit Price</th>
                    <th className="px-4 py-2.5 text-right">Amount (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#334155]">
                  {selectedInvoice.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-[#F1F5F9]">{item.description}</td>
                      <td className="px-4 py-2.5 text-center text-slate-600 dark:text-[#CBD5E1]">{item.quantity}</td>
                      <td className="px-4 py-2.5 text-right text-slate-600 dark:text-[#CBD5E1]">{formatLKR(item.unitPrice)}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-900 dark:text-[#F1F5F9]">{formatLKR(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-[#CBD5E1]">
                  <span>Subtotal:</span>
                  <span className="font-medium text-slate-800 dark:text-[#F1F5F9]">{formatLKR(selectedInvoice.subtotal || selectedInvoice.totalAmount)}</span>
                </div>
                {selectedInvoice.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-[#4ADE80]">
                    <span>Discount:</span>
                    <span>-{formatLKR(selectedInvoice.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-[#F1F5F9] border-t border-slate-200 dark:border-[#334155] pt-2">
                  <span>Total Amount:</span>
                  <span className="text-sky-700 dark:text-[#60A5FA]">{formatLKR(selectedInvoice.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600 dark:text-[#CBD5E1]">
                  <span>Amount Settled:</span>
                  <span className="font-semibold text-emerald-700 dark:text-[#4ADE80]">{formatLKR(selectedInvoice.paidAmount || 0)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-rose-600 dark:text-[#F87171] border-t border-dashed border-slate-200 dark:border-[#334155] pt-1.5">
                  <span>Balance Due:</span>
                  <span>{formatLKR(Math.max(0, selectedInvoice.totalAmount - (selectedInvoice.paidAmount || 0)))}</span>
                </div>
              </div>
            </div>

            {selectedInvoice.notes && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic border-t border-slate-100 dark:border-[#334155] pt-3">
                Note: {selectedInvoice.notes}
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* Modal: Create New Invoice */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Patient Invoice"
        description="Add billable consultation, diagnostic, ward, or pharmacy line items."
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveAdd}>
              Save & Generate Invoice
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Select Patient" required error={formErrors.patientId}>
              <Select
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                error={!!formErrors.patientId}
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Payment Due Date">
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </FormField>
          </div>

          {/* Line items list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Billable Services & Items</label>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-xs text-sky-600 hover:text-sky-800 font-semibold cursor-pointer"
              >
                + Add Item
              </button>
            </div>

            {formData.items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-6">
                  <Input
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    placeholder="Service description"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    placeholder="Qty"
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                    placeholder="Rate"
                  />
                </div>
                <div className="col-span-1 text-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveItemRow(index)}
                    disabled={formData.items.length === 1}
                    className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-end pt-2 text-xs">
              <span className="font-bold text-slate-700 mr-2">Estimated Total:</span>
              <span className="font-extrabold text-slate-900">{formatLKR(calculateSubtotal())}</span>
            </div>
          </div>

          <FormField label="Internal Billing Memo">
            <Input
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Inpatient surgery settlement or insurance co-pay"
            />
          </FormField>
        </form>
      </Modal>

      {/* Modal: Record Payment (Demonstration Flow) */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Payment Settlement"
        description="Record payment receipt against outstanding invoice (Demonstration - No real cards charged)."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleRecordPayment}>
              Record Settlement
            </Button>
          </>
        }
      >
        <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-slate-500">Invoice: {invoiceToPay?.invoiceNumber}</p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{invoiceToPay?.patientName}</p>
            <p className="text-slate-700 mt-1">
              Total: {formatLKR(invoiceToPay?.totalAmount)} | Paid:{' '}
              {formatLKR(invoiceToPay?.paidAmount || 0)}
            </p>
          </div>

          <FormField label="Payment Amount (LKR)" required>
            <Input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
          </FormField>

          <FormField label="Payment Tender Method">
            <Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="Cash">Cash (Cashier Counter)</option>
              <option value="Credit Card (Visa/MasterCard)">Credit Card (Visa/MasterCard)</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Bank Transfer (Commercial Bank/HNB)">Bank Transfer</option>
              <option value="Insurance Claim Guarantee">Insurance Claim Guarantee</option>
            </Select>
          </FormField>
        </form>
      </Modal>
    </div>
  );
};
