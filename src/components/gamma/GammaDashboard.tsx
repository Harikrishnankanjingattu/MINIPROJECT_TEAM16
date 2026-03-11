import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Megaphone, TrendingUp, Search, ArrowUpRight } from 'lucide-react';
import { getAnalytics } from '../../services/firebaseService';
import { readFromGoogleSheets } from '../../services/googleSheets';

const GammaDashboard = ({ user, userProfile }: { user: any; userProfile: any }) => {
  const [analytics, setAnalytics] = useState({ totalLeads: 0, totalUsers: 0, totalCampaigns: 0, recentLeads: [] as any[] });
  const [sheetLeads, setSheetLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('google_token');
      const [a, s] = await Promise.all([getAnalytics(user.uid), readFromGoogleSheets(token)]);
      setAnalytics(a);
      setSheetLeads(s);
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { icon: UserPlus, title: 'Total Leads', value: analytics.totalLeads + (sheetLeads?.length || 0), color: 'text-primary' },
    { icon: Megaphone, title: 'Campaigns', value: analytics.totalCampaigns, color: 'text-violet-400' },
    { icon: TrendingUp, title: 'Conversion', value: '84%', color: 'text-emerald-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title text-foreground">Overview</h1>
        <p className="section-subtitle">Welcome back, {userProfile?.company || 'Partner'}!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{s.title}</span>
              <s.icon size={18} className={s.color} />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold font-display text-foreground">{loading ? '...' : s.value}</span>
              <span className="text-xs text-emerald-400 flex items-center gap-0.5 mb-1"><ArrowUpRight size={12} />12%</span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card overflow-hidden relative"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#a855f7] to-[#ec4899]" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-border/30 gap-4">
          <div>
            <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Recent Leads
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Latest customer acquisitions across all channels</p>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input className="input-gamma text-sm py-2 pl-9 pr-4 w-full sm:w-64 bg-background/50 focus:bg-background transition-colors" placeholder="Search leads..." />
          </div>
        </div>
        <div className="overflow-x-auto p-2">
          <table className="table-gamma w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <th className="pb-3 pt-2 px-4 font-medium">Customer</th>
                <th className="pb-3 pt-2 px-4 font-medium">Contact</th>
                <th className="pb-3 pt-2 px-4 font-medium">Source</th>
                <th className="pb-3 pt-2 px-4 font-medium">Date</th>
                <th className="pb-3 pt-2 px-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {analytics.recentLeads.slice(0, 5).map((lead: any) => (
                <tr key={lead.id} className="hover:bg-sidebar-accent/50 transition-colors group">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shadow-inner">{lead.name?.charAt(0)}</div>
                      <span className="text-foreground font-semibold">{lead.name}</span>
                    </div>
                  </td>
                  <td className="text-muted-foreground">{lead.number}</td>
                  <td><span className="status-pill active">Firebase</span></td>
                  <td className="text-muted-foreground">{lead.createdAt ? new Date(lead.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                  <td className="py-4 px-4">
                    <span className="flex items-center justify-end gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" /> 
                      <span className="text-emerald-400 font-medium text-sm">New</span>
                    </span>
                  </td>
                </tr>
              ))}
              {sheetLeads.slice(0, 3).map((lead: any, idx: number) => (
                <tr key={`sh-${idx}`} className="hover:bg-sidebar-accent/50 transition-colors group">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center text-sm font-bold text-violet-400 shadow-inner">{lead.name?.charAt(0)}</div>
                      <span className="text-foreground font-semibold">{lead.name}</span>
                    </div>
                  </td>
                  <td className="text-sm text-muted-foreground">{lead.number}</td>
                  <td><span className="status-pill" style={{ background: 'hsl(var(--warning) / 0.1)', color: 'hsl(var(--warning))' }}>Sheets</span></td>
                  <td className="text-sm text-muted-foreground">{lead.timestamp || 'N/A'}</td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-sm text-muted-foreground font-medium">Pending</span>
                  </td>
                </tr>
              ))}
              {analytics.recentLeads.length === 0 && sheetLeads.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground">
                    <UserPlus size={32} className="mx-auto mb-3 opacity-20" />
                    <p>No leads discovered yet.</p>
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground">
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                    <p>Loading records...</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default GammaDashboard;
