import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, doc, updateDoc, getDoc, setDoc, query, where } from 'firebase/firestore';
import {
  LogOut, Search, Users, ShieldCheck, Settings2, ToggleLeft,
  ToggleRight, Package, Activity, Lock, Unlock, Zap, Menu, X, Megaphone, Calendar, UserPlus
} from 'lucide-react';
import GammaProductManager from '../components/gamma/GammaProductManager';
import { getAllLeads, getAllCampaigns, getAllProducts } from '../services/firebaseService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, Cell
} from 'recharts';

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
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userActivity, setUserActivity] = useState<{ leads: any[], campaigns: any[] }>({ leads: [], campaigns: [] });
  const [isActivityLoading, setIsActivityLoading] = useState(false);
  const [globalLeads, setGlobalLeads] = useState<any[]>([]);
  const [globalCampaigns, setGlobalCampaigns] = useState<any[]>([]);
  const [globalProducts, setGlobalProducts] = useState<any[]>([]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchUsers(), fetchModuleSettings()]);
      const [l, c, p] = await Promise.all([
        getAllLeads(),
        getAllCampaigns(),
        getAllProducts()
      ]);
      setGlobalLeads(l);
      setGlobalCampaigns(c);
      setGlobalProducts(p);
    } catch (e) {
      console.error("Error fetching admin data:", e);
    } finally {
      setLoading(false);
    }
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

  const fetchUserActivity = async (targetUser: any) => {
    setSelectedUser(targetUser);
    setIsActivityLoading(true);
    try {
      const [leadsSnap, campaignsSnap] = await Promise.all([
        getDocs(query(collection(db, 'leads'), where('userId', '==', targetUser.id))),
        getDocs(query(collection(db, 'campaigns'), where('userId', '==', targetUser.id)))
      ]);
      
      setUserActivity({
        leads: leadsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        campaigns: campaignsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      });
    } catch (e) {
      console.error("Error fetching activity:", e);
    } finally {
      setIsActivityLoading(false);
    }
  };

  const handleLogout = async () => { try { await auth.signOut(); } catch (e) { console.error(e); } };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p className="mt-4 text-sm text-muted-foreground font-medium">Initializing Master Console...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> System Online
            </div>
            <button 
              onClick={handleLogout}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/10 transition-colors text-xs font-semibold"
            >
              <LogOut size={16} /> Logout
            </button>
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
          <button className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${activeTab === 'analytics' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50'}`} onClick={() => setActiveTab('analytics')}>
            <Activity size={16} /> Analytics
          </button>
          <button className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${activeTab === 'products' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50'}`} onClick={() => setActiveTab('products')}>
            <Package size={16} /> Inventory
          </button>
        </div>

        {activeTab === 'users' ? (
          <div className="space-y-6">
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
                      <tr key={u.id} className="cursor-pointer hover:bg-secondary/20 transition-colors" onClick={() => fetchUserActivity(u)}>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary border border-primary/20">
                              {(u.company || u.email).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground leading-none mb-1">{u.company || 'Private Entity'}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">UID: {u.id.slice(0, 12)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-sm text-muted-foreground">{u.email}</td>
                        <td className="text-sm">
                          <div className="flex items-center gap-1.5">
                            <Zap size={14} className="text-primary fill-primary/20" />
                            <span className="font-bold text-foreground">{u.credits || 0}</span>
                          </div>
                        </td>
                        <td>
                          <button className={`text-[10px] font-bold px-2 py-0.5 rounded border ${u.leadsEnabled !== false ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`} onClick={(e) => { e.stopPropagation(); toggleUserModule(u.id, 'leadsEnabled', u.leadsEnabled); }}>
                            {u.leadsEnabled !== false ? 'ENABLED' : 'DISABLED'}
                          </button>
                        </td>
                        <td>
                          <button className={`text-[10px] font-bold px-2 py-0.5 rounded border ${u.campaignsEnabled !== false ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`} onClick={(e) => { e.stopPropagation(); toggleUserModule(u.id, 'campaignsEnabled', u.campaignsEnabled); }}>
                            {u.campaignsEnabled !== false ? 'ENABLED' : 'DISABLED'}
                          </button>
                        </td>
                        <td>
                          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <input type="number" className="input-gamma text-xs py-1 px-2 w-16" defaultValue={u.sessionTimeout || ''} onBlur={e => updateTimer(u.id, e.target.value)} />
                            <span className="text-[10px] text-muted-foreground">min</span>
                          </div>
                        </td>
                        <td><span className={`status-pill ${u.status}`}>{u.status === 'active' ? 'Active' : 'Restricted'}</span></td>
                        <td>
                          <button
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${u.status === 'active' ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}
                            onClick={(e) => { e.stopPropagation(); toggleUserStatus(u.id, u.status); }}
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
        ) : activeTab === 'analytics' ? (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold font-display text-foreground mb-6 flex items-center gap-2">
                  <UserPlus size={16} className="text-primary" /> Lead Ingestion Analytics
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={globalLeads.slice(-10).map((l, i) => ({ name: `Pt ${i+1}`, leads: 1 }))}>
                      <defs>
                        <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                      <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px', fontSize: '10px' }} />
                      <Area type="monotone" dataKey="leads" stroke="#a855f7" fill="url(#colorLeads)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold font-display text-foreground mb-6 flex items-center gap-2">
                  <Megaphone size={16} className="text-primary" /> System Campaigns
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Active', value: globalCampaigns.filter(c => c.status === 'active').length },
                      { name: 'Other', value: globalCampaigns.filter(c => c.status !== 'active').length }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                      <XAxis dataKey="name" stroke="#525252" fontSize={10} />
                      <YAxis stroke="#525252" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px', fontSize: '10px' }} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        <Cell fill="#a855f7" />
                        <Cell fill="#3b82f6" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-border/30">
                <h2 className="font-display font-semibold text-foreground">Global Product Directory</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="table-gamma">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Offer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {globalProducts.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-8">No products found.</td></tr>
                    ) : globalProducts.map(p => {
                      const company = users.find(u => u.id === p.userId)?.company || 'N/A';
                      return (
                        <tr key={p.id}>
                          <td className="text-sm">{company}</td>
                          <td className="text-sm font-semibold">{p.name}</td>
                          <td className="text-sm">₹{p.price}</td>
                          <td className="text-sm text-emerald-400 font-bold">₹{p.offeredPrice}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="pt-6 border-t border-border/30">
              <h3 className="section-title text-sm mb-4">Personal Inventory Manager</h3>
              <GammaProductManager user={user} userProfile={userProfile} googleToken={googleToken} onGoogleAuth={onGoogleAuth} />
            </div>
          </div>
        )}
      </main>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
          <div className="relative w-full max-w-xl bg-card border-l border-border h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="sticky top-0 bg-card/90 backdrop-blur-md p-6 border-b border-border flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary border border-primary/20">
                  {(selectedUser.company || selectedUser.email).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display text-foreground">{selectedUser.company || 'User Details'}</h2>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 rounded-full hover:bg-secondary text-muted-foreground"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-8">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-secondary/30 p-4 rounded-2xl shadow-sm border border-border">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Credits</p>
                  <p className="text-xl font-bold text-primary">{selectedUser.credits || 0}</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-2xl shadow-sm border border-border">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Leads</p>
                  <p className="text-xl font-bold text-foreground">{userActivity.leads.length}</p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-2xl shadow-sm border border-border">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Campaigns</p>
                  <p className="text-xl font-bold text-foreground">{userActivity.campaigns.length}</p>
                </div>
              </div>
              {isActivityLoading ? (
                <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-foreground"><Users size={16} className="text-primary" /> Recent Leads</h3>
                    <div className="space-y-2">
                       {userActivity.leads.slice(0, 5).map((l: any) => (
                         <div key={l.id} className="p-3 rounded-xl bg-secondary/20 border border-border/50">
                           <p className="text-sm font-medium text-foreground">{l.name}</p>
                           <p className="text-[10px] text-muted-foreground">{l.number}</p>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
