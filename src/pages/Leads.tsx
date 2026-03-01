import { useState, useEffect } from 'react';
import { Search, Filter, Eye, ChevronRight, Copy, Edit, Trash2, Info } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import StatusBadge from '@/components/StatusBadge';
import { useRole } from '@/contexts/RoleContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { api } from '@/services/api';

interface Lead {
  id: string;
  lead_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  type: string;
  card_name: string;
  bank_name: string;
  advisor_name: string;
  status: string;
  activation_status: string;
  card_variant: string;
  application_no: string;
  cust_type: string;
  vkyc_status: string;
  bkyc_status: string;
  card_issued_date: string;
  remark: string;
  utm_link: string;
  notes: string;
  created_at: string;
}

const MOCK_LEADS: Lead[] = [];

const statusColors: Record<string, string> = {
  Generated: 'bg-blue-50 text-blue-600',
  submitted: 'bg-info/10 text-info',
  in_review: 'bg-warning/10 text-warning',
  approved: 'bg-accent/10 text-accent',
  rejected: 'bg-destructive/10 text-destructive',
  converted: 'bg-success/10 text-success',
};

const LeadsPage = () => {
  const { role, permissions } = useRole();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Lead | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const data = await api.getLeads();
      setLeads(data || []);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = leads.filter(l => {
    const matchSearch = l.applicant_name.toLowerCase().includes(search.toLowerCase()) || l.lead_id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusUpdate = async () => {
    if (!editLead) return;
    try {
      await api.updateLead(editLead.id, {
        applicant_name: editLead.applicant_name,
        applicant_phone: editLead.applicant_phone,
        applicant_email: editLead.applicant_email,
        status: editStatus,
        activation_status: editLead.activation_status,
        card_variant: editLead.card_variant,
        application_no: editLead.application_no,
        cust_type: editLead.cust_type,
        vkyc_status: editLead.vkyc_status,
        bkyc_status: editLead.bkyc_status,
        card_issued_date: editLead.card_issued_date,
        remark: editLead.remark,
      });
      await fetchLeads();
      toast({ title: 'Lead updated', description: `${editLead.lead_id} updated successfully` });
      setEditLead(null);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update lead', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api.deleteLead(deleteConfirm.id);
      await fetchLeads();
      toast({ title: 'Lead deleted', description: 'Lead has been removed' });
      setDeleteConfirm(null);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete lead', variant: 'destructive' });
    }
  };

  const stats = {
    total: leads.length,
    submitted: leads.filter(l => l.status === 'submitted').length,
    converted: leads.filter(l => l.status === 'converted').length,
    rejected: leads.filter(l => l.status === 'rejected').length,
  };

  return (
    <AppLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Lead Management</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Track credit card application leads</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-card rounded-xl p-4 border border-border shadow-card">
            <p className="text-[10px] text-muted-foreground font-medium">Total Leads</p>
            <p className="text-2xl font-display font-bold text-card-foreground mt-1">{stats.total}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border shadow-card">
            <p className="text-[10px] text-muted-foreground font-medium">New</p>
            <p className="text-2xl font-display font-bold text-info mt-1">{stats.submitted}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border shadow-card">
            <p className="text-[10px] text-muted-foreground font-medium">Converted</p>
            <p className="text-2xl font-display font-bold text-success mt-1">{stats.converted}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border shadow-card">
            <p className="text-[10px] text-muted-foreground font-medium">Rejected</p>
            <p className="text-2xl font-display font-bold text-destructive mt-1">{stats.rejected}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search lead ID or name..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 md:w-40">
              <Filter className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border z-50">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {filtered.map(lead => (
            <button key={lead.id} onClick={() => { setSelectedLead(lead); setEditStatus(lead.status); }} className="w-full bg-card rounded-xl p-4 border border-border shadow-card text-left">
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-accent font-mono font-bold">{lead.lead_id}</p>
                  <p className="font-semibold text-sm text-card-foreground mt-0.5">{lead.applicant_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{lead.card_name} · {lead.bank_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${statusColors[lead.status] || ''}`}>
                    {lead.status.replace(/_/g, ' ')}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">{formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}</p>
            </button>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-card rounded-xl shadow-card border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Lead ID</TableHead>
                <TableHead>Date/Time</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Advisor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Info</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(lead => (
                <TableRow key={lead.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-xs font-bold text-accent">{lead.lead_id}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}<br />
                    {new Date(lead.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </TableCell>
                  <TableCell className="font-medium text-sm">{lead.applicant_name}</TableCell>
                  <TableCell className="text-sm">{lead.applicant_phone}</TableCell>
                  <TableCell className="text-sm">{lead.card_name}</TableCell>
                  <TableCell className="text-sm">{lead.bank_name}</TableCell>
                  <TableCell className="text-sm">{lead.advisor_name || 'N/A'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[lead.status] || ''}`}>
                      {lead.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedLead(lead)}>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { navigator.clipboard.writeText(lead.lead_id); toast({ title: 'Copied', description: 'Lead ID copied to clipboard' }); }}>
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                      {(role === 'super_admin' || role === 'admin' || permissions?.leads?.edit) && (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setEditLead(lead); setEditStatus(lead.status); }}>
                          <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                      )}
                      {(role === 'super_admin' || role === 'admin') && (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setDeleteConfirm(lead)}>
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Lead Info Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">Lead Details</DialogTitle></DialogHeader>
          {selectedLead && (
            <div className="space-y-4 mt-2">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Lead ID</p>
                <p className="font-mono font-bold text-accent">{selectedLead.lead_id}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium truncate">{selectedLead.applicant_email}</p></div>
                <div><p className="text-xs text-muted-foreground">Activation Status</p><p className="text-sm font-medium">{selectedLead.activation_status || '-'}</p></div>
                <div><p className="text-xs text-muted-foreground">Card Variant</p><p className="text-sm font-medium">{selectedLead.card_variant || '-'}</p></div>
                <div><p className="text-xs text-muted-foreground">Application No</p><p className="text-sm font-medium">{selectedLead.application_no || '-'}</p></div>
                <div><p className="text-xs text-muted-foreground">Cust Type</p><p className="text-sm font-medium">{selectedLead.cust_type || '-'}</p></div>
                <div><p className="text-xs text-muted-foreground">VKYC Status</p><p className="text-sm font-medium">{selectedLead.vkyc_status || '-'}</p></div>
                <div><p className="text-xs text-muted-foreground">BKYC Status</p><p className="text-sm font-medium">{selectedLead.bkyc_status || '-'}</p></div>
                <div><p className="text-xs text-muted-foreground">Card Issued Date</p><p className="text-sm font-medium">{selectedLead.card_issued_date || '-'}</p></div>
              </div>
              {selectedLead.remark && (
                <div><p className="text-xs text-muted-foreground">Remark</p><p className="text-sm font-medium">{selectedLead.remark}</p></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lead Edit Dialog */}
      <Dialog open={!!editLead} onOpenChange={() => setEditLead(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">Edit Lead</DialogTitle></DialogHeader>
          {editLead && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Customer Name</Label><Input value={editLead.applicant_name} onChange={e => setEditLead({...editLead, applicant_name: e.target.value})} className="mt-1.5" /></div>
                <div><Label>Phone</Label><Input value={editLead.applicant_phone} onChange={e => setEditLead({...editLead, applicant_phone: e.target.value})} className="mt-1.5" /></div>
                <div><Label>Email</Label><Input value={editLead.applicant_email} onChange={e => setEditLead({...editLead, applicant_email: e.target.value})} className="mt-1.5" /></div>
                <div><Label>Product</Label><Input value={editLead.card_name} disabled className="mt-1.5 bg-muted" /></div>
                <div><Label>Advisor</Label><Input value={editLead.advisor_name} disabled className="mt-1.5 bg-muted" /></div>
                <div>
                  <Label>Status</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover border border-border z-50">
                      <SelectItem value="Generated">Generated</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Activation Status</Label>
                  <Select value={editLead.activation_status || '-'} onValueChange={v => setEditLead({...editLead, activation_status: v})}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover border border-border z-50">
                      <SelectItem value="-">-</SelectItem>
                      <SelectItem value="PENDING">PENDING</SelectItem>
                      <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Card Variant (MIS)</Label><Input value={editLead.card_variant || ''} onChange={e => setEditLead({...editLead, card_variant: e.target.value})} className="mt-1.5" /></div>
                <div><Label>Application No (MIS)</Label><Input value={editLead.application_no || ''} onChange={e => setEditLead({...editLead, application_no: e.target.value})} className="mt-1.5" /></div>
                <div>
                  <Label>Cust Type</Label>
                  <Select value={editLead.cust_type || '-'} onValueChange={v => setEditLead({...editLead, cust_type: v})}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover border border-border z-50">
                      <SelectItem value="-">-</SelectItem>
                      <SelectItem value="NEW">NEW</SelectItem>
                      <SelectItem value="EXISTING">EXISTING</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>VKYC Status</Label>
                  <Select value={editLead.vkyc_status || '-'} onValueChange={v => setEditLead({...editLead, vkyc_status: v})}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover border border-border z-50">
                      <SelectItem value="-">-</SelectItem>
                      <SelectItem value="PENDING">PENDING</SelectItem>
                      <SelectItem value="EXPIRED">EXPIRED</SelectItem>
                      <SelectItem value="REJECTED">REJECTED</SelectItem>
                      <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>BKYC Status</Label>
                  <Select value={editLead.bkyc_status || '-'} onValueChange={v => setEditLead({...editLead, bkyc_status: v})}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover border border-border z-50">
                      <SelectItem value="-">-</SelectItem>
                      <SelectItem value="PENDING">PENDING</SelectItem>
                      <SelectItem value="EXPIRED">EXPIRED</SelectItem>
                      <SelectItem value="REJECTED">REJECTED</SelectItem>
                      <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Card Issued Date</Label><Input type="date" value={editLead.card_issued_date || ''} onChange={e => setEditLead({...editLead, card_issued_date: e.target.value})} className="mt-1.5" /></div>
              </div>
              <div><Label>Remark</Label><Input value={editLead.remark || ''} onChange={e => setEditLead({...editLead, remark: e.target.value})} className="mt-1.5" /></div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditLead(null)} className="flex-1">Cancel</Button>
                <Button onClick={handleStatusUpdate} className="flex-1 gradient-accent text-accent-foreground border-0">Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="font-display">Delete Lead</DialogTitle></DialogHeader>
          {deleteConfirm && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Are you sure you want to delete lead <span className="font-bold text-foreground">{deleteConfirm.lead_id}</span>? This action cannot be undone.</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1">Cancel</Button>
                <Button onClick={handleDelete} variant="destructive" className="flex-1">Delete</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default LeadsPage;
