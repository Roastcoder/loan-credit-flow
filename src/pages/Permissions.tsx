import { useState, useEffect } from 'react';
import { Shield, CreditCard, FileText, Check, X, Users, Save } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { useRole } from '@/contexts/RoleContext';
import { ROLE_LABELS, UserRole, Permission } from '@/types';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { api } from '@/services/api';

const permissionKeys: (keyof Permission)[] = ['view', 'edit', 'add', 'delete'];
const permissionLabels: Record<keyof Permission, string> = { view: 'View', edit: 'Edit', add: 'Add', delete: 'Delete' };
const allRoles: UserRole[] = ['admin', 'manager', 'team_leader', 'employee', 'dsa_partner'];

const MANAGER_FIELDS = [
  'Customer Name', 'Mobile Number', 'RC Number', 'Engine Number',
  'Chassis Number', 'Existing Lender', 'Case Type', 'Financier',
  'Loan Amount', 'Interest Rate', 'Tenure (Months)', 'RC Collection',
  'Channel Name', 'Disbursed Date', 'Dealing Person', 'Channel Code',
  'PDD Status',
] as const;

type FieldPerm = { view: boolean; edit: boolean };
type ManagerFieldPerms = Record<string, Record<string, FieldPerm>>;

const buildDefaultFieldPerms = (): ManagerFieldPerms => {
  const managers = DEMO_USERS.filter(u => u.role === 'manager' || u.role === 'team_leader' || u.role === 'admin');
  const perms: ManagerFieldPerms = {};
  managers.forEach(m => {
    perms[m.id] = {};
    MANAGER_FIELDS.forEach(field => {
      perms[m.id][field] = { view: true, edit: m.role === 'admin' };
    });
  });
  return perms;
};

