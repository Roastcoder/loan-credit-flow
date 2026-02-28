import { UserCircle, CreditCard, Building2, Mail, Phone, MapPin, Calendar, Cake } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { useRole } from '@/contexts/RoleContext';
import { useEffect, useState } from 'react';

const Profile = () => {
  const { displayName, role } = useRole();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const response = await fetch('http://localhost:8000/api/auth/profile.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile: user.mobile }),
        });
        const data = await response.json();
        if (data.success) {
          setProfile(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading profile...</div>
        </div>
      </AppLayout>
    );
  }

  const userProfile = {
    name: profile?.name || displayName || 'User',
    email: profile?.email || 'N/A',
    phone: profile?.mobile || 'N/A',
    dob: profile?.dob || 'N/A',
    address: profile?.aadhaar_address || 'Not provided',
    fatherName: profile?.aadhaar_father_name || 'Not provided',
    aadhaarName: profile?.aadhaar_name || 'N/A',
    joinDate: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A',
    aadhaar: profile?.aadhaar || 'N/A',
    pan: profile?.pan || 'N/A',
    channelCode: profile?.channel_code || 'N/A',
    employeeType: profile?.employee_type || 'N/A',
    accountNumber: profile?.bank_account || 'N/A',
    ifsc: profile?.ifsc || 'N/A',
    profilePic: profile?.aadhaar_photo || null,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1">View your personal and financial information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
              <div className="flex items-center gap-3 mb-6">
                {userProfile.profilePic ? (
                  <img src={userProfile.profilePic} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                    <UserCircle className="w-8 h-8 text-accent" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-display font-semibold text-card-foreground">{userProfile.name}</h2>
                  <p className="text-sm text-muted-foreground uppercase">{userProfile.employeeType}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium text-card-foreground">{userProfile.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium text-card-foreground">{userProfile.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Channel Code</p>
                    <p className="text-sm font-medium text-card-foreground">{userProfile.channelCode}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Cake className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Date of Birth</p>
                    <p className="text-sm font-medium text-card-foreground">{userProfile.dob}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="text-sm font-medium text-card-foreground">{userProfile.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <UserCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Father's Name</p>
                    <p className="text-sm font-medium text-card-foreground">{userProfile.fatherName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="text-sm font-medium text-card-foreground">{userProfile.joinDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {(userProfile.accountNumber !== 'N/A' || userProfile.ifsc !== 'N/A') && (
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-display font-semibold text-card-foreground">Bank Information</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Account Number</p>
                  <p className="text-sm font-medium text-card-foreground font-mono">{userProfile.accountNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">IFSC Code</p>
                  <p className="text-sm font-medium text-card-foreground font-mono">{userProfile.ifsc}</p>
                </div>
              </div>
            </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-card border border-border">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-display font-semibold text-card-foreground">Documents</h2>
              </div>
              <div className="space-y-4">
                {userProfile.aadhaar !== 'N/A' && (
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Aadhaar Card</p>
                  <p className="text-lg font-bold text-card-foreground font-mono">{userProfile.aadhaar}</p>
                  {userProfile.aadhaarName !== 'N/A' && (
                    <p className="text-xs text-muted-foreground mt-2">Name: {userProfile.aadhaarName}</p>
                  )}
                  <div className="mt-3 pt-3 border-t border-border">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600">
                      Verified
                    </span>
                  </div>
                </div>
                )}
                {userProfile.pan !== 'N/A' && (
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-1">PAN Card</p>
                  <p className="text-lg font-bold text-card-foreground font-mono">{userProfile.pan}</p>
                  <div className="mt-3 pt-3 border-t border-border">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600">
                      Verified
                    </span>
                  </div>
                </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
