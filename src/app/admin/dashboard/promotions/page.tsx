'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  useGetPromotionsAdminQuery,
  useDeletePromotionMutation,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
} from '@/lib/store/services/api';
import { Loader2, Plus, Pencil, Trash2, Tag, ArrowLeft, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PromotionFormData {
  code: string;
  title: string;
  description: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  maxDiscount?: number;
  minOrderValue?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  perUserLimit: number;
  isActive: boolean;
  imageUrl?: string;
  terms?: string;
}

export default function PromotionsManagementPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<PromotionFormData>({
    code: '',
    title: '',
    description: '',
    discountType: 'fixed',
    discountValue: 0,
    maxDiscount: undefined,
    minOrderValue: 0,
    startDate: '',
    endDate: '',
    usageLimit: 100,
    perUserLimit: 1,
    isActive: true,
    imageUrl: '',
    terms: '',
  });

  const { data: promotionsData, isLoading } = useGetPromotionsAdminQuery({
    page: currentPage,
    limit: 100,
  });

  const [createPromotion, { isLoading: isCreating }] = useCreatePromotionMutation();
  const [updatePromotion, { isLoading: isUpdating }] = useUpdatePromotionMutation();
  const [deletePromotion, { isLoading: isDeleting }] = useDeletePromotionMutation();

  // Filter promotions by search term
  const filteredPromotions = useMemo(() => {
    const promotions = promotionsData?.results || [];
    if (!searchTerm) return promotions;
    return promotions.filter(
      (promo: any) =>
        promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [promotionsData?.results, searchTerm]);

  const handleCreateClick = () => {
    setFormData({
      code: '',
      title: '',
      description: '',
      discountType: 'fixed',
      discountValue: 0,
      maxDiscount: undefined,
      minOrderValue: 0,
      startDate: '',
      endDate: '',
      usageLimit: 100,
      perUserLimit: 1,
      isActive: true,
      imageUrl: '',
      terms: '',
    });
    setShowCreateDialog(true);
  };

  const handleEditClick = (promotion: any) => {
    setSelectedPromotion(promotion);
    setFormData({
      code: promotion.code,
      title: promotion.title,
      description: promotion.description,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      maxDiscount: promotion.maxDiscount,
      minOrderValue: promotion.minOrderValue || 0,
      startDate: new Date(promotion.startDate).toISOString().split('T')[0],
      endDate: new Date(promotion.endDate).toISOString().split('T')[0],
      usageLimit: promotion.usageLimit,
      perUserLimit: promotion.perUserLimit,
      isActive: promotion.isActive,
      imageUrl: promotion.imageUrl || '',
      terms: promotion.terms || '',
    });
    setShowEditDialog(true);
  };

  const handleDeleteClick = (promotion: any) => {
    setSelectedPromotion(promotion);
    setShowDeleteDialog(true);
  };

  const handleCreate = async () => {
    try {
      await createPromotion(formData).unwrap();
      toast.success('Promotion created successfully');
      setShowCreateDialog(false);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create promotion');
    }
  };

  const handleUpdate = async () => {
    try {
      await updatePromotion({
        promotionId: selectedPromotion._id,
        ...formData,
      }).unwrap();
      toast.success('Promotion updated successfully');
      setShowEditDialog(false);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update promotion');
    }
  };

  const handleDelete = async () => {
    try {
      await deletePromotion(selectedPromotion._id).unwrap();
      toast.success('Promotion deleted successfully');
      setShowDeleteDialog(false);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete promotion');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (promotion: any) => {
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);

    if (!promotion.isActive) {
      return <Badge className="bg-slate-100 text-slate-700">Inactive</Badge>;
    }
    if (start > now) {
      return <Badge className="bg-blue-100 text-blue-700">Upcoming</Badge>;
    }
    if (end < now) {
      return <Badge className="bg-rose-100 text-rose-700">Expired</Badge>;
    }
    if (promotion.usedCount >= promotion.usageLimit) {
      return <Badge className="bg-rose-100 text-rose-700">Full</Badge>;
    }
    return <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>;
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Promotion Management</p>
            <h1 className="text-2xl font-bold">Promotions</h1>
            <p className="text-slate-600">Manage discount codes and promotional offers</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/admin')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </div>

        {/* Content Card */}
        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-600" /> Promotions ({filteredPromotions.length})
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search code or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Button onClick={handleCreateClick} className="gap-2">
                <Plus className="w-4 h-4" /> Create Promotion
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : filteredPromotions.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Tag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No promotions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold text-sm">Code</th>
                      <th className="text-left p-3 font-semibold text-sm">Title</th>
                      <th className="text-left p-3 font-semibold text-sm">Discount</th>
                      <th className="text-left p-3 font-semibold text-sm">Usage</th>
                      <th className="text-left p-3 font-semibold text-sm">Valid Period</th>
                      <th className="text-left p-3 font-semibold text-sm">Status</th>
                      <th className="text-right p-3 font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPromotions.map((promotion: any) => (
                      <tr key={promotion._id} className="border-b hover:bg-slate-50">
                        <td className="p-3">
                          <span className="font-mono font-semibold text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            {promotion.code}
                          </span>
                        </td>
                        <td className="p-3">
                          <div>
                            <p className="font-medium text-sm">{promotion.title}</p>
                            <p className="text-xs text-slate-500 line-clamp-1">{promotion.description}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <p className="font-semibold text-sm">
                              {promotion.discountType === 'fixed'
                                ? `${promotion.discountValue.toLocaleString()}₫`
                                : `${promotion.discountValue}%`}
                            </p>
                            {promotion.minOrderValue > 0 && (
                              <p className="text-xs text-slate-500">Min: {promotion.minOrderValue.toLocaleString()}₫</p>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <p className="text-sm">
                            {promotion.usedCount} / {promotion.usageLimit}
                          </p>
                          <p className="text-xs text-slate-500">Per user: {promotion.perUserLimit}</p>
                        </td>
                        <td className="p-3">
                          <p className="text-sm">{formatDate(promotion.startDate)}</p>
                          <p className="text-xs text-slate-500">to {formatDate(promotion.endDate)}</p>
                        </td>
                        <td className="p-3">{getStatusBadge(promotion)}</td>
                        <td className="p-3">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditClick(promotion)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(promotion)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <PromotionFormDialog
        open={showCreateDialog || showEditDialog}
        onOpenChange={(open) => {
          setShowCreateDialog(open && showCreateDialog);
          setShowEditDialog(open && showEditDialog);
        }}
        formData={formData}
        setFormData={setFormData}
        onSubmit={showCreateDialog ? handleCreate : handleUpdate}
        isLoading={isCreating || isUpdating}
        title={showCreateDialog ? 'Create Promotion' : 'Edit Promotion'}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Promotion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete promotion <strong>{selectedPromotion?.code}</strong>? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive">
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

// Promotion Form Dialog Component
function PromotionFormDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
  isLoading,
  title,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: PromotionFormData;
  setFormData: (data: PromotionFormData) => void;
  onSubmit: () => void;
  isLoading: boolean;
  title: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Fill in the promotion details below</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Code */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">
              Code *
            </Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="SUMMER2025"
              className="col-span-3"
            />
          </div>

          {/* Title */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Summer Sale 2025"
              className="col-span-3"
            />
          </div>

          {/* Description */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Get amazing discounts this summer!"
              className="col-span-3"
              rows={3}
            />
          </div>

          {/* Discount Type & Value */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Discount Type *</Label>
            <div className="col-span-3 flex gap-2">
              <Select
                value={formData.discountType}
                onValueChange={(value: 'fixed' | 'percentage') => setFormData({ ...formData, discountType: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                placeholder={formData.discountType === 'fixed' ? '50000' : '10'}
                className="flex-1"
              />
            </div>
          </div>

          {/* Max Discount (for percentage) */}
          {formData.discountType === 'percentage' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxDiscount" className="text-right">
                Max Discount
              </Label>
              <Input
                id="maxDiscount"
                type="number"
                value={formData.maxDiscount || ''}
                onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) || undefined })}
                placeholder="100000"
                className="col-span-3"
              />
            </div>
          )}

          {/* Min Order Value */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="minOrderValue" className="text-right">
              Min Order Value
            </Label>
            <Input
              id="minOrderValue"
              type="number"
              value={formData.minOrderValue}
              onChange={(e) => setFormData({ ...formData, minOrderValue: parseFloat(e.target.value) || 0 })}
              placeholder="0"
              className="col-span-3"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              Start Date *
            </Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              End Date *
            </Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="col-span-3"
            />
          </div>

          {/* Usage Limits */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="usageLimit" className="text-right">
              Usage Limit *
            </Label>
            <Input
              id="usageLimit"
              type="number"
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) })}
              placeholder="100"
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="perUserLimit" className="text-right">
              Per User Limit *
            </Label>
            <Input
              id="perUserLimit"
              type="number"
              value={formData.perUserLimit}
              onChange={(e) => setFormData({ ...formData, perUserLimit: parseInt(e.target.value) })}
              placeholder="1"
              className="col-span-3"
            />
          </div>

          {/* Image URL */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="imageUrl" className="text-right">
              Image URL
            </Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://..."
              className="col-span-3"
            />
          </div>

          {/* Terms */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="terms" className="text-right">
              Terms
            </Label>
            <Textarea
              id="terms"
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              placeholder="Terms and conditions..."
              className="col-span-3"
              rows={2}
            />
          </div>

          {/* Active Status */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isActive" className="text-right">
              Active
            </Label>
            <div className="col-span-3">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
