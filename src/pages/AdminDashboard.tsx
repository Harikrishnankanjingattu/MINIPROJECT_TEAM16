import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import {
  LogOut, Search, Users, ShieldCheck, Settings2, ToggleLeft,
  ToggleRight, Package, Activity, Lock, Unlock, Zap, Menu
} from 'lucide-react';
import GammaProductManager from '../components/gamma/GammaProductManager';

interface Props {
  user: any;
  userProfile: any;
  googleToken: string | null;
  onGoogleAuth: () => Promise<void>;
}

const AdminDashboard = ({ user, userProfile, googleToken, onGoogleAuth }: Props) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('users');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [moduleSettings, setModuleSettings] = useState({ leadsEnabled: true, campaignsEnabled: true });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchModuleSettings()]);
    setLoading(false);
  };

  const fetchModuleSettings = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'modules'));
      if (docSnap.exists()) setModuleSettings(docSnap.data() as any);
      else await setDoc(doc(db, 'settings', 'modules'), { leadsEnabled: true, campaignsEnabled: true });
    } catch (e) { console.error(e); }
  };

  const toggleModule = async (module: string) => {
    const newSettings = { ...moduleSettings, [module]: !(moduleSettings as any)[module] };
    try { await setDoc(doc(db, 'settings', 'modules'), newSettings); setModuleSettings(newSettings); } catch (e) { console.error(e); }
  };

  const fetchUsers = async () => {
    try {
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try { await updateDoc(doc(db, 'users', userId), { status: newStatus }); setUsers(u => u.map(x => x.id === userId ? { ...x, status: newStatus } : x)); } catch (e) { console.error(e); }
  };

  const toggleUserModule = async (userId: string, module: string, currentVal: boolean) => {
    const newVal = currentVal === false ? true : false;
    try { await updateDoc(doc(db, 'users', userId), { [module]: newVal }); setUsers(u => u.map(x => x.id === userId ? { ...x, [module]: newVal } : x)); } catch (e) { console.error(e); }
  };

  const updateTimer = async (userId: string, minutes: string) => {
    const timeoutVal = minutes ? parseInt(minutes) : null;
    try { await updateDoc(doc(db, 'users', userId), { sessionTimeout: timeoutVal, sessionStartedAt: timeoutVal ? new Date().toISOString() : null }); setUsers(u => u.map(x => x.id === userId ? { ...x, sessionTimeout: timeoutVal } : x)); } catch (e) { console.error(e); }
  };

  const filteredUsers = users.filter(u => {
    if (u.role === 'admin') return false;
    const matchesSearch = u.company?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || u.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: users.filter(u => u.role !== 'admin').length,
    active: users.filter(u => u.status === 'active' && u.role !== 'admin').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    totalCredits: users.reduce((acc, curr) => acc + (curr.credits || 0), 0)
  };

  const handleLogout = async () => { try { await auth.signOut(); } catch (e) { console.error(e); } };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p className="mt-4 text-sm text-muted-foreground font-medium">Initializing Master Console...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 z-20 h-14 bg-card/90 backdrop-blur-xl border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <button className="p-1.5" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}><Menu size={20} className="text-foreground" /></button>
            <ShieldCheck size={18} className="text-primary" />
            <span className="text-sm font-bold font-display text-foreground">Master Admin</span>
          </div>
          <button className="p-1.5 text-muted-foreground hover:text-destructive" onClick={handleLogout}><LogOut size={18} /></button>
        </header>
      )}

      <main className="transition-all duration-300 max-w-7xl mx-auto pt-20 pb-20 px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="section-title text-foreground">Master Console</h1>
            <p className="section-subtitle">Sub-admin orchestration & system telemetry</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> System Online
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Sub-Admins', value: stats.total, icon: Users, color: 'text-primary' },
            { label: 'Operational', value: stats.active, icon: Zap, color: 'text-emerald-400' },
            { label: 'Restricted', value: stats.suspended, icon: Lock, color: 'text-destructive' },
            { label: 'Credits', value: stats.totalCredits, icon: Activity, color: 'text-warning' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold font-display text-foreground">{s.value}</span>
                <s.icon size={20} className={s.color} />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${activeTab === 'users' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50'}`} onClick={() => setActiveTab('users')}>
            <Users size={16} /> Partners
          </button>
          <button className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${activeTab === 'products' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50'}`} onClick={() => setActiveTab('products')}>
            <Package size={16} /> Inventory
          </button>
        </div>

        {activeTab === 'users' ? (
          <div className="space-y-6">
            {/* Feature Flags */}
            <div className="glass-card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Settings2 size={18} className="text-primary" />
                <h2 className="font-display font-semibold text-foreground">Feature Flags</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { key: 'leadsEnabled', label: 'Lead Engine', desc: 'Global toggle' },
                  { key: 'campaignsEnabled', label: 'Campaign Automator', desc: 'Global toggle' },
                ].map(m => (
                  <div key={m.key} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.label}</p>
                      <p className="text-xs text-muted-foreground">{m.desc}</p>
                    </div>
                    <button className={`flex items-center gap-1.5 text-xs font-semibold ${(moduleSettings as any)[m.key] ? 'text-emerald-400' : 'text-destructive'}`} onClick={() => toggleModule(m.key)}>
                      {(moduleSettings as any)[m.key] ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-border/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-display font-semibold text-foreground">Sub-Admin Directory</h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input className="input-gamma text-xs py-1.5 pl-8 pr-3 w-48" placeholder="Filter..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                  <select className="input-gamma text-xs py-1.5 w-36" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="suspended">Restricted</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="table-gamma">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Email</th>
                      <th>Credits</th>
                      <th>Leads</th>
                      <th>Campaign</th>
                      <th>Session</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">No sub-admins found.</td></tr>
                    ) : filteredUsers.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {(u.company || u.email).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{u.company || 'Private'}</p>
                              <p className="text-[10px] text-muted-foreground">ID: {u.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-sm text-muted-foreground">{u.email}</td>
                        <td className="text-sm font-semibold text-foreground">{u.credits || 0}</td>
                        <td>
                          <button className={`text-xs font-semibold px-2 py-1 rounded ${u.leadsEnabled !== false ? 'bg-emerald-500/10 text-emerald-400' : 'bg-destructive/10 text-destructive'}`} onClick={() => toggleUserModule(u.id, 'leadsEnabled', u.leadsEnabled)}>
                            {u.leadsEnabled !== false ? 'ON' : 'OFF'}
                          </button>
                        </td>
                        <td>
                          <button className={`text-xs font-semibold px-2 py-1 rounded ${u.campaignsEnabled !== false ? 'bg-emerald-500/10 text-emerald-400' : 'bg-destructive/10 text-destructive'}`} onClick={() => toggleUserModule(u.id, 'campaignsEnabled', u.campaignsEnabled)}>
                            {u.campaignsEnabled !== false ? 'ON' : 'OFF'}
                          </button>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <input type="number" className="input-gamma text-xs py-1 px-2 w-16" defaultValue={u.sessionTimeout || ''} onBlur={e => updateTimer(u.id, e.target.value)} />
                            <span className="text-[10px] text-muted-foreground">min</span>
                          </div>
                        </td>
                        <td><span className={`status-pill ${u.status}`}>{u.status === 'active' ? 'Active' : 'Restricted'}</span></td>
                        <td>
                          <button
                            className={`text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 ${u.status === 'active' ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}
                            onClick={() => toggleUserStatus(u.id, u.status)}
                          >
                            {u.status === 'active' ? <><Lock size={12} /> Restrict</> : <><Unlock size={12} /> Authorize</>}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <GammaProductManager user={user} userProfile={userProfile} googleToken={googleToken} onGoogleAuth={onGoogleAuth} />
        )}
      </main>

    </div>
  );
};

export default AdminDashboard;
