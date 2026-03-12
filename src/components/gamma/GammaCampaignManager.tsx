import { useState, useEffect } from 'react';
import { Megaphone, Plus, X, Users, Calendar, Package, Download } from 'lucide-react';
import { addCampaign, getCampaigns, getLeads, getProducts } from '../../services/firebaseService';

const GammaCampaignManager = ({ user }: { user: any }) => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', selectedUsers: [] as string[], scheduledDate: '', scheduledTime: '', productId: '' });
  const [message, setMessage] = useState<{ type: string; text: string }>({ type: '', text: '' });

  useEffect(() => { if (user?.uid) loadData(); }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [c, l, p] = await Promise.all([
        getCampaigns(user.uid), 
        getLeads(user.uid), 
        getProducts(user.uid)
      ]);
      setCampaigns(c); setLeads(l); setProducts(p);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDownloadCSV = (campaign: any) => {
    // Collect selected leads data
    const selectedLeads = leads.filter(l => campaign.selectedUsers.includes(l.id));
    const product = products.find(p => p.id === campaign.productId);
    
    // Prepare CSV header
    let csvContent = "Lead Name,Number,Location,Product,Price,Offer Price,Campaign Date,Campaign Status\n";
    
    // Prepare CSV rows
    selectedLeads.forEach(lead => {
      const row = [
        `"${(lead.name || 'N/A').replace(/"/g, '""')}"`,
        `"${(lead.number || 'N/A').replace(/"/g, '""')}"`,
        `"${(lead.location || 'N/A').replace(/"/g, '""')}"`,
        `"${(product?.name || 'N/A').replace(/"/g, '""')}"`,
        `"${(product?.price || '0').toString().replace(/"/g, '""')}"`,
        `"${(product?.offeredPrice || '0').toString().replace(/"/g, '""')}"`,
        `"${(campaign.scheduledDate || 'N/A').replace(/"/g, '""')}"`,
        `"${(campaign.status || 'N/A').replace(/"/g, '""')}"`
      ].join(",");
      csvContent += row + "\n";
    });

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `campaign_${campaign.name.replace(/\s+/g, '_')}_leads.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUserSelection = (id: string) => {
    setFormData(p => ({
      ...p,
      selectedUsers: p.selectedUsers.includes(id) ? p.selectedUsers.filter(u => u !== id) : [...p.selectedUsers, id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim() || !formData.scheduledDate || !formData.scheduledTime) {
      setMessage({ type: 'error', text: 'Fill all required fields' }); return;
    }
    if (formData.selectedUsers.length === 0) {
      setMessage({ type: 'error', text: 'Select at least one lead' }); return;
    }
    try {
      const result = await addCampaign({
        ...formData, status: 'active', createdDate: new Date().toISOString()
      }, user.uid);
      if (result.success) {
        setMessage({ type: 'success', text: 'Campaign created!' });
        setTimeout(() => { setShowModal(false); loadData(); setMessage({ type: '', text: '' }); }, 1000);
        setFormData({ name: '', description: '', selectedUsers: [], scheduledDate: '', scheduledTime: '', productId: '' });
      }
    } catch (e: any) { 
      setMessage({ type: 'error', text: e.message || 'Error occurred' }); 
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title text-foreground">Campaigns</h1>
          <p className="section-subtitle">Create and manage marketing campaigns</p>
        </div>
        <button className="btn-gamma text-sm flex items-center gap-1.5" onClick={() => { setShowModal(true); loadData(); }}>
          <Plus size={16} /> Create Campaign
        </button>
      </div>

      {loading && campaigns.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Loading...</p>
      ) : campaigns.length === 0 ? (
        <div className="glass-card p-12 text-center text-muted-foreground">
          <Megaphone size={40} className="mx-auto mb-3 opacity-30" />
          <p>No campaigns yet</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map(c => (
            <div key={c.id} className="glass-card-hover p-5 space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="font-display font-semibold text-foreground">{c.name}</h3>
                <span className="status-pill active">{c.status}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>
              {c.productId && (
                <div className="flex items-center gap-1.5 text-xs text-primary">
                  <Package size={12} /> {products.find(p => p.id === c.productId)?.name || 'Product'}
                </div>
              )}
              {c.scheduledDate && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar size={12} /> {new Date(c.scheduledDate).toLocaleDateString()} at {c.scheduledTime}
                </div>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-border/30">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users size={12} /> {c.selectedUsers?.length || 0}</span>
                  <span>{c.createdAt ? new Date(c.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                </div>
                <button 
                  onClick={() => handleDownloadCSV(c)}
                  className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                  title="Download Leads CSV"
                >
                  <Download size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold text-foreground text-lg">Create Campaign</h2>
              <button className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Name *</label>
                <input className="input-gamma" placeholder="Campaign name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Link Product</label>
                <select className="input-gamma" value={formData.productId} onChange={e => setFormData(p => ({ ...p, productId: e.target.value }))}>
                  <option value="">No Product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Description *</label>
                <textarea className="input-gamma min-h-[80px] resize-none" placeholder="Describe..." value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Date *</label>
                  <input type="date" className="input-gamma" value={formData.scheduledDate} onChange={e => setFormData(p => ({ ...p, scheduledDate: e.target.value }))} min={new Date().toISOString().split('T')[0]} required />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Time *</label>
                  <input type="time" className="input-gamma" value={formData.scheduledTime} onChange={e => setFormData(p => ({ ...p, scheduledTime: e.target.value }))} required />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Select Leads *</label>
                <div className="max-h-40 overflow-y-auto border border-border rounded-lg p-2 space-y-1">
                  {leads.length === 0 ? <p className="text-xs text-muted-foreground text-center py-2">No leads available</p> : leads.map(l => (
                    <label key={l.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-secondary/30 cursor-pointer text-sm text-foreground">
                      <input type="checkbox" checked={formData.selectedUsers?.includes(l.id)} onChange={() => handleUserSelection(l.id)} className="rounded border-border" />
                      {l.name} - {l.number}
                    </label>
                  ))}
                </div>
              </div>
              {message.text && <div className={message.type === 'success' ? 'message-success' : 'message-error'}>{message.text}</div>}
              <div className="flex gap-3 pt-2">
                <button type="button" className="flex-1 py-2.5 rounded-lg border border-border text-sm text-foreground hover:bg-secondary/30" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="flex-1 btn-gamma text-sm">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GammaCampaignManager;
