import { useState, useEffect, useRef } from 'react';
import { UserPlus, Save, RefreshCw, Trash2, Download, Zap, AlertTriangle, Upload } from 'lucide-react';
import { addLead, getLeads, deleteLead, updateUserProfile } from '../../services/firebaseService';
import { writeToGoogleSheetsViaWebApp } from '../../services/googleSheets';

const GammaLeadGeneration = ({ user, userProfile }: { user: any, userProfile?: any }) => {
  const [formData, setFormData] = useState({ name: '', number: '', remarks: '' });
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string }>({ type: '', text: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (user?.uid) loadLeads(); }, [user]);

  const loadLeads = async () => {
    setLoading(true);
    try { setLeads(await getLeads(user.uid)); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((userProfile?.credits || 0) < 10) {
      setMessage({ type: 'error', text: 'Insufficient credits! Each lead requires 10 credits. Please upgrade your plan.' });
      return;
    }

    if (!formData.name.trim() || !formData.number.trim()) {
      setMessage({ type: 'error', text: 'Name and number are required' }); return;
    }
    if (!/^\d{10}$/.test(formData.number.replace(/\s/g, ''))) {
      setMessage({ type: 'error', text: 'Enter valid 10-digit number' }); return;
    }
    setSubmitting(true); setMessage({ type: '', text: '' });
    
    try {
      const result = await addLead({ ...formData, timestamp: new Date().toISOString() }, user.uid);
      await writeToGoogleSheetsViaWebApp(formData);
      if (result.success) {
        
        // Deduct 10 credits locally and remotely
        const updatedCredits = Math.max(0, (userProfile?.credits || 0) - 10);
        if (user.uid) {
           await updateUserProfile(user.uid, { credits: updatedCredits });
           // Note: App.tsx has an onSnapshot listener, so userProfile will update automatically.
        }

        setMessage({ type: 'success', text: 'Lead saved successfully!' });
        setFormData({ name: '', number: '', remarks: '' });
        loadLeads();
      } else {
        setMessage({ type: 'error', text: `Failed: ${result.error}` });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error occurred' });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete lead "${name}"?`)) return;
    const result = await deleteLead(id);
    if (result.success) { setMessage({ type: 'success', text: 'Deleted!' }); loadLeads(); }
    else { setMessage({ type: 'error', text: `Failed: ${result.error}` }); }
  };

  const downloadCSV = () => {
    if (!leads.length) return;
    const csv = ['Name,Phone,Remarks,Date',
      ...leads.map(l => `"${l.name}","${l.number}","${l.remarks || ''}","${l.createdAt ? new Date(l.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}"`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length < 2) {
        setMessage({ type: 'error', text: 'CSV must contain headers and at least one row.' });
        return;
      }

      const dataLines = lines.slice(1);
      const leadsToUpload = [];

      for (const line of dataLines) {
        const parts = line.split(',');
        if (parts.length >= 2) {
           const name = parts[0].replace(/['"]/g, '').trim();
           const number = parts[1].replace(/['"]/g, '').trim();
           const remarks = parts.slice(2).join(',').replace(/['"]/g, '').trim() || '';
           
           if (name && /^\d{10}$/.test(number.replace(/\s/g, ''))) {
             leadsToUpload.push({ name, number, remarks });
           }
        }
      }

      if (leadsToUpload.length === 0) {
        setMessage({ type: 'error', text: 'No valid leads found in CSV. (Ensure 10-digit numbers)' });
        return;
      }

      const cost = leadsToUpload.length * 10;
      if ((userProfile?.credits || 0) < cost) {
        setMessage({ type: 'error', text: `Insufficient credits! You need ${cost} credits to upload ${leadsToUpload.length} leads.` });
        return;
      }

      setSubmitting(true);
      setMessage({ type: '', text: '' });

      let successCount = 0;
      
      try {
        for (const lead of leadsToUpload) {
          const result = await addLead({ ...lead, timestamp: new Date().toISOString() }, user.uid);
          await writeToGoogleSheetsViaWebApp(lead);
          if (result.success) successCount++;
        }

        if (successCount > 0) {
          const updatedCredits = Math.max(0, (userProfile?.credits || 0) - (successCount * 10));
          await updateUserProfile(user.uid, { credits: updatedCredits });
          setMessage({ type: 'success', text: `Successfully uploaded ${successCount} leads!` });
          loadLeads();
        } else {
          setMessage({ type: 'error', text: 'Failed to upload leads.' });
        }
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Error occurred during upload.' });
      } finally {
        setSubmitting(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title text-foreground">Lead Generation</h1>
          <p className="section-subtitle">Capture and manage your leads</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="px-3 py-1.5 rounded-full bg-secondary/50 border border-border flex items-center gap-2">
            <Zap size={14} className={(userProfile?.credits || 0) > 0 ? "text-primary" : "text-destructive"} />
            <span className="text-xs font-semibold text-foreground">
              {userProfile?.credits || 0} Credits
            </span>
          </div>
          <div className="flex gap-2">
            <input type="file" ref={fileInputRef} accept=".csv" className="hidden" onChange={handleCSVUpload} />
            <button className="btn-ghost text-sm flex items-center gap-1.5" onClick={() => fileInputRef.current?.click()} disabled={submitting}>
              <Upload size={16} /> Upload CSV
            </button>
            <button className="btn-ghost text-sm flex items-center gap-1.5" onClick={downloadCSV} disabled={!leads.length}>
              <Download size={16} /> Export
            </button>
            <button className="btn-ghost text-sm flex items-center gap-1.5" onClick={loadLeads} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[380px,1fr] gap-6">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus size={20} className="text-primary" />
            <h2 className="font-display font-semibold text-foreground">Add New Lead</h2>
          </div>
          
          {(userProfile?.credits || 0) < 10 && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-2 text-sm">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <p>Opps! You need at least 10 credits per lead. Upgrade to a new plan in the <strong>Buy</strong> menu.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Name *</label>
              <input className="input-gamma" placeholder="Lead name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Phone *</label>
              <input className="input-gamma" placeholder="10-digit number" value={formData.number} onChange={e => setFormData(p => ({ ...p, number: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Remarks</label>
              <textarea className="input-gamma min-h-[80px] resize-none" placeholder="Notes..." value={formData.remarks} onChange={e => setFormData(p => ({ ...p, remarks: e.target.value }))} />
            </div>
            {message.text && <div className={message.type === 'success' ? 'message-success' : 'message-error'}>{message.text}</div>}
            <button type="submit" className="btn-gamma w-full flex items-center justify-center gap-2" disabled={submitting}>
              <Save size={16} /> {submitting ? 'Saving...' : 'Save Lead'}
            </button>
          </form>
        </div>

        <div className="glass-card p-5">
          <h2 className="font-display font-semibold text-foreground mb-4">All Leads ({leads.length})</h2>
          {loading ? (
            <p className="text-muted-foreground text-sm py-8 text-center">Loading...</p>
          ) : leads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserPlus size={40} className="mx-auto mb-3 opacity-30" />
              <p>No leads yet</p>
            </div>
          ) : (
            <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-1">
              {leads.map(lead => (
                <div key={lead.id} className="bg-secondary/30 rounded-lg p-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-medium text-foreground text-sm">{lead.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">📞 {lead.number}</p>
                    {lead.remarks && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{lead.remarks}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-muted-foreground">
                      {lead.createdAt ? new Date(lead.createdAt.seconds * 1000).toLocaleDateString() : ''}
                    </span>
                    <button className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(lead.id, lead.name)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GammaLeadGeneration;