const PermissionsPage = () => {
  const { role, userAccess, setUserAccess, rolePermissions, setRolePermissions } = useRole();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [managerFieldPerms, setManagerFieldPerms] = useState<ManagerFieldPerms>({});
  const [selectedManagerForFields, setSelectedManagerForFields] = useState<string>('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data.users || []);
      
      // Load user access from permissions
      const access: Record<string, any> = {};
      data.users?.forEach((u: any) => {
        if (u.permissions?.access) {
          access[u.id] = u.permissions.access;
        } else {
          access[u.id] = { creditCards: false, loanDisbursement: false };
        }
      });
      setUserAccess(access);
      
      // Build field permissions for fetched users
      const perms: ManagerFieldPerms = {};
      data.users?.forEach((u: any) => {
        if (u.role === 'manager' || u.role === 'team_leader' || u.role === 'admin') {
          perms[u.id] = {};
          MANAGER_FIELDS.forEach(field => {
            perms[u.id][field] = { view: true, edit: u.role === 'admin' };
          });
        }
      });
      setManagerFieldPerms(perms);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (role !== 'super_admin' && role !== 'admin') {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <X className="w-16 h-16 text-destructive mb-4" />
          <h1 className="text-2xl font-display font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground mt-2">Only Super Admin and Admin can manage permissions.</p>
        </div>
      </AppLayout>
    );
  }

  const toggleUserAccess = async (userId: string, module: 'creditCards' | 'loanDisbursement') => {
    const currentAccess = userAccess[userId] || { creditCards: false, loanDisbursement: false };
    const newAccess = {
      ...currentAccess,
      [module]: !currentAccess[module]
    };
    
    setUserAccess(prev => ({
      ...prev,
      [userId]: newAccess,
    }));
    
    // Save to database
    try {
      await api.updateUserPermissions(userId, { access: newAccess });
    } catch (error) {
      console.error('Failed to save permissions:', error);
    }
  };

  const toggleRolePerm = (r: UserRole, module: 'creditCards' | 'loanDisbursement', perm: keyof Permission) => {
    setRolePermissions(prev => ({
      ...prev,
      [r]: {
        ...prev[r],
        [module]: { ...prev[r][module], [perm]: !prev[r][module][perm] },
      },
    }));
  };

  const toggleFieldPerm = (userId: string, field: string, type: 'view' | 'edit') => {
    setManagerFieldPerms(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: {
          ...prev[userId][field],
          [type]: !prev[userId][field][type],
          ...(type === 'view' && prev[userId][field].view ? { edit: false } : {}),
          ...(type === 'edit' && !prev[userId][field].edit ? { view: true } : {}),
        },
      },
    }));
  };

  const handleSaveFieldPerms = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    try {
      await api.updateUserPermissions(userId, managerFieldPerms[userId]);
      toast({ title: 'Permissions Saved', description: `Field permissions for ${user?.name || 'user'} updated successfully.` });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save permissions', variant: 'destructive' });
    }
  };

  const managersForFieldPerms = users.filter(u => u.role === 'manager' || u.role === 'team_leader' || u.role === 'admin');

  const RolePermCard = ({ r, module }: { r: UserRole; module: 'creditCards' | 'loanDisbursement' }) => (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent">
          {ROLE_LABELS[r]}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {permissionKeys.map(p => (
          <div key={p} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
            <span className="text-xs font-medium text-card-foreground">{permissionLabels[p]}</span>
            <Switch
              checked={rolePermissions[r][module][p]}
              onCheckedChange={() => toggleRolePerm(r, module, p)}
              disabled={role !== 'super_admin'}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-3 h-[calc(100vh-8rem)] overflow-hidden flex flex-col">
        <div>
          <h1 className="text-xl md:text-2xl font-display font-bold text-foreground">Permission Management</h1>
          <p className="text-muted-foreground mt-0.5 text-xs">Manage role permissions, user access, and field-level controls</p>
        </div>

        <Tabs defaultValue="role-permissions" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="bg-muted w-full md:w-auto flex-wrap h-auto mb-4">
            <TabsTrigger value="role-permissions" className="flex items-center gap-1.5 flex-1 md:flex-none text-xs h-8">
              <Shield className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Role</span> Perms
            </TabsTrigger>
            <TabsTrigger value="user-access" className="flex items-center gap-1.5 flex-1 md:flex-none text-xs h-8">
              <CreditCard className="w-3.5 h-3.5" /> Access
            </TabsTrigger>
            <TabsTrigger value="field-permissions" className="flex items-center gap-1.5 flex-1 md:flex-none text-xs h-8">
              <Users className="w-3.5 h-3.5" /> Field Perms
            </TabsTrigger>
          </TabsList>

          <TabsContent value="role-permissions" className="flex-1 overflow-y-auto space-y-4">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <CreditCard className="w-4 h-4 text-accent" />
                <h3 className="font-display font-semibold text-sm text-foreground">Credit Card Module</h3>
              </div>
              <div className="md:hidden space-y-3">
                {allRoles.map(r => <RolePermCard key={r} r={r} module="creditCards" />)}
              </div>
              <div className="hidden md:block bg-card rounded-xl shadow-card border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20">
                      <TableHead className="min-w-[140px]">Role</TableHead>
                      {permissionKeys.map(p => (
                        <TableHead key={p} className="text-center min-w-[80px]">{permissionLabels[p]}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allRoles.map(r => (
                      <TableRow key={r} className="hover:bg-muted/30">
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent">
                            {ROLE_LABELS[r]}
                          </span>
                        </TableCell>
                        {permissionKeys.map(p => (
                          <TableCell key={p} className="text-center">
                            <div className="flex justify-center">
                              <Switch
                                checked={rolePermissions[r].creditCards[p]}
                                onCheckedChange={() => toggleRolePerm(r, 'creditCards', p)}
                                disabled={role !== 'super_admin'}
                              />
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <FileText className="w-4 h-4 text-accent" />
                <h3 className="font-display font-semibold text-sm text-foreground">Loan Disbursement Module</h3>
              </div>
              <div className="md:hidden space-y-3">
                {allRoles.map(r => <RolePermCard key={r} r={r} module="loanDisbursement" />)}
              </div>
              <div className="hidden md:block bg-card rounded-xl shadow-card border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20">
                      <TableHead className="min-w-[140px]">Role</TableHead>
                      {permissionKeys.map(p => (
                        <TableHead key={p} className="text-center min-w-[80px]">{permissionLabels[p]}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allRoles.map(r => (
                      <TableRow key={r} className="hover:bg-muted/30">
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent">
                            {ROLE_LABELS[r]}
                          </span>
                        </TableCell>
                        {permissionKeys.map(p => (
                          <TableCell key={p} className="text-center">
                            <div className="flex justify-center">
                              <Switch
                                checked={rolePermissions[r].loanDisbursement[p]}
                                onCheckedChange={() => toggleRolePerm(r, 'loanDisbursement', p)}
                                disabled={role !== 'super_admin'}
                              />
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {role !== 'super_admin' && (
              <p className="text-sm text-muted-foreground text-center">Only Super Admin can modify role permissions.</p>
            )}
          </TabsContent>

          <TabsContent value="user-access" className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
              </div>
            ) : (
              <>
                <div className="md:hidden space-y-3">
                  {users.map(user => {
                    const access = userAccess[user.id] || { creditCards: false, loanDisbursement: false };
                    return (
                      <div key={user.id} className="bg-card rounded-xl border border-border shadow-card p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-card-foreground truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent/10 text-accent flex-shrink-0 ml-2">
                            {ROLE_LABELS[user.role]}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <CreditCard className="w-3.5 h-3.5 text-accent" />
                              <span className="text-xs font-medium text-card-foreground">Cards</span>
                            </div>
                            <Switch checked={access.creditCards} onCheckedChange={() => toggleUserAccess(user.id, 'creditCards')} />
                          </div>
                          <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-accent" />
                              <span className="text-xs font-medium text-card-foreground">Loans</span>
                            </div>
                            <Switch checked={access.loanDisbursement} onCheckedChange={() => toggleUserAccess(user.id, 'loanDisbursement')} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="hidden md:block bg-card rounded-xl shadow-card border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="min-w-[120px]">User</TableHead>
                        <TableHead className="min-w-[160px]">Email</TableHead>
                        <TableHead className="min-w-[100px]">Role</TableHead>
                        <TableHead className="min-w-[120px]">
                          <div className="flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5 text-accent" /> Credit Cards
                          </div>
                        </TableHead>
                        <TableHead className="min-w-[120px]">
                          <div className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-accent" /> Loans
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map(user => {
                        const access = userAccess[user.id] || { creditCards: false, loanDisbursement: false };
                        return (
                          <TableRow key={user.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium text-sm">{user.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent/10 text-accent">
                                {ROLE_LABELS[user.role]}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch checked={access.creditCards} onCheckedChange={() => toggleUserAccess(user.id, 'creditCards')} />
                                {access.creditCards ? <Check className="w-3.5 h-3.5 text-success" /> : <X className="w-3.5 h-3.5 text-destructive" />}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch checked={access.loanDisbursement} onCheckedChange={() => toggleUserAccess(user.id, 'loanDisbursement')} />
                                {access.loanDisbursement ? <Check className="w-3.5 h-3.5 text-success" /> : <X className="w-3.5 h-3.5 text-destructive" />}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="field-permissions" className="flex-1 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Select User to Manage Permissions</label>
                <Select value={selectedManagerForFields} onValueChange={setSelectedManagerForFields}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Choose a user..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
                    {managersForFieldPerms.map(manager => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name} - {manager.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedManagerForFields && (
                <Button onClick={() => handleSaveFieldPerms(selectedManagerForFields)} className="gradient-accent text-accent-foreground border-0 h-9 text-xs gap-1.5 mt-6">
                  <Save className="w-3.5 h-3.5" /> Save Permissions
                </Button>
              )}
            </div>

            {selectedManagerForFields && (() => {
              const perms = managerFieldPerms[selectedManagerForFields] || {};
              return (
                <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
                  <div className="p-3 bg-muted/20 border-b border-border">
                    <p className="text-sm font-semibold text-card-foreground">
                      Field Permissions for {managersForFieldPerms.find(m => m.id === selectedManagerForFields)?.name}
                    </p>
                  </div>
                  <div className="p-3 space-y-1.5 max-h-[500px] overflow-y-auto">
                    {MANAGER_FIELDS.map(field => {
                      const fp = perms[field] || { view: false, edit: false };
                      return (
                        <div key={field} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                          <span className="text-xs font-medium text-card-foreground">{field}</span>
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1 cursor-pointer">
                              <Checkbox
                                checked={fp.view}
                                onCheckedChange={() => toggleFieldPerm(selectedManagerForFields, field, 'view')}
                                className="h-3.5 w-3.5"
                              />
                              <span className="text-[10px] text-muted-foreground">View</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                              <Checkbox
                                checked={fp.edit}
                                onCheckedChange={() => toggleFieldPerm(selectedManagerForFields, field, 'edit')}
                                className="h-3.5 w-3.5"
                              />
                              <span className="text-[10px] text-muted-foreground">Edit</span>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {!selectedManagerForFields && (
              <div className="bg-card rounded-xl shadow-card border border-border p-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Select a user from the dropdown above to manage their field permissions</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default PermissionsPage;
