import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  IdCard,
  Plus,
  Edit2,
  Trash2,
  Printer,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  Eye,
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  useGetIDCardsQuery,
  useGenerateIDCardMutation,
  useUpdateIDCardStatusMutation,
  useMarkIDCardPrintedMutation,
  useDeleteIDCardMutation,
  useGetIDCardDesignsQuery,
  useCreateIDCardDesignMutation,
  useGetUsersForIDCardQuery,
} from '../store/adminApiSlice';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '../components/ui/skeleton';
import ConfirmModal from '../components/ConfirmModal';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/Dialog';
import { Label } from '../components/ui/Label';
import { Switch } from '../components/ui/Switch';
import { cn } from '../lib/utils';
import { getApiBaseUrl } from '../utils/apiConfig';

const statusConfig = {
  active: { label: 'Active', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20', icon: CheckCircle },
  inactive: { label: 'Inactive', color: 'text-slate-500 bg-slate-50 dark:bg-slate-800', icon: XCircle },
  expired: { label: 'Expired', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20', icon: Clock },
  suspended: { label: 'Suspended', color: 'text-red-600 bg-red-50 dark:bg-red-900/20', icon: Ban },
};

function IDCardsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedIDCard, setSelectedIDCard] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null);
  const qrCanvasRef = useRef(null);
  const [formData, setFormData] = useState({
    userId: '',
    type: 'student',
    expiryDate: '',
    designId: '',
    notes: '',
  });
  const [designFormData, setDesignFormData] = useState({
    name: '',
    type: 'student',
    layout: 'portrait',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    showQrCode: true,
    showBarcode: false,
    fields: ['name', 'id', 'class', 'phone'],
  });
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);

  const { data: idCardsData, isLoading: isLoadingIDCards, refetch: refetchIDCards } = useGetIDCardsQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
    type: typeFilter === "all" ? undefined : typeFilter,
    search: searchTerm || undefined,
  });
  const { data: usersData, isLoading: isLoadingUsers } = useGetUsersForIDCardQuery();
  const { data: designsData, isLoading: isLoadingDesigns } = useGetIDCardDesignsQuery();

  // Process data
  const idCards = useMemo(() => {
    if (Array.isArray(idCardsData?.data)) return idCardsData.data;
    if (Array.isArray(idCardsData)) return idCardsData;
    return [];
  }, [idCardsData]);

  const users = useMemo(() => {
    if (Array.isArray(usersData?.data)) return usersData.data;
    if (Array.isArray(usersData)) return usersData;
    return [];
  }, [usersData]);

  const designs = useMemo(() => {
    if (Array.isArray(designsData?.data)) return designsData.data;
    if (Array.isArray(designsData)) return designsData;
    return [];
  }, [designsData]);

  // Auto-set type when user is selected
  useEffect(() => {
    if (formData.userId) {
      const selectedUser = users.find(u => u._id === formData.userId);
      if (selectedUser) {
        let userType = 'staff';
        if (selectedUser.role === 'student') userType = 'student';
        else if (selectedUser.role === 'teacher') userType = 'teacher';
        setFormData(prev => ({ ...prev, type: userType }));
      }
    }
  }, [formData.userId, users]);

  const [generateIDCard, { isLoading: isGenerating }] = useGenerateIDCardMutation();
  const [updateIDCardStatus, { isLoading: isUpdatingStatus }] = useUpdateIDCardStatusMutation();
  const [markIDCardPrinted, { isLoading: isMarkingPrinted }] = useMarkIDCardPrintedMutation();
  const [deleteIDCard, { isLoading: isDeleting }] = useDeleteIDCardMutation();
  const [createIDCardDesign, { isLoading: isCreatingDesign }] = useCreateIDCardDesignMutation();

  const stats = useMemo(() => {
    return {
      total: idCards.length,
      active: idCards.filter((c) => c.status === 'active').length,
      inactive: idCards.filter((c) => c.status === 'inactive').length,
      printed: idCards.filter((c) => c.printed).length,
    };
  }, [idCards]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      await generateIDCard(formData).unwrap();
      toast.success('ID Card generated successfully');
      setIsGenerateModalOpen(false);
      setFormData({
        userId: '',
        type: 'student',
        expiryDate: '',
        designId: '',
        notes: '',
      });
      refetchIDCards();
    } catch (err) {
      toast.error(err?.data?.userMessage || err?.data?.message || 'Failed to generate ID card');
    }
  };

  const handleUpdateStatus = async (idCard, newStatus) => {
    try {
      await updateIDCardStatus({ id: idCard._id, status: newStatus }).unwrap();
      toast.success('ID Card status updated');
      refetchIDCards();
    } catch (err) {
      toast.error(err?.data?.userMessage || err?.data?.message || 'Failed to update status');
    }
  };

  const handleMarkPrinted = async (idCard) => {
    try {
      await markIDCardPrinted(idCard._id).unwrap();
      toast.success('ID Card marked as printed');
      refetchIDCards();
    } catch (err) {
      toast.error(err?.data?.userMessage || err?.data?.message || 'Failed to mark as printed');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteIDCard(selectedIDCard._id).unwrap();
      toast.success('ID Card deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedIDCard(null);
      refetchIDCards();
    } catch (err) {
      toast.error(err?.data?.userMessage || err?.data?.message || 'Failed to delete ID card');
    }
  };

  const handleCreateDesign = async (e) => {
    e.preventDefault();
    try {
      await createIDCardDesign(designFormData).unwrap();
      toast.success('ID Card design created');
      setIsDesignModalOpen(false);
    } catch (err) {
      toast.error(err?.data?.userMessage || err?.data?.message || 'Failed to create design');
    }
  };

  const waitForPrintFrameReady = async (iframe) => {
    const frameWindow = iframe.contentWindow;
    const frameDocument = frameWindow?.document;

    if (!frameWindow || !frameDocument) {
      throw new Error('Print frame is not available');
    }

    const waitForDocumentReady = async () => {
      const maxWaitMs = 10000;
      const startedAt = Date.now();

      while (frameDocument.readyState !== 'complete') {
        if (Date.now() - startedAt > maxWaitMs) {
          throw new Error('Timed out waiting for printable document');
        }

        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    };

    const waitForImages = async () => {
      const images = Array.from(frameDocument.images || []);

      await Promise.all(
        images.map((image) => {
          if (image.complete) {
            return Promise.resolve();
          }

          return new Promise((resolve) => {
            const done = () => resolve();
            image.addEventListener('load', done, { once: true });
            image.addEventListener('error', done, { once: true });
          });
        })
      );
    };

    const waitForPrintableAssets = async () => {
      const maxWaitMs = 10000;
      const startedAt = Date.now();

      while (!frameWindow.__PRINT_READY__) {
        if (Date.now() - startedAt > maxWaitMs) {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    };

    await waitForDocumentReady();

    if (frameDocument.fonts?.ready) {
      try {
        await frameDocument.fonts.ready;
      } catch {
        // Continue printing even if the browser cannot fully resolve font readiness.
      }
    }

    await waitForImages();
    await waitForPrintableAssets();
    await new Promise((resolve) => frameWindow.requestAnimationFrame(() => frameWindow.requestAnimationFrame(resolve)));
  };

  const handlePrint = async (idCard) => {
    let iframe;

    try {
      const userInfoStr = localStorage.getItem('userInfo');
      const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
      const token = userInfo?.token;
      const selectedBranch = localStorage.getItem('selectedBranch');
      const selectedYear = localStorage.getItem('selectedYear');
      
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      if (userInfo?.school?.subdomain) {
        headers['X-School-Slug'] = userInfo.school.subdomain;
        headers['X-Tenant-ID'] = userInfo.school.subdomain;
      }
      if (selectedBranch) {
        const parsedBranch = JSON.parse(selectedBranch);
        const branchId = typeof parsedBranch === 'object' ? parsedBranch?._id : parsedBranch;
        if (branchId) {
          headers['x-branch-id'] = branchId;
        }
      }
      if (selectedYear) {
        const parsedYear = JSON.parse(selectedYear);
        const yearId = typeof parsedYear === 'object' ? parsedYear?._id : parsedYear;
        if (yearId) {
          headers['x-academic-year-id'] = yearId;
        }
      }

      const response = await fetch(`${getApiBaseUrl()}/id-cards/${idCard._id}/preview`, {
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to generate printable ID card');
      }

      const html = await response.text();

      iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
      
      iframe.contentWindow.document.open();
      iframe.contentWindow.document.write(html);
      iframe.contentWindow.document.close();

      await waitForPrintFrameReady(iframe);

      const printWindow = iframe.contentWindow;
      let cleanedUp = false;

      const cleanup = () => {
        if (cleanedUp) {
          return;
        }

        cleanedUp = true;
        if (iframe?.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      };

      printWindow.onafterprint = async () => {
        cleanup();

        try {
          await markIDCardPrinted(idCard._id).unwrap();
          refetchIDCards();
        } catch (markError) {
          console.error(markError);
          toast.error('Printed, but failed to update print status');
        }
      };

      setTimeout(cleanup, 30000);

      printWindow.focus();
      printWindow.print();
    } catch (error) {
      toast.error('Failed to print ID card');
      console.error(error);
      if (iframe?.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }
  };

  const handlePreview = (idCard) => {
    setSelectedIDCard(idCard);
    setQrCodeDataUrl(null);
    setIsPreviewModalOpen(true);
    
    // Convert canvas to base64 after it renders
    setTimeout(() => {
      const canvas = qrCanvasRef.current;
      if (canvas) {
        setQrCodeDataUrl(canvas.toDataURL('image/png'));
      }
    }, 100);
  };

  if (isLoadingIDCards) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-2xl w-64 animate-pulse" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <IdCard className="text-indigo-600" size={32} />
            ID Cards
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-1">
            Generate and manage student, teacher, and staff ID cards with QR verification
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog 
            open={isDesignModalOpen} 
            onOpenChange={(open) => {
              if (open) {
                setDesignFormData({
                  name: '',
                  type: 'student',
                  layout: 'portrait',
                  backgroundColor: '#ffffff',
                  textColor: '#000000',
                  showQrCode: true,
                  showBarcode: false,
                  fields: ['name', 'id', 'class', 'phone'],
                });
              }
              setIsDesignModalOpen(open);
            }}
          >
            <DialogTrigger asChild>
              <Button variant="secondary" className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2">
                <Edit2 size={16} />
                Create Design
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Create ID Card Design</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateDesign} className="space-y-6 mt-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Design Name *</Label>
                  <Input
                    required
                    value={designFormData.name}
                    onChange={(e) => setDesignFormData({ ...designFormData, name: e.target.value })}
                    placeholder="e.g. Student ID Card 2024"
                    className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-none font-bold text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</Label>
                    <Select
                      value={designFormData.type}
                      onValueChange={(v) => setDesignFormData({ ...designFormData, type: v })}
                    >
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Layout</Label>
                    <Select
                      value={designFormData.layout}
                      onValueChange={(v) => setDesignFormData({ ...designFormData, layout: v })}
                    >
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Portrait</SelectItem>
                        <SelectItem value="landscape">Landscape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Background</Label>
                    <Input
                      type="color"
                      value={designFormData.backgroundColor}
                      onChange={(e) => setDesignFormData({ ...designFormData, backgroundColor: e.target.value })}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Text Color</Label>
                    <Input
                      type="color"
                      value={designFormData.textColor}
                      onChange={(e) => setDesignFormData({ ...designFormData, textColor: e.target.value })}
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Show QR Code</Label>
                    <Switch
                      checked={designFormData.showQrCode}
                      onCheckedChange={(c) => setDesignFormData({ ...designFormData, showQrCode: c })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Show Barcode</Label>
                    <Switch
                      checked={designFormData.showBarcode}
                      onCheckedChange={(c) => setDesignFormData({ ...designFormData, showBarcode: c })}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isCreatingDesign} className="w-full h-12 rounded-xl font-black uppercase tracking-widest">
                  {isCreatingDesign ? 'Creating...' : 'Create Design'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button
            onClick={() => {
              setFormData({
                userId: '',
                type: 'student',
                expiryDate: '',
                designId: '',
                notes: '',
              });
              setIsGenerateModalOpen(true);
            }}
            className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-indigo-600/20"
          >
            <Plus size={16} />
            Generate ID Card
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'indigo' },
          { label: 'Active', value: stats.active, color: 'emerald' },
          { label: 'Inactive', value: stats.inactive, color: 'slate' },
          { label: 'Printed', value: stats.printed, color: 'amber' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="rounded-[2.5rem] border-none shadow-sm">
            <CardContent className="p-6">
              <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{label}</p>
              <p className={`text-3xl font-black mt-1 text-${color}-600 dark:text-${color}-400`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <Input
                placeholder="Search by name or ID number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 pl-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-none font-bold text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-none w-full sm:w-48">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-slate-500" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-none w-full sm:w-48">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-slate-500" />
                  <SelectValue placeholder="Type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {idCards.length === 0 ? (
        <Card className="rounded-[2.5rem] border-none shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-24">
            <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-6">
              <IdCard className="text-indigo-600 dark:text-indigo-400" size={36} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No ID Cards Found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold mb-6">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all" ? 'Try adjusting your filters' : 'Generate your first ID card to get started'}
            </p>
            {!searchTerm && statusFilter === "all" && typeFilter === "all" && (
              <Button
                onClick={() => {
                  setFormData({
                    userId: '',
                    type: 'student',
                    expiryDate: '',
                    designId: '',
                    notes: '',
                  });
                  setIsGenerateModalOpen(true);
                }}
                className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2"
              >
                <Plus size={16} />
                Generate ID Card
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead className="pl-8">User</TableHead>
                  <TableHead>Card Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Printed</TableHead>
                  <TableHead className="text-right pr-8">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {idCards.map((idCard) => {
                  const config = statusConfig[idCard.status] || statusConfig.inactive;
                  const StatusIcon = config.icon;
                  const user = idCard.user || {};
                  return (
                    <TableRow key={idCard._id} className="group">
                      <TableCell className="pl-8">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 rounded-2xl">
                            <AvatarImage loading="lazy" src={user.imageUrl || user.profileImage?.url || user.profileImage} />
                            <AvatarFallback className="font-black text-sm bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                              {user.name?.charAt(0)?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{user.name || 'Unknown'}</p>
                            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                              {user.customId || user.email || ''}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                          {idCard.cardNumber}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1.5 text-[9px] font-black uppercase tracking-widest">
                          {idCard.type?.charAt(0)?.toUpperCase() + idCard.type?.slice(1) || 'Student'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn('gap-1.5 text-[9px] font-black uppercase tracking-widest', config.color)}>
                          <StatusIcon size={10} />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          {new Date(idCard.issueDate).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          {new Date(idCard.expiryDate).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'gap-1.5 text-[9px] font-black uppercase tracking-widest',
                            idCard.printed
                              ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                              : 'text-slate-500 bg-slate-50 dark:bg-slate-800'
                          )}
                        >
                          {idCard.printed ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl text-slate-400 hover:text-indigo-600"
                            onClick={() => handlePreview(idCard)}
                            title="Preview"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl text-slate-400 hover:text-indigo-600"
                            onClick={() => handlePrint(idCard)}
                            title="Print"
                          >
                            <Printer size={16} />
                          </Button>
                          {!idCard.printed && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-xl text-slate-400 hover:text-emerald-600"
                              onClick={() => handleMarkPrinted(idCard)}
                              disabled={isMarkingPrinted}
                              title="Mark as Printed"
                            >
                              <CheckCircle size={16} />
                            </Button>
                          )}
                          {idCard.status !== 'active' ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-xl text-slate-400 hover:text-emerald-600"
                              onClick={() => handleUpdateStatus(idCard, 'active')}
                              disabled={isUpdatingStatus}
                              title="Activate"
                            >
                              <CheckCircle size={16} />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-xl text-slate-400 hover:text-slate-600"
                              onClick={() => handleUpdateStatus(idCard, 'inactive')}
                              disabled={isUpdatingStatus}
                              title="Deactivate"
                            >
                              <XCircle size={16} />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl text-slate-400 hover:text-red-600"
                            onClick={() => {
                              setSelectedIDCard(idCard);
                              setIsDeleteModalOpen(true);
                            }}
                            disabled={isDeleting}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Generate Modal */}
      <AnimatePresence>
        {isGenerateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 dark:border-gray-800"
            >
              <div className="px-8 py-8 bg-indigo-600 flex items-center justify-between relative">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <IdCard size={16} className="text-white" />
                    </div>
                    <span className="text-white/70 text-[10px] font-black uppercase tracking-widest">ID Card</span>
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tight">Generate ID Card</h2>
                </div>
                <button
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="relative z-10 p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <XCircle size={24} className="text-white" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto flex-1">
                <form onSubmit={handleGenerate} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">User *</Label>
                    <Select
              required
              value={formData.userId}
              onValueChange={(v) => setFormData({ ...formData, userId: v })}
            >
              <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500/30 font-bold">
                <SelectValue placeholder="Select User" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.name} - {user.customId} ({user.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Type *</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {['student', 'teacher', 'staff'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({ ...formData, type })}
                          className={cn(
                            'h-12 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all',
                            formData.type === type
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-transparent hover:border-indigo-200'
                          )}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Expiry Date</Label>
                    <Input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500/30 font-bold"
                    />
                  </div>

                  {designs.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Design</Label>
                      <Select
                        value={formData.designId}
                        onValueChange={(v) => setFormData({ ...formData, designId: v })}
                      >
                        <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500/30 font-bold">
                          <SelectValue placeholder="Select Design" />
                        </SelectTrigger>
                        <SelectContent>
                          {designs.map((design) => (
                            <SelectItem key={design._id} value={design._id}>
                              {design.type.charAt(0).toUpperCase() + design.type.slice(1)} - {design.layout}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Notes</Label>
                    <Input
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500/30 font-bold"
                      placeholder="Internal notes..."
                    />
                  </div>

                  <div className="pt-6 border-t border-gray-50 dark:border-gray-800">
                    <Button
                      type="submit"
                      disabled={isGenerating}
                      className="w-full h-12 rounded-[1.5rem] bg-indigo-600 text-white font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isGenerating ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Plus size={18} />
                          Generate ID Card
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      {isDeleteModalOpen && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedIDCard(null);
          }}
          onConfirm={handleDelete}
          title="Delete ID Card"
          message={`Are you sure you want to delete the ID card for "${selectedIDCard?.user?.name}"? This action cannot be undone.`}
          confirmText="Delete ID Card"
          isLoading={isDeleting}
        />
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {isPreviewModalOpen && selectedIDCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 dark:border-gray-800"
            >
              <div className="px-8 py-8 bg-indigo-600 flex items-center justify-between relative">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <IdCard size={16} className="text-white" />
                    </div>
                    <span className="text-white/70 text-[10px] font-black uppercase tracking-widest">ID Card Preview</span>
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tight">{selectedIDCard.user?.name}</h2>
                </div>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="relative z-10 p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <XCircle size={24} className="text-white" />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto flex-1 flex flex-col items-center">
                {/* Front Side */}
                <div className="mb-8 w-full flex justify-center">
                  <div className="w-[510px] bg-white rounded-xl shadow-xl overflow-hidden border-2 border-blue-800">
                    <div className="bg-gradient-to-r from-blue-800 to-blue-500 text-white p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {selectedIDCard.school?.logo && (
                          <img 
                            src={selectedIDCard.school.logo.url || selectedIDCard.school.logo} 
                            alt={selectedIDCard.school.name} 
                            className="w-11 h-11 rounded-full object-cover border-2 border-white"
                          />
                        )}
                        <span className="text-sm font-bold">{selectedIDCard.school?.name}</span>
                      </div>
                      <span className="text-sm font-bold">جامعة جمهورية</span>
                    </div>
                    <div className="p-4 flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-[120px] h-[140px] bg-blue-100 rounded-lg border-2 border-blue-800 flex items-center justify-center">
                          <Avatar className="w-full h-full rounded-lg">
                            <AvatarImage src={selectedIDCard.user?.profileImage?.url || selectedIDCard.user?.profileImage} className="object-cover" />
                            <AvatarFallback className="text-4xl bg-blue-50 text-blue-800">
                              {selectedIDCard.user?.name?.charAt(0)?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        <span className="bg-blue-800 text-white px-3 py-1 font-bold text-sm rounded-t-md inline-block w-fit">
                          {selectedIDCard.type ? selectedIDCard.type.charAt(0).toUpperCase() + selectedIDCard.type.slice(1) : 'Student'}
                        </span>
                        <div className="border-2 border-blue-800 rounded-b-md rounded-tr-md p-2 bg-white">
                          <div className="flex text-xs mb-1">
                            <span className="font-bold text-blue-800 w-20">Name:</span>
                            <span>{selectedIDCard.user?.name}</span>
                          </div>
                          <div className="flex text-xs mb-1">
                            <span className="font-bold text-blue-800 w-20">ID No:</span>
                            <span>{selectedIDCard.user?.customId || selectedIDCard.cardNumber}</span>
                          </div>
                          {selectedIDCard.user?.class && (
                            <div className="flex text-xs mb-1">
                              <span className="font-bold text-blue-800 w-20">Class:</span>
                              <span>{selectedIDCard.user.class.name || selectedIDCard.user.class}</span>
                            </div>
                          )}
                          {selectedIDCard.user?.phone && (
                            <div className="flex text-xs mb-1">
                              <span className="font-bold text-blue-800 w-20">Mobile:</span>
                              <span>{selectedIDCard.user.phone}</span>
                            </div>
                          )}
                          <div className="flex text-xs">
                            <span className="font-bold text-blue-800 w-20">Expires:</span>
                            <span>{new Date(selectedIDCard.expiryDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {selectedIDCard.school?.logo && (
                      <div className="absolute bottom-2 left-4">
                        <img 
                          src={selectedIDCard.school.logo.url || selectedIDCard.school.logo} 
                          alt="School Logo" 
                          className="w-10 h-10 rounded-full border-2 border-blue-800"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Back Side */}
                <div className="mb-8 w-full flex justify-center">
                  <div className="w-[510px] bg-white rounded-xl shadow-xl overflow-hidden border-2 border-blue-800 relative">
                    <div className="bg-gradient-to-r from-blue-800 to-blue-500 text-white p-3 flex justify-center items-center">
                      {selectedIDCard.school?.logo && (
                        <img 
                          src={selectedIDCard.school.logo.url || selectedIDCard.school.logo} 
                          alt={selectedIDCard.school.name} 
                          className="w-[70px] h-[70px] rounded-full object-cover border-3 border-white"
                        />
                      )}
                    </div>
                    <div className="p-4 flex justify-between">
                      <div className="flex-1 pr-2">
                        <p className="text-xs mb-3">If found please return to {selectedIDCard.school?.name || 'school'}.</p>
                        <div className="text-xs leading-relaxed">
                          {selectedIDCard.school?.phone && <p>Tel: {selectedIDCard.school.phone}</p>}
                          {selectedIDCard.school?.email && <p>Email: {selectedIDCard.school.email}</p>}
                          {selectedIDCard.school?.website && <p>Website: {selectedIDCard.school.website}</p>}
                        </div>
                      </div>
                      <div className="w-25 h-25 border border-gray-300 flex items-center justify-center">
                        {selectedIDCard.qrCodeData ? (
                          <>
                            <div style={{ display: 'none' }}>
                              <QRCodeCanvas
                                ref={qrCanvasRef}
                                value={typeof selectedIDCard.qrCodeData === 'string' ? selectedIDCard.qrCodeData : JSON.stringify(selectedIDCard.qrCodeData)}
                                size={200}
                                level="H"
                                includeMargin={true}
                                fgColor="#1e293b"
                                bgColor="#ffffff"
                              />
                            </div>
                            {qrCodeDataUrl ? (
                              <img 
                                src={qrCodeDataUrl} 
                                alt="QR Code" 
                                style={{ width: '100px', height: '100px', display: 'block' }}
                              />
                            ) : (
                              <span className="text-xs text-gray-500 text-center">QR<br/>Code</span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-500 text-center">QR<br/>Code</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <Button onClick={() => handlePrint(selectedIDCard)} className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-indigo-600/20">
                    <Printer size={16} /> Print
                  </Button>
                  <Button variant="secondary" onClick={() => setIsPreviewModalOpen(false)} className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px]">
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default IDCardsManagement;
