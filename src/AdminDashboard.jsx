import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, []);

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
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
        try {
            await updateDoc(doc(db, 'users', userId), {
                status: newStatus
            });
            setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        } catch (error) {
            alert("Error updating status: " + error.message);
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
            if (timeoutVal) alert(`Timer set to ${timeoutVal} minutes for this user.`);
            else alert("Timer removed for this user.");
        } catch (error) {
            alert("Error updating timer: " + error.message);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: users.length,
        active: users.filter(u => u.status === 'active' && u.role !== 'admin').length,
        disabled: users.filter(u => u.status === 'disabled').length
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f4f8' }}>
            <p style={{ color: '#1e3a8a', fontWeight: 600 }}>Loading Secure Admin Panel...</p>
        </div>
    );

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif', background: '#ffffff', minHeight: '100vh' }}>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eff6ff', paddingBottom: '1rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: '#1e3a8a', letterSpacing: '-0.025em' }}>Admin Console</h1>
                    <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.95rem' }}>Full Control & User Management System</p>
                </div>
                <button
                    onClick={() => auth.signOut()}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: '#eff6ff',
                        color: '#1e40af',
                        border: '1px solid #bfdbfe',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => { e.target.style.background = '#dbeafe'; }}
                    onMouseOut={(e) => { e.target.style.background = '#eff6ff'; }}
                >
                    Safe Logout
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div style={cardStyle}>
                    <p style={cardLabelStyle}>Total User Base</p>
                    <p style={statStyle}>{stats.total}</p>
                </div>
                <div style={cardStyle}>
                    <p style={{ ...cardLabelStyle, color: '#2563eb' }}>Active Sub-Admins</p>
                    <p style={{ ...statStyle, color: '#2563eb' }}>{stats.active}</p>
                </div>
                <div style={cardStyle}>
                    <p style={{ ...cardLabelStyle, color: '#64748b' }}>Disabled Accounts</p>
                    <p style={{ ...statStyle, color: '#64748b' }}>{stats.disabled}</p>
                </div>
            </div>

            <section style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}>Management Center</h2>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search by email or company..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={selectStyle}
                        >
                            <option value="all">Access: All</option>
                            <option value="active">Access: Active</option>
                            <option value="disabled">Access: Blocked</option>
                        </select>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                                <th style={thStyle}>Entity Details</th>
                                <th style={thStyle}>Credits</th>
                                <th style={thStyle}>Auto-Stop (Min)</th>
                                <th style={thStyle}>Security Status</th>
                                <th style={thStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: '1rem' }}>{user.company || 'Private User'}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{user.email}</div>
                                        {user.role === 'admin' && <span style={{ fontSize: '0.65rem', background: '#dbeafe', color: '#1e40af', padding: '0.1rem 0.4rem', borderRadius: '4px', marginTop: '0.2rem', display: 'inline-block', fontWeight: 800 }}>MASTER ADMIN</span>}
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{ fontWeight: 700, color: '#1e3a8a' }}>{user.credits ?? '0'}</span>
                                    </td>
                                    <td style={tdStyle}>
                                        {user.role !== 'admin' && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <input
                                                    type="number"
                                                    placeholder="Set Min"
                                                    defaultValue={user.sessionTimeout || ''}
                                                    onBlur={(e) => updateTimer(user.id, e.target.value)}
                                                    style={{ width: '80px', padding: '0.4rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }}
                                                />
                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>min</span>
                                            </div>
                                        )}
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '30px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            background: user.status === 'active' ? '#eff6ff' : '#f8fafc',
                                            color: user.status === 'active' ? '#1d4ed8' : '#64748b',
                                            border: `1px solid ${user.status === 'active' ? '#dbeafe' : '#e2e8f0'}`,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.025em'
                                        }}>
                                            {user.status === 'active' ? 'Authorized' : 'Restricted'}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        {user.role !== 'admin' && (
                                            <button
                                                onClick={() => toggleUserStatus(user.id, user.status)}
                                                style={{
                                                    padding: '0.6rem 1rem',
                                                    borderRadius: '10px',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 700,
                                                    background: user.status === 'active' ? '#fee2e2' : '#2563eb',
                                                    color: user.status === 'active' ? '#991b1b' : '#ffffff',
                                                    transition: 'all 0.2s ease',
                                                    width: '140px'
                                                }}
                                            >
                                                {user.status === 'active' ? 'Block Access' : 'Restore Access'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                        No matching user records found in secure database.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

const cardStyle = {
    background: '#ffffff',
    padding: '2rem',
    borderRadius: '20px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    transition: 'transform 0.2s ease'
};

const cardLabelStyle = {
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: 700,
    margin: '0 0 0.5rem 0',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
};

const statStyle = {
    fontSize: '2.5rem',
    fontWeight: 900,
    margin: 0,
    color: '#1e3a8a'
};

const inputStyle = {
    padding: '0.6rem 1rem 0.6rem 2.5rem',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    minWidth: '280px',
    outline: 'none',
    fontSize: '0.9rem',
    background: '#ffffff',
    transition: 'border-color 0.2s',
};

const selectStyle = {
    padding: '0.6rem 1rem',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#334155',
    outline: 'none',
    cursor: 'pointer'
};

const thStyle = {
    padding: '1.25rem 1.5rem',
    borderBottom: '2px solid #f1f5f9',
    color: '#64748b',
    fontSize: '0.75rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
};

const tdStyle = { padding: '1.5rem' };

export default AdminDashboard;
