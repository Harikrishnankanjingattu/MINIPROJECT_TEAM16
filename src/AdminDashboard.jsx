import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, getDocs, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import {
    LogOut, Search, Users, ShieldAlert,
    ShieldCheck, Settings2, ToggleLeft,
    ToggleRight, Package, LayoutGrid,
    Activity, ArrowUpRight, ArrowDownRight,
    Lock, Unlock, Zap
} from 'lucide-react';
import './AdminDashboard.css';
import ProductManager from './components/ProductManager';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';

const AdminDashboard = ({ user, userProfile, googleToken, onGoogleAuth }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [activeTab, setActiveTab] = useState('users');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [moduleSettings, setModuleSettings] = useState({
        leadsEnabled: true,
        campaignsEnabled: true
    });

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchUsers(), fetchModuleSettings()]);
        setLoading(false);
    };

    const fetchModuleSettings = async () => {
        try {
            const docRef = doc(db, 'settings', 'modules');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setModuleSettings(docSnap.data());
            } else {
                await setDoc(docRef, {
                    leadsEnabled: true,
                    campaignsEnabled: true
                });
            }
        } catch (error) {
            console.error("Error fetching module settings:", error);
        }
    };

    const toggleModule = async (module) => {
        const newValue = !moduleSettings[module];
        const newSettings = { ...moduleSettings, [module]: newValue };
        try {
            await setDoc(doc(db, 'settings', 'modules'), newSettings);
            setModuleSettings(newSettings);
        } catch (error) {
            console.error("Error updating module settings:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            const usersData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(usersData);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        try {
            await updateDoc(doc(db, 'users', userId), {
                status: newStatus
            });
            setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const toggleUserModule = async (userId, module, currentVal) => {
        const newVal = currentVal === false ? true : false;
        try {
            await updateDoc(doc(db, 'users', userId), {
                [module]: newVal
            });
            setUsers(users.map(u => u.id === userId ? { ...u, [module]: newVal } : u));
        } catch (error) {
            console.error("Error updating user module:", error);
        }
    };

    const updateTimer = async (userId, minutes) => {
        try {
            const timeoutVal = minutes ? parseInt(minutes) : null;
            await updateDoc(doc(db, 'users', userId), {
                sessionTimeout: timeoutVal,
                sessionStartedAt: timeoutVal ? new Date().toISOString() : null
            });
            setUsers(users.map(u => u.id === userId ? { ...u, sessionTimeout: timeoutVal } : u));
        } catch (error) {
            console.error("Error updating timer:", error);
        }
    };

    const filteredUsers = users.filter(user => {
        if (user.role === 'admin') return false; // Hide admins from the list
        const nameMatch = user.company?.toLowerCase().includes(searchTerm.toLowerCase());
        const emailMatch = user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSearch = nameMatch || emailMatch;
        const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: users.filter(u => u.role !== 'admin').length,
        active: users.filter(u => u.status === 'active' && u.role !== 'admin').length,
        suspended: users.filter(u => u.status === 'suspended').length,
        totalCredits: users.reduce((acc, curr) => acc + (curr.credits || 0), 0)
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    const handleSectionChange = (section) => {
        if (section === 'dashboard' || section === 'leads') setActiveTab('users');
        else if (section === 'products') setActiveTab('products');
        if (isMobile) setIsMobileMenuOpen(false);
    };

    if (loading) return (
        <div className="admin-loading" style={{ background: '#0f172a', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #3b82f6', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ marginTop: '1rem', fontWeight: '600' }}>Initializing Master Console...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div className={`admin-layout ${isMobile ? 'is-mobile' : ''}`}>
            {isMobile && (
                <header className="mobile-dashboard-header glass-effect">
                    <div className="mobile-branding">
                        <div className="mini-logo admin">
                            <ShieldCheck size={20} color="white" />
                        </div>
                        <span className="mobile-brand-name">Master Admin</span>
                    </div>
                </header>
            )}

            {!isMobile && (
                <Sidebar
                    activeSection={activeTab === 'users' ? 'dashboard' : 'products'}
                    onSectionChange={handleSectionChange}
                    user={user}
                    userProfile={userProfile}
                    onLogout={handleLogout}
                    isMobile={isMobile}
                    isMobileOpen={isMobileMenuOpen}
                    toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                />
            )}

            <div className="admin-main">
                <div className="admin-container">
                    <header className="admin-header">
                        <div className="header-title">
                            <h1>Master Console</h1>
                            <p>Global sub-admin orchestration & system telemetry</p>
                        </div>
                        <div className="header-meta" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div className="system-status" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem 1rem', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '700', color: '#10b981' }}>
                                <div className="pulse-dot" style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }}></div>
                                System Online
                            </div>
                        </div>
                    </header>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <p className="card-label">Total Sub-Admins</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <p className="stat-value">{stats.total}</p>
                                <Users size={24} color="#3b82f6" />
                            </div>
                        </div>
                        <div className="stat-card active">
                            <p className="card-label">Operational Partners</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <p className="stat-value">{stats.active}</p>
                                <Zap size={24} color="#10b981" />
                            </div>
                        </div>
                        <div className="stat-card suspended">
                            <p className="card-label">Access Revoked</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <p className="stat-value">{stats.suspended}</p>
                                <Lock size={24} color="#ef4444" />
                            </div>
                        </div>
                        <div className="stat-card">
                            <p className="card-label">Distributed Credits</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <p className="stat-value">{stats.totalCredits}</p>
                                <Activity size={24} color="#f59e0b" />
                            </div>
                        </div>
                    </div>

                    <div className="admin-tabs">
                        <button
                            className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                            onClick={() => setActiveTab('users')}
                        >
                            <Users size={18} />
                            Partner Orchestration
                        </button>
                        <button
                            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                            onClick={() => setActiveTab('products')}
                        >
                            <Package size={18} />
                            Global Inventory
                        </button>
                    </div>

                    {activeTab === 'users' ? (
                        <>
                            <section className="settings-section">
                                <div className="section-header">
                                    <Settings2 size={24} color="#3b82f6" />
                                    <h2>System Feature Flags</h2>
                                </div>
                                <div className="settings-grid">
                                    <div className="settings-card">
                                        <div className="settings-info">
                                            <h3>Lead Extraction Engine</h3>
                                            <p>Global toggle for all active partners</p>
                                        </div>
                                        <button
                                            className={`toggle-btn ${moduleSettings.leadsEnabled ? 'on' : 'off'}`}
                                            onClick={() => toggleModule('leadsEnabled')}
                                        >
                                            {moduleSettings.leadsEnabled ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                                            <span>{moduleSettings.leadsEnabled ? 'OPERATIONAL' : 'DEACTIVATED'}</span>
                                        </button>
                                    </div>

                                    <div className="settings-card">
                                        <div className="settings-info">
                                            <h3>Campaign Automator</h3>
                                            <p>Global toggle for all active partners</p>
                                        </div>
                                        <button
                                            className={`toggle-btn ${moduleSettings.campaignsEnabled ? 'on' : 'off'}`}
                                            onClick={() => toggleModule('campaignsEnabled')}
                                        >
                                            {moduleSettings.campaignsEnabled ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                                            <span>{moduleSettings.campaignsEnabled ? 'OPERATIONAL' : 'DEACTIVATED'}</span>
                                        </button>
                                    </div>
                                </div>
                            </section>

                            <section className="table-section">
                                <div className="table-controls">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                        <h2>Sub-Admin Directory</h2>
                                        <div className="control-group" style={{ marginTop: 0 }}>
                                            <div className="search-input-wrapper">
                                                <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
                                                <input
                                                    type="text"
                                                    placeholder="Filter by company or email..."
                                                    className="search-input"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                            <select
                                                className="status-select"
                                                value={filterStatus}
                                                onChange={(e) => setFilterStatus(e.target.value)}
                                            >
                                                <option value="all">Global Access</option>
                                                <option value="active">Active Only</option>
                                                <option value="suspended">Restricted Only</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Sub-Admin & Company</th>
                                                <th>Authentication</th>
                                                <th>Balance</th>
                                                <th>Leads</th>
                                                <th>Campaign</th>
                                                <th>Session</th>
                                                <th>Status</th>
                                                <th>Orchestration</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan="8" style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                                                        No sub-admins found matching your filters.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredUsers.map(u => (
                                                    <tr key={u.id}>
                                                        <td>
                                                            <div className="company-branding">
                                                                <div className="company-logo-mini">
                                                                    {u.companyLogo ? (
                                                                        <img src={u.companyLogo} alt="Logo" />
                                                                    ) : (
                                                                        (u.company || u.email).charAt(0).toUpperCase()
                                                                    )}
                                                                </div>
                                                                <div className="company-info">
                                                                    <div className="company">{u.company || 'Private Partner'}</div>
                                                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {u.id.slice(0, 8)}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="user-contact">
                                                                <div className="email">{u.email}</div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="credit-value">{u.credits || 0}</span>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className={`module-toggle-pill ${u.leadsEnabled !== false ? 'enabled' : 'disabled'}`}
                                                                onClick={() => toggleUserModule(u.id, 'leadsEnabled', u.leadsEnabled)}
                                                            >
                                                                {u.leadsEnabled !== false ? 'ALLOWED' : 'DENIED'}
                                                            </button>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className={`module-toggle-pill ${u.campaignsEnabled !== false ? 'enabled' : 'disabled'}`}
                                                                onClick={() => toggleUserModule(u.id, 'campaignsEnabled', u.campaignsEnabled)}
                                                            >
                                                                {u.campaignsEnabled !== false ? 'ALLOWED' : 'DENIED'}
                                                            </button>
                                                        </td>
                                                        <td>
                                                            <div className="timer-input-group">
                                                                <input
                                                                    type="number"
                                                                    className="timer-input"
                                                                    defaultValue={u.sessionTimeout || ''}
                                                                    onBlur={(e) => updateTimer(u.id, e.target.value)}
                                                                />
                                                                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>min</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className={`status-pill ${u.status}`}>
                                                                {u.status === 'active' ? 'Operational' : 'Restricted'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className={`action-btn ${u.status === 'active' ? 'suspend' : 'activate'}`}
                                                                onClick={() => toggleUserStatus(u.id, u.status)}
                                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                            >
                                                                {u.status === 'active' ? <Lock size={14} /> : <Unlock size={14} />}
                                                                {u.status === 'active' ? 'Restrict' : 'Authorize'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </>
                    ) : (
                        <div className="admin-product-view">
                            <ProductManager user={user} userProfile={userProfile} googleToken={googleToken} onGoogleAuth={onGoogleAuth} />
                        </div>
                    )}
                </div>
            </div>

            {isMobile && (
                <MobileNav
                    activeSection={activeTab === 'users' ? 'dashboard' : 'products'}
                    onSectionChange={(section) => {
                        if (section === 'dashboard' || section === 'leads') setActiveTab('users');
                        else if (section === 'products') setActiveTab('products');
                    }}
                    moduleSettings={{ leadsEnabled: true, campaignsEnabled: true }}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
