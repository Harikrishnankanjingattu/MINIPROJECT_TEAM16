import React, { useState } from 'react';
import {
    LayoutDashboard,
    UserPlus,
    Megaphone,
    ChevronLeft,
    ChevronRight,
    LogOut
} from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = ({ activeSection, onSectionChange, user, onLogout, isMobileOpen, isMobile }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'leads', icon: UserPlus, label: 'Lead Generation' },
        { id: 'campaigns', icon: Megaphone, label: 'Campaigns' }
    ];

    // Extract company name from email (before @) or use full email
    const getDisplayName = () => {
        if (!user?.email) return 'User';
        const emailParts = user.email.split('@');
        return emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);
    };

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobile && isMobileOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar-header">
                {!isCollapsed && <h2>{getDisplayName()}</h2>}
                <button
                    className="collapse-btn"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                            onClick={() => onSectionChange(item.id)}
                            title={isCollapsed ? item.label : ''}
                        >
                            <Icon size={20} />
                            {!isCollapsed && <span>{item.label}</span>}
                        </button>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                {!isCollapsed ? (
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="user-details">
                            <p className="user-name">{getDisplayName()}</p>
                            <p className="user-role">{user?.email || 'user@example.com'}</p>
                        </div>
                        <button className="logout-btn" onClick={onLogout} title="Logout">
                            <LogOut size={18} />
                        </button>
                    </div>
                ) : (
                    <button className="logout-btn-collapsed" onClick={onLogout} title="Logout">
                        <LogOut size={18} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
