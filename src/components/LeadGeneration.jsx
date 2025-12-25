import React, { useState, useEffect } from 'react';
import { UserPlus, Save, RefreshCw, Trash2, Download } from 'lucide-react';
import { addLead, getLeads, deleteLead } from '../services/firebaseService';
import { writeToGoogleSheetsViaWebApp } from '../services/googleSheets';
import '../styles/LeadGeneration.css';

const LeadGeneration = ({ user }) => {
    const [formData, setFormData] = useState({
        name: '',
        number: '',
        remarks: ''
    });
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user?.uid) {
            loadLeads();
        }
    }, [user]);

    const loadLeads = async () => {
        setLoading(true);
        try {
            const leadsData = await getLeads(user.uid);
            setLeads(leadsData);
        } catch (error) {
            console.error('Error loading leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setMessage({ type: 'error', text: 'Name is required' });
            return false;
        }
        if (!formData.number.trim()) {
            setMessage({ type: 'error', text: 'Number is required' });
            return false;
        }
        if (!/^\d{10}$/.test(formData.number.replace(/\s/g, ''))) {
            setMessage({ type: 'error', text: 'Please enter a valid 10-digit number' });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const leadData = {
                ...formData,
                timestamp: new Date().toISOString()
            };

            console.log('Attempting to save lead:', leadData);
            console.log('User ID:', user?.uid);

            // Save to Firebase with userId
            const firebaseResult = await addLead(leadData, user.uid);

            console.log('Firebase result:', firebaseResult);

            // Save to Google Sheets (placeholder - requires setup)
            const sheetsResult = await writeToGoogleSheetsViaWebApp(leadData);

            if (firebaseResult.success) {
                setMessage({
                    type: 'success',
                    text: 'Lead saved successfully to Firebase! (Google Sheets requires API setup)'
                });

                // Reset form
                setFormData({ name: '', number: '', remarks: '' });

                // Reload leads
                loadLeads();
            } else {
                console.error('Firebase save failed:', firebaseResult.error);
                setMessage({
                    type: 'error',
                    text: `Failed to save lead: ${firebaseResult.error || 'Unknown error'}`
                });
            }
        } catch (error) {
            console.error('Error submitting lead:', error);
            setMessage({
                type: 'error',
                text: `An error occurred: ${error.message || 'Please try again.'}`
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (leadId, leadName) => {
        if (!window.confirm(`Are you sure you want to delete lead "${leadName}"?`)) {
            return;
        }

        try {
            const result = await deleteLead(leadId);

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: 'Lead deleted successfully!'
                });
                loadLeads();
            } else {
                setMessage({
                    type: 'error',
                    text: `Failed to delete lead: ${result.error}`
                });
            }
        } catch (error) {
            console.error('Error deleting lead:', error);
            setMessage({
                type: 'error',
                text: 'An error occurred while deleting the lead.'
            });
        }
    };

    const downloadCSV = () => {
        if (leads.length === 0) {
            setMessage({
                type: 'error',
                text: 'No leads to download'
            });
            return;
        }

        // Create CSV header
        const headers = ['Name', 'Phone Number', 'Remarks', 'Date Created'];

        // Create CSV rows
        const rows = leads.map(lead => {
            const date = lead.createdAt
                ? new Date(lead.createdAt.seconds * 1000).toLocaleDateString()
                : 'N/A';

            // Escape commas and quotes in data
            const escapeCsvValue = (value) => {
                if (!value) return '';
                const stringValue = String(value);
                if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
            };

            return [
                escapeCsvValue(lead.name),
                escapeCsvValue(lead.number),
                escapeCsvValue(lead.remarks),
                escapeCsvValue(date)
            ].join(',');
        });

        // Combine header and rows
        const csvContent = [headers.join(','), ...rows].join('\n');

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setMessage({
            type: 'success',
            text: `Downloaded ${leads.length} leads as CSV`
        });
    };

    return (
        <div className="lead-generation">
            <div className="section-header">
                <div>
                    <h1>Lead Generation</h1>
                    <p className="section-subtitle">Capture and manage your leads efficiently</p>
                </div>
                <div className="header-actions">
                    <button className="download-btn" onClick={downloadCSV} disabled={loading || leads.length === 0}>
                        <Download size={18} />
                        Download CSV
                    </button>
                    <button className="refresh-btn" onClick={loadLeads} disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'spinning' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="lead-content">
                {/* Lead Form */}
                <div className="lead-form-card">
                    <div className="card-header">
                        <UserPlus size={24} />
                        <h2>Add New Lead</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="lead-form">
                        <div className="form-group">
                            <label htmlFor="name">Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter lead name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="number">Phone Number *</label>
                            <input
                                type="tel"
                                id="number"
                                name="number"
                                value={formData.number}
                                onChange={handleChange}
                                placeholder="Enter 10-digit number"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="remarks">Remarks</label>
                            <textarea
                                id="remarks"
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                placeholder="Add any additional notes or remarks"
                                rows="4"
                            />
                        </div>

                        {message.text && (
                            <div className={`message ${message.type}`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={submitting}
                        >
                            <Save size={18} />
                            {submitting ? 'Saving...' : 'Save Lead'}
                        </button>
                    </form>
                </div>

                {/* Leads List */}
                <div className="leads-list-card">
                    <div className="card-header">
                        <h2>All Leads ({leads.length})</h2>
                    </div>

                    <div className="leads-list">
                        {loading ? (
                            <div className="loading-state">Loading leads...</div>
                        ) : leads.length === 0 ? (
                            <div className="empty-state">
                                <UserPlus size={48} />
                                <p>No leads yet</p>
                                <span>Start by adding your first lead</span>
                            </div>
                        ) : (
                            <div className="leads-grid">
                                {leads.map((lead) => (
                                    <div key={lead.id} className="lead-card">
                                        <div className="lead-header">
                                            <h3>{lead.name}</h3>
                                            <div className="lead-actions">
                                                <span className="lead-date">
                                                    {lead.createdAt ? new Date(lead.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                                </span>
                                                <button
                                                    className="delete-lead-btn"
                                                    onClick={() => handleDelete(lead.id, lead.name)}
                                                    title="Delete lead"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="lead-details">
                                            <p><strong>Phone:</strong> {lead.number}</p>
                                            {lead.remarks && (
                                                <p className="lead-remarks"><strong>Remarks:</strong> {lead.remarks}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadGeneration;
