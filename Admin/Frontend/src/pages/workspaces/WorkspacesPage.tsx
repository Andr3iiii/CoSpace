import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { workspaceApi } from '../../api/workspace.api';
import { Workspace } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Dialog } from '../../components/ui/Dialog';
import {
  Plus,
  Search,
  Edit3,
  Building2,
  Users,
  DollarSign,
  UploadCloud,
  X,
  Check,
  Wrench,
  Image as ImageIcon,
  Sparkles,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const FLOOR_OPTIONS = [
  { value: '1st Floor - Main Lobby & Cafe', label: '1st Floor - Main Lobby & Cafe' },
  { value: '2nd Floor - Open Coworking Commons', label: '2nd Floor - Open Coworking Commons' },
  { value: '3rd Floor - Focus & Dedicated Desks', label: '3rd Floor - Focus & Dedicated Desks' },
  { value: '4th Floor - Executive Private Suites', label: '4th Floor - Executive Private Suites' },
  { value: '5th Floor - 4K Video Boardrooms & Events', label: '5th Floor - 4K Video Boardrooms & Events' },
  { value: 'Mezzanine - Quiet Collaboration Pods', label: 'Mezzanine - Quiet Collaboration Pods' },
  { value: 'Penthouse - Sky Lounge', label: 'Penthouse - Sky Lounge' },
];

interface BasicFormValues {
  name: string;
  workspace_type_id: string;
  capacity: number;
  room_number?: string;
  floor: string;
  description: string;
}

export const WorkspacesPage: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // 1. Unified Pricing State
  const [rateType, setRateType] = useState<'hourly' | 'daily'>('hourly');
  const [priceRateInput, setPriceRateInput] = useState<string>('150');
  const [priceError, setPriceError] = useState<string | null>(null);

  // 3. Status State (Edit mode only: 'available' vs 'maintenance')
  const [statusState, setStatusState] = useState<'available' | 'maintenance'>('available');

  // 4. Description State
  const [descriptionInput, setDescriptionInput] = useState<string>('');

  // 5. Image Upload State (Manual Base64/URLs)
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BasicFormValues>();

  const fetchWorkspaces = async () => {
    setIsLoading(true);
    try {
      const [wsRes, metaRes] = await Promise.all([
        workspaceApi.getWorkspaces({ search, status: statusFilter }),
        workspaceApi.getMetadata().catch(() => ({ types: [], amenities: [] })),
      ]);
      setWorkspaces(wsRes.items || []);
      setTypes(metaRes.types || []);
    } catch (err) {
      console.error('Failed to fetch workspaces:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [statusFilter]);

  // Rate Type Switch Handler with auto-conversion
  const handleRateTypeChange = (newType: 'hourly' | 'daily') => {
    if (newType === rateType) return;
    const currentVal = parseFloat(priceRateInput);
    if (!isNaN(currentVal) && currentVal > 0) {
      if (newType === 'daily') {
        // Hourly -> Daily (* 8)
        setPriceRateInput(String(Math.round(currentVal * 8 * 100) / 100));
      } else {
        // Daily -> Hourly (/ 8)
        setPriceRateInput(String(Math.round((currentVal / 8) * 100) / 100));
      }
    }
    setRateType(newType);
  };

  // Image Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setImageUploadError('Only JPG, PNG, and WEBP images are supported.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setImageUploadError('Each image must be under 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImagesList((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (indexToRemove: number) => {
    setImagesList((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const openCreateModal = () => {
    setEditingWorkspace(null);
    reset({
      name: '',
      workspace_type_id: types[0]?.id || '',
      capacity: 1,
      floor: FLOOR_OPTIONS[0].value,
      room_number: '',
      description: '',
    });
    setRateType('hourly');
    setPriceRateInput('150');
    setPriceError(null);
    setDescriptionInput('');
    setStatusState('available');
    setImagesList([]);
    setImageUploadError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (ws: Workspace) => {
    setEditingWorkspace(ws);
    reset({
      name: ws.name,
      workspace_type_id: ws.workspace_type_id,
      capacity: ws.capacity,
      floor: ws.floor || FLOOR_OPTIONS[0].value,
      room_number: ws.room_number || '',
      description: ws.description || '',
    });
    setRateType('hourly');
    setPriceRateInput(String(ws.hourly_rate || 150));
    setPriceError(null);
    setDescriptionInput(ws.description || '');
    setStatusState(ws.status === 'maintenance' ? 'maintenance' : 'available');
    setImagesList(Array.isArray(ws.images) ? ws.images : []);
    setImageUploadError(null);
    setIsModalOpen(true);
  };

  // Safe Financial Computations
  const numericPrice = parseFloat(priceRateInput) || 0;
  const computedHourlyRate =
    rateType === 'hourly' ? numericPrice : Math.round((numericPrice / 8) * 100) / 100;
  const computedDailyRate =
    rateType === 'daily' ? numericPrice : Math.round(numericPrice * 8 * 100) / 100;

  const onFormSubmit = async (data: BasicFormValues) => {
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setPriceError('Please enter a valid price greater than 0.');
      return;
    }
    setPriceError(null);

    setFormLoading(true);
    try {
      const payload = {
        ...data,
        capacity: Number(data.capacity),
        hourly_rate: computedHourlyRate,
        daily_rate: computedDailyRate,
        description: descriptionInput,
        images: imagesList,
        // Status: 'available' on create, or toggle state on edit
        status: editingWorkspace ? statusState : 'available',
      };

      if (editingWorkspace) {
        await workspaceApi.updateWorkspace(editingWorkspace.id, payload);
      } else {
        await workspaceApi.createWorkspace(payload);
      }
      setIsModalOpen(false);
      fetchWorkspaces();
    } catch (err: any) {
      alert(err.message || 'Failed to save workspace');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <Card className="p-4 sm:p-5 border-border/80 bg-card/60 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-1 min-w-[260px] gap-2">
            <Input
              placeholder="Search workspaces by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
            <Button variant="secondary" onClick={fetchWorkspaces} className="shrink-0 font-medium">
              Search
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-44">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'available', label: 'Available' },
                  { value: 'maintenance', label: 'Maintenance' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
              />
            </div>
            <Button variant="primary" onClick={openCreateModal} leftIcon={<Plus className="h-4 w-4" />} className="shadow-md shadow-primary/20 font-semibold">
              Add Workspace
            </Button>
          </div>
        </div>
      </Card>

      {/* Grid of Workspaces */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-64 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        <Card className="text-center py-16 px-6 space-y-3">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-bold text-foreground">No Workspaces Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search criteria or create a new workspace.
          </p>
          <Button variant="primary" onClick={openCreateModal} leftIcon={<Plus className="h-4 w-4" />}>
            Create Workspace
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((ws) => (
            <Card
              key={ws.id}
              hoverEffect
              className="p-0 overflow-hidden flex flex-col group border-border/80 bg-card/60 backdrop-blur-md"
            >
              {/* Workspace Image Card Header */}
              <div className="relative h-44 w-full overflow-hidden bg-muted">
                <img
                  src={
                    ws.images?.[0] ||
                    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
                  }
                  alt={ws.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                  <StatusBadge status={ws.status} />

                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => openEditModal(ws)}
                    className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-primary hover:text-primary-foreground shadow-md transition-all cursor-pointer"
                    title="Edit Workspace"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Workspace Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    {ws.workspace_type || 'Workspace'}
                  </span>
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {ws.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {ws.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/80 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                    <Users className="h-3.5 w-3.5 text-primary" /> {ws.capacity}{' '}
                    {ws.capacity === 1 ? 'Person' : 'People'} • {ws.floor || '1st Floor'}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-black text-primary">
                      ₱{parseFloat(String(ws.hourly_rate)).toLocaleString()}/hr
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      ₱{parseFloat(String(ws.daily_rate)).toLocaleString()}/day
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🛠️ Create / Edit Workspace Dialog Modal */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWorkspace ? `Edit: ${editingWorkspace.name}` : 'Create New Workspace'}
        maxWidth="650px"
      >
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-1">
          {/* Top Row: Name + Edit Mode Status Toggle in Top-Right */}
          <div className="space-y-3">
            {/* 3. Top-Right Status Toggle for Edit Mode */}
            {editingWorkspace && (
              <div className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-background/50">
                <div>
                  <span className="text-xs font-bold text-foreground">Operational Status</span>
                  <p className="text-[11px] text-muted-foreground">
                    Toggle availability for client reservations
                  </p>
                </div>
                <div className="inline-flex rounded-lg bg-muted p-1 border border-border">
                  <button
                    type="button"
                    onClick={() => setStatusState('available')}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer',
                      statusState === 'available'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Available</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusState('maintenance')}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer',
                      statusState === 'maintenance'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Wrench className="h-3.5 w-3.5" />
                    <span>Maintenance</span>
                  </button>
                </div>
              </div>
            )}

            <Input
              label="Workspace Name"
              placeholder="e.g. Skyline Executive Suite 402"
              error={errors.name?.message}
              {...register('name', { required: 'Workspace name is required' })}
            />
          </div>

          {/* Category + Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Workspace Category"
              {...register('workspace_type_id', { required: 'Category is required' })}
              options={types.map((t) => ({ value: t.id, label: t.name }))}
            />

            <Input
              label="Capacity (Persons)"
              type="number"
              min="1"
              placeholder="e.g. 4"
              error={errors.capacity?.message}
              {...register('capacity', { required: 'Capacity is required', min: 1 })}
            />
          </div>

          {/* 1. Unified Pricing Field with Rate Type Toggle */}
          <div className="p-4 rounded-xl border border-border/80 bg-background/50 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">
                Pricing Rate ({rateType === 'hourly' ? '₱/hr' : '₱/day'})
              </label>

              {/* Toggle Segmented Control */}
              <div className="inline-flex rounded-lg bg-muted p-0.5 border border-border">
                <button
                  type="button"
                  onClick={() => handleRateTypeChange('hourly')}
                  className={cn(
                    'px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer',
                    rateType === 'hourly'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Hourly Rate
                </button>
                <button
                  type="button"
                  onClick={() => handleRateTypeChange('daily')}
                  className={cn(
                    'px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer',
                    rateType === 'daily'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Daily Rate
                </button>
              </div>
            </div>

            <Input
              type="number"
              min="0"
              step="any"
              placeholder={rateType === 'hourly' ? 'Enter rate per hour (e.g. 150)' : 'Enter rate per day (e.g. 1200)'}
              value={priceRateInput}
              onChange={(e) => setPriceRateInput(e.target.value)}
              error={priceError || undefined}
              leftIcon={<DollarSign className="h-4 w-4 text-primary" />}
            />

            {/* Financial Safety Auto-Computation Display */}
            <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-xs text-muted-foreground flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>
                  {rateType === 'hourly'
                    ? 'Auto-computed Daily Rate (8 hrs/day):'
                    : 'Implied Hourly Rate (8 hrs/day):'}
                </span>
              </div>
              <strong className="text-primary text-sm font-black">
                ₱
                {rateType === 'hourly'
                  ? computedDailyRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : computedHourlyRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="text-[10px] font-normal text-muted-foreground ml-1">
                  {rateType === 'hourly' ? '/ day' : '/ hr'}
                </span>
              </strong>
            </div>
          </div>

          {/* 2. Floor / Zone Dropdown Menu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Floor / Zone"
              {...register('floor', { required: 'Floor selection is required' })}
              options={FLOOR_OPTIONS}
            />

            <Input
              label="Room / Unit Code (Optional)"
              placeholder="e.g. POD-401 or SUITE-A"
              {...register('room_number')}
            />
          </div>

          {/* 4. Multi-Line Description Field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">
              Workspace Description
            </label>
            <textarea
              rows={3}
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              placeholder="Describe seating comfort, natural light, audio insulation, 4K displays, power outlet access, and room rules..."
              className="w-full rounded-lg border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
            />
          </div>

          {/* 5. Image File Upload & Preview Strategy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-primary" />
                <span>Workspace Photos ({imagesList.length} uploaded)</span>
              </label>
              <span className="text-[11px] text-muted-foreground">JPG, PNG, WEBP (Max 5MB)</span>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg, image/png, image/webp"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Drag and Drop / Browse Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border/80 hover:border-primary/60 rounded-xl p-4 text-center cursor-pointer transition-colors bg-background/30 hover:bg-primary/5 flex flex-col items-center justify-center gap-2"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <UploadCloud className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-foreground">
                Click to browse or drop photos here
              </p>
              <p className="text-[10px] text-muted-foreground">
                Upload real photos of the desk, ambient lighting, and amenities.
              </p>
            </div>

            {imageUploadError && (
              <p className="text-xs text-destructive font-medium">{imageUploadError}</p>
            )}

            {/* Image Previews Grid */}
            {imagesList.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                {imagesList.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-video rounded-lg overflow-hidden border border-border/80 group shadow-sm bg-muted"
                  >
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 bg-black/75 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        Primary Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(idx);
                      }}
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity hover:scale-110 cursor-pointer"
                      title="Remove Photo"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/80">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={formLoading} className="font-semibold shadow-md shadow-primary/20">
              {editingWorkspace ? 'Save Changes' : 'Create Workspace'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
