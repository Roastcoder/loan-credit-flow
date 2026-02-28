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
  const { role } = useRole();
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editStatus, setEditStatus] = useState('');

  const filtered = leads.filter(l => {
    const matchSearch = l.applicant_name.toLowerCase().includes(search.toLowerCase()) || l.lead_id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusUpdate = async () => {
    if (!selectedLead) return;
    setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, status: editStatus } : l));
    toast({ title: 'Lead updated', description: `${selectedLead.lead_id} status changed to ${editStatus}` });
    setSelectedLead(null);
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
                <TableHead>Type</TableHead>
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
                  <TableCell className="text-sm">{lead.type}</TableCell>
                  <TableCell className="text-sm">{lead.card_name}</TableCell>
                  <TableCell className="text-sm">{lead.bank_name}</TableCell>
                  <TableCell className="text-sm">{lead.advisor_name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[lead.status] || ''}`}>
                      {lead.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { navigator.clipboard.writeText(lead.lead_id); toast({ title: 'Copied', description: 'Lead ID copied to clipboard' }); }}>
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setSelectedLead(lead); setEditStatus(lead.status); }}>
                        <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { if (confirm('Delete this lead?')) { setLeads(prev => prev.filter(l => l.id !== lead.id)); toast({ title: 'Deleted', description: 'Lead deleted successfully' }); } }}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="font-display">Lead Details</DialogTitle></DialogHeader>
          {selectedLead && (
            <div className="space-y-4 mt-2">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Lead ID</p>
                <p className="font-mono font-bold text-accent">{selectedLead.lead_id}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">Name</p><p className="text-sm font-medium">{selectedLead.applicant_name}</p></div>
                <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium truncate">{selectedLead.applicant_email}</p></div>
                <div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm font-medium">{selectedLead.applicant_phone}</p></div>
                <div><p className="text-xs text-muted-foreground">Card</p><p className="text-sm font-medium">{selectedLead.card_name}</p></div>
              </div>
              {(role === 'super_admin' || role === 'admin' || role === 'manager') && (
                <div>
                  <Label>Update Status</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-popover border border-border z-50">
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleStatusUpdate} className="w-full mt-3 gradient-accent text-accent-foreground border-0">Update Lead</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default LeadsPage;
