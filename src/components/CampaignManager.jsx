import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, X, Users, Calendar } from 'lucide-react';
import { addCampaign, getCampaigns, getLeads } from '../services/firebaseService';
import '../styles/CampaignManager.css';

const CampaignManager = ({ user }) => {
    const [campaigns, setCampaigns] = useState([]);
    const [leads, setLeads] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        selectedUsers: []
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user?.uid) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [campaignsData, leadsData] = await Promise.all([
                getCampaigns(user.uid), // Pass userId to get user-specific campaigns
                getLeads(user.uid) // Pass userId to get user-specific leads
            ]);
            setCampaigns(campaignsData);
            setLeads(leadsData);
        } catch (error) {
            console.error('Error loading data:', error);
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

    const handleUserSelection = (userId) => {
        setFormData(prev => ({
            ...prev,
            selectedUsers: prev.selectedUsers.includes(userId)
                ? prev.selectedUsers.filter(id => id !== userId)
                : [...prev.selectedUsers, userId]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.description.trim()) {
            setMessage({ type: 'error', text: 'Please fill in all required fields' });
            return;
        }

        if (formData.selectedUsers.length === 0) {
            setMessage({ type: 'error', text: 'Please select at least one user' });
            return;
        }

        try {
            const campaignData = {
                name: formData.name,
                description: formData.description,
                selectedUsers: formData.selectedUsers,
                status: 'active',
                createdDate: new Date().toISOString()
            };

            const result = await addCampaign(campaignData, user.uid); // Pass userId

            if (result.success) {
                setMessage({ type: 'success', text: 'Campaign created successfully!' });
                setFormData({ name: '', description: '', selectedUsers: [] });
                setShowModal(false);
                loadData();
            } else {
                setMessage({ type: 'error', text: 'Failed to create campaign' });
            }
        } catch (error) {
            console.error('Error creating campaign:', error);
            setMessage({ type: 'error', text: 'An error occurred' });
        }
    };

    const openModal = () => {
        setShowModal(true);
        setMessage({ type: '', text: '' });
        // Refresh leads when opening modal to show latest data
        loadData();
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({ name: '', description: '', selectedUsers: [] });
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="campaign-manager">
            <div className="section-header">
                <div>
                    <h1>Campaign Management</h1>
                    <p className="section-subtitle">Create and manage your marketing campaigns</p>
                </div>
                <button className="create-btn" onClick={openModal}>
                    <Plus size={18} />
                    Create Campaign
                </button>
            </div>

            {/* Campaigns Grid */}
            <div className="campaigns-grid">
                {loading ? (
                    <div className="loading-state">Loading campaigns...</div>
                ) : campaigns.length === 0 ? (
                    <div className="empty-state">
                        <Megaphone size={48} />
                        <p>No campaigns yet</p>
                        <span>Create your first campaign to get started</span>
                    </div>
                ) : (
                    campaigns.map((campaign) => (
                        <div key={campaign.id} className="campaign-card">
                            <div className="campaign-header">
                                <h3>{campaign.name}</h3>
                                <span className={`status-badge ${campaign.status}`}>
                                    {campaign.status}
                                </span>
                            </div>
                            <p className="campaign-description">{campaign.description}</p>
                            <div className="campaign-footer">
                                <div className="campaign-stat">
                                    <Users size={16} />
                                    <span>{campaign.selectedUsers?.length || 0} users</span>
                                </div>
                                <div className="campaign-stat">
                                    <Calendar size={16} />
                                    <span>
                                        {campaign.createdAt
                                            ? new Date(campaign.createdAt.seconds * 1000).toLocaleDateString()
                                            : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Campaign Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Campaign</h2>
                            <button className="close-btn" onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="campaign-form">
                            <div className="form-group">
                                <label htmlFor="name">Campaign Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter campaign name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description *</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe your campaign"
                                    rows="4"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Select Users/Leads *</label>
                                <div className="users-selection">
                                    {leads.length === 0 ? (
                                        <p className="no-users">No leads available. Create some leads first!</p>
                                    ) : (
                                        leads.map((lead) => (
                                            <label key={lead.id} className="user-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.selectedUsers.includes(lead.id)}
                                                    onChange={() => handleUserSelection(lead.id)}
                                                />
                                                <span>{lead.name} - {lead.number}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>

                            {message.text && (
                                <div className={`message ${message.type}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn">
                                    <Megaphone size={18} />
                                    Create Campaign
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignManager;
