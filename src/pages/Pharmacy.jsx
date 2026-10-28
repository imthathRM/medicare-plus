import React, { useState, useMemo } from 'react';
import {
  PlusCircle,
  Eye,
  Edit2,
  Trash2,
  Filter,
  Boxes,
} from 'lucide-react';
import { useHospitalData } from '../context/HospitalDataContext';
import { DataTable } from '../components/common/DataTable';
import { SearchInput } from '../components/common/SearchInput';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { FormField, Input, Select } from '../components/common/FormField';
import { formatDate, formatLKR } from '../utils/formatters';
import { validateRequired, validateNumber } from '../utils/validators';

export const Pharmacy = () => {
  const { medicines, addMedicine, updateMedicine, adjustStock, deleteMedicine } = useHospitalData();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockLevelFilter, setStockLevelFilter] = useState('ALL'); // 'ALL' | 'LOW'

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [medicineToDelete, setMedicineToDelete] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState(10);
  const [adjustType, setAdjustType] = useState('add'); // 'add' | 'remove'

  // Form
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: 'Antibiotics',
    dosage: '',
    form: 'Tablet',
    quantity: 500,
    minThreshold: 100,
    unitPrice: 50,
    expiryDate: '2027-12-31',
    manufacturer: 'SPMC',
    batchNumber: 'BATCH-001',
    storageLocation: 'Pharmacy Bay A',
  });
  const [formErrors, setFormErrors] = useState({});

  const categories = useMemo(() => {
    const set = new Set(medicines.map((m) => m.category));
    return Array.from(set);
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        med.name.toLowerCase().includes(q) ||
        med.genericName.toLowerCase().includes(q) ||
        med.id.toLowerCase().includes(q) ||
        med.category.toLowerCase().includes(q);

      const matchesCat = categoryFilter === 'ALL' || med.category === categoryFilter;
      const isLow = med.quantity <= med.minThreshold;
      const matchesStock =
        stockLevelFilter === 'ALL' || (stockLevelFilter === 'LOW' && isLow);

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [medicines, searchQuery, categoryFilter, stockLevelFilter]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      genericName: '',
      category: 'Antibiotics',
      dosage: '',
      form: 'Tablet',
      quantity: 500,
      minThreshold: 100,
      unitPrice: 50,
      expiryDate: '2027-12-31',
      manufacturer: 'State Pharmaceuticals Manufacturing Corp',
      batchNumber: `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
      storageLocation: 'Pharmacy Bay A-1',
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (med) => {
    setSelectedMedicine(med);
    setFormData({
      name: med.name,
      genericName: med.genericName,
      category: med.category,
      dosage: med.dosage,
      form: med.form,
      quantity: med.quantity,
      minThreshold: med.minThreshold,
      unitPrice: med.unitPrice,
      expiryDate: med.expiryDate,
      manufacturer: med.manufacturer,
      batchNumber: med.batchNumber,
      storageLocation: med.storageLocation,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleOpenView = (med) => {
    setSelectedMedicine(med);
    setIsViewModalOpen(true);
  };

  const handleOpenAdjust = (med) => {
    setSelectedMedicine(med);
    setAdjustAmount(20);
    setAdjustType('add');
    setIsAdjustModalOpen(true);
  };

  const handleOpenDelete = (med) => {
    setMedicineToDelete(med);
    setIsDeleteConfirmOpen(true);
  };

  const validate = () => {
    const errs = {};
    const nameErr = validateRequired(formData.name, 'Medicine name');
    if (nameErr) errs.name = nameErr;

    const qtyErr = validateNumber(formData.quantity, 'Quantity', 0);
    if (qtyErr) errs.quantity = qtyErr;

    const minErr = validateNumber(formData.minThreshold, 'Reorder threshold', 1);
    if (minErr) errs.minThreshold = minErr;

    const priceErr = validateNumber(formData.unitPrice, 'Unit price', 0);
    if (priceErr) errs.unitPrice = priceErr;

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!validate()) return;
    addMedicine(formData);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    updateMedicine(selectedMedicine.id, formData);
    setIsEditModalOpen(false);
  };

  const handleSaveAdjust = (e) => {
    e.preventDefault();
    const qty = Number(adjustAmount);
    if (isNaN(qty) || qty <= 0) return;
    const delta = adjustType === 'add' ? qty : -qty;
    adjustStock(selectedMedicine.id, delta);
    setIsAdjustModalOpen(false);
  };

  const columns = [
    {
      header: 'Medicine & Generic',
      key: 'name',
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">{row.name}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">{row.genericName}</span>
        </div>
      ),
    },
    {
      header: 'Category & Form',
      key: 'category',
      render: (row) => (
        <div>
          <span className="font-medium text-slate-800 dark:text-slate-200 text-xs">{row.category}</span>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">{row.form} ({row.dosage})</p>
        </div>
      ),
    },
    {
      header: 'Available Stock',
      key: 'quantity',
      render: (row) => {
        const isLow = row.quantity <= row.minThreshold;
        return (
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-xs sm:text-sm ${isLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                {row.quantity} units
              </span>
              {isLow && <Badge status="Low Stock" size="sm" />}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Min: {row.minThreshold}</span>
          </div>
        );
      },
    },
    {
      header: 'Unit Price (LKR)',
      key: 'unitPrice',
      render: (row) => (
        <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">{formatLKR(row.unitPrice)}</span>
      ),
    },
    {
      header: 'Expiry Date',
      key: 'expiryDate',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">{formatDate(row.expiryDate)}</span>
      ),
    },
    {
      header: 'Location',
      key: 'storageLocation',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md font-mono">
          {row.storageLocation}
        </span>
      ),
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
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 dark:hover:bg-blue-950/40 dark:text-slate-400 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenAdjust(row)}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F766E] hover:bg-teal-50 dark:hover:bg-teal-950/40 dark:text-slate-400 transition-colors"
            title="Adjust Stock Quantity"
          >
            <Boxes className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
            title="Edit Item"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenDelete(row)}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#B91C1C] hover:bg-red-50 dark:hover:bg-red-950/40 dark:text-slate-400 transition-colors"
            title="Remove from Catalog"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1E3A5F] dark:text-[#F1F5F9] tracking-tight">
            Pharmacy & Inventory Management
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#CBD5E1] mt-0.5">
            Monitor dispensary stock levels, critical thresholds, batch expirations, and unit pricing
          </p>
        </div>
        <Button variant="primary" leftIcon={PlusCircle} onClick={handleOpenAdd}>
          Add Medicine Item
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#1E293B] p-4 rounded-lg border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by brand name, generic, or category..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-[#CBD5E1]">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-[#F7F9FC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-[#334155] rounded-lg px-3 py-2 text-[#334155] dark:text-[#F1F5F9] font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
          >
            <option value="ALL">All Therapeutic Classes</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={stockLevelFilter}
            onChange={(e) => setStockLevelFilter(e.target.value)}
            className="text-xs bg-[#F7F9FC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-[#334155] rounded-lg px-3 py-2 text-[#334155] dark:text-[#F1F5F9] font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="LOW">Low Stock Alerts Only</option>
          </select>

          {(searchQuery || categoryFilter !== 'ALL' || stockLevelFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('ALL');
                setStockLevelFilter('ALL');
              }}
              className="text-xs text-[#2563EB] dark:text-blue-400 hover:text-[#1D4ED8] dark:hover:text-blue-300 font-medium px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Pharmacy Data Table */}
      <DataTable
        columns={columns}
        data={filteredMedicines}
        pageSize={8}
        emptyTitle="No medicine items found"
        emptyMessage="No catalog items match your search and filter criteria."
        onRowClick={handleOpenView}
      />

      {/* Modal: Add Medicine */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Medicine / Stock Item"
        description="Catalog a new clinical medication or hospital consumable."
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveAdd}>
              Save to Catalog
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Brand / Trade Name" required error={formErrors.name}>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Atorvastatin 20mg"
                error={!!formErrors.name}
              />
            </FormField>

            <FormField label="Generic Chemical Name">
              <Input
                value={formData.genericName}
                onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                placeholder="e.g. Atorvastatin Calcium"
              />
            </FormField>

            <FormField label="Category / Class">
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Antibiotics">Antibiotics</option>
                <option value="Analgesics">Analgesics & Antipyretics</option>
                <option value="Cardiovascular">Cardiovascular</option>
                <option value="Respiratory">Respiratory</option>
                <option value="Endocrinology">Endocrinology & Diabetes</option>
                <option value="Gastrointestinal">Gastrointestinal</option>
                <option value="Dermatological">Dermatological</option>
              </Select>
            </FormField>

            <FormField label="Dosage & Strength">
              <Input
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="e.g. 500 mg or 10 mg/mL"
              />
            </FormField>

            <FormField label="Dosage Form">
              <Select
                value={formData.form}
                onChange={(e) => setFormData({ ...formData, form: e.target.value })}
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup</option>
                <option value="Injection">Injection</option>
                <option value="IV Infusion">IV Infusion</option>
                <option value="Inhaler">Inhaler</option>
                <option value="Ointment">Ointment / Cream</option>
              </Select>
            </FormField>

            <FormField label="Unit Retail Price (LKR)" required error={formErrors.unitPrice}>
              <Input
                type="number"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                error={!!formErrors.unitPrice}
              />
            </FormField>

            <FormField label="Initial Stock Quantity" required error={formErrors.quantity}>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                error={!!formErrors.quantity}
              />
            </FormField>

            <FormField label="Low-Stock Alert Threshold" required error={formErrors.minThreshold}>
              <Input
                type="number"
                value={formData.minThreshold}
                onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
                error={!!formErrors.minThreshold}
              />
            </FormField>

            <FormField label="Expiry Date">
              <Input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </FormField>

            <FormField label="Storage Bay / Location">
              <Input
                value={formData.storageLocation}
                onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                placeholder="e.g. Pharmacy Bay A-2"
              />
            </FormField>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Medicine */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Medicine: ${selectedMedicine?.name || ''}`}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEdit}>
              Update Item
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Brand / Trade Name" required error={formErrors.name}>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!formErrors.name}
              />
            </FormField>

            <FormField label="Generic Name">
              <Input
                value={formData.genericName}
                onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
              />
            </FormField>

            <FormField label="Unit Retail Price (LKR)" required error={formErrors.unitPrice}>
              <Input
                type="number"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                error={!!formErrors.unitPrice}
              />
            </FormField>

            <FormField label="Low-Stock Alert Threshold" required error={formErrors.minThreshold}>
              <Input
                type="number"
                value={formData.minThreshold}
                onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
                error={!!formErrors.minThreshold}
              />
            </FormField>

            <FormField label="Expiry Date">
              <Input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </FormField>

            <FormField label="Storage Bay / Location">
              <Input
                value={formData.storageLocation}
                onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
              />
            </FormField>
          </div>
        </form>
      </Modal>

      {/* Modal: View Medicine Details */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Medicine Dossier & Stock Specification"
        description="Comprehensive pharmaceutical properties, batch tracking, and dispensary inventory"
        size="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleOpenAdjust(selectedMedicine);
                }}
              >
                Adjust Stock
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleOpenEdit(selectedMedicine);
                }}
              >
                Edit Item
              </Button>
            </div>
            <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedMedicine && (
          <div className="space-y-4">
            <div className="flex items-start justify-between p-4 rounded-xl bg-blue-50/70 dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700">
              <div>
                <span className="text-[10px] font-mono text-[#2563EB] dark:text-[#60A5FA] font-bold">
                  {selectedMedicine.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {selectedMedicine.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  {selectedMedicine.genericName}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Badge status={selectedMedicine.quantity <= selectedMedicine.minThreshold ? 'Low Stock' : 'Active'} size="sm" />
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                  {selectedMedicine.category}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Form & Dosage</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedMedicine.form} ({selectedMedicine.dosage})
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Available Stock</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedMedicine.quantity} units
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Reorder Level</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedMedicine.minThreshold} units
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Unit Price</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {formatLKR(selectedMedicine.unitPrice)}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Inventory Value</span>
                <p className="font-semibold text-teal-700 dark:text-teal-400 mt-0.5">
                  {formatLKR(selectedMedicine.quantity * selectedMedicine.unitPrice)}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Expiry Date</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {formatDate(selectedMedicine.expiryDate)}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Batch Number</span>
                <p className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedMedicine.batchNumber}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Storage Bay</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedMedicine.storageLocation}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Manufacturer</span>
                <p className="font-medium text-slate-700 dark:text-slate-300 truncate mt-0.5" title={selectedMedicine.manufacturer}>
                  {selectedMedicine.manufacturer}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Quick Stock Adjustment */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Stock Adjustment"
        description={`Modify stock units for ${selectedMedicine?.name || ''}`}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAdjustModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveAdjust}>
              Apply Stock Change
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveAdjust} className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex justify-between items-center">
            <div>
              <p className="text-slate-500 dark:text-slate-400">Current Stock</p>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100">{selectedMedicine?.quantity} units</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Reorder Threshold</p>
              <p className="font-semibold text-slate-700 dark:text-slate-300">{selectedMedicine?.minThreshold} units</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Operation">
              <Select
                value={adjustType}
                onChange={(e) => setAdjustType(e.target.value)}
              >
                <option value="add">Add Stock (Receive Delivery)</option>
                <option value="remove">Deduct Stock (Dispensed / Wastage)</option>
              </Select>
            </FormField>

            <FormField label="Adjustment Units" required>
              <Input
                type="number"
                min="1"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
              />
            </FormField>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog: Delete Medicine */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => {
          if (medicineToDelete) {
            deleteMedicine(medicineToDelete.id);
          }
        }}
        title="Remove Medicine Item"
        message={`Are you sure you want to permanently remove "${medicineToDelete?.name}" (${medicineToDelete?.id}) from the hospital formulary and inventory registry?`}
        confirmText="Remove Medicine"
        confirmVariant="danger"
      />
    </div>
  );
};
