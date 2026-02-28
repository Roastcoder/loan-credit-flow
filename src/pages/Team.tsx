import { Users, UserPlus, Search } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const mockTeamMembers = [
  { id: '1', name: 'Amit Sharma', role: 'Team Leader', mobile: '9876543210', teamNumber: 'TM001', status: 'Active' },
  { id: '2', name: 'Priya Verma', role: 'Employee', mobile: '9876543211', teamNumber: 'TM001', status: 'Active' },
  { id: '3', name: 'Rahul Kumar', role: 'Employee', mobile: '9876543212', teamNumber: 'TM001', status: 'Active' },
  { id: '4', name: 'Sneha Patel', role: 'Employee', mobile: '9876543213', teamNumber: 'TM001', status: 'Active' },
  { id: '5', name: 'Vikram Singh', role: 'Employee', mobile: '9876543214', teamNumber: 'TM001', status: 'Inactive' },
];

const Team = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = mockTeamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.mobile.includes(searchQuery) ||
    member.teamNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">My Team</h1>
            <p className="text-muted-foreground mt-1">Manage your team members</p>
          </div>
          <Button className="gradient-accent text-accent-foreground border-0">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </div>

        <div className="bg-card rounded-xl p-4 md:p-6 shadow-card border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, mobile, or team number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Mobile</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Team Number</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="border-b border-border last:border-0 hover:bg-accent/5 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center text-xs font-bold text-accent-foreground">
                            {member.name.charAt(0)}
                          </div>
                          <span className="font-medium text-card-foreground">{member.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">{member.role}</td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">{member.mobile}</td>
                      <td className="py-4 px-4 text-sm font-mono text-accent">{member.teamNumber}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          member.status === 'Active' 
                            ? 'bg-accent/10 text-accent' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No team members found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-4 shadow-card border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{mockTeamMembers.filter(m => m.status === 'Active').length}</p>
                <p className="text-xs text-muted-foreground">Active Members</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{mockTeamMembers.length}</p>
                <p className="text-xs text-muted-foreground">Total Members</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">TM001</p>
                <p className="text-xs text-muted-foreground">Team Number</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Team;
