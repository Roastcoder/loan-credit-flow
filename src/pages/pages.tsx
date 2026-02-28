import { UsersRound, Plus, Search } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const mockTeams = [
  { id: '1', name: 'Sales Team A', leader: 'Amit Sharma', members: 12, active: 10, teamNumber: 'TM001' },
  { id: '2', name: 'Sales Team B', leader: 'Priya Verma', members: 8, active: 7, teamNumber: 'TM002' },
  { id: '3', name: 'Sales Team C', leader: 'Rahul Kumar', members: 15, active: 14, teamNumber: 'TM003' },
  { id: '4', name: 'DSA Partners', leader: 'Sneha Patel', members: 20, active: 18, teamNumber: 'TM004' },
];

const Teams = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeams = mockTeams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.leader.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.teamNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Teams</h1>
            <p className="text-muted-foreground mt-1">Manage all teams and members</p>
          </div>
          <Button className="gradient-accent text-accent-foreground border-0">
            <Plus className="w-4 h-4 mr-2" />
            Create Team
          </Button>
        </div>

        <div className="bg-card rounded-xl p-4 md:p-6 shadow-card border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by team name, leader, or team number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTeams.length > 0 ? (
              filteredTeams.map((team) => (
                <div key={team.id} className="bg-accent/5 rounded-lg p-4 border border-border hover:border-accent/50 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center">
                        <UsersRound className="w-5 h-5 text-accent-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-card-foreground">{team.name}</h3>
                        <p className="text-xs text-muted-foreground">Team Leader: {team.leader}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-accent">{team.teamNumber}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total: </span>
                      <span className="font-semibold text-card-foreground">{team.members}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Active: </span>
                      <span className="font-semibold text-accent">{team.active}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-8 text-center text-muted-foreground">
                No teams found
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-4 shadow-card border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <UsersRound className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{mockTeams.length}</p>
                <p className="text-xs text-muted-foreground">Total Teams</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <UsersRound className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{mockTeams.reduce((sum, t) => sum + t.members, 0)}</p>
                <p className="text-xs text-muted-foreground">Total Members</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <UsersRound className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{mockTeams.reduce((sum, t) => sum + t.active, 0)}</p>
                <p className="text-xs text-muted-foreground">Active Members</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <UsersRound className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{Math.round((mockTeams.reduce((sum, t) => sum + t.active, 0) / mockTeams.reduce((sum, t) => sum + t.members, 0)) * 100)}%</p>
                <p className="text-xs text-muted-foreground">Active Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Teams;
