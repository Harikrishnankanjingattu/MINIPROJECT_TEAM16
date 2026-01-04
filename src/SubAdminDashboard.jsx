import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { Menu, X } from 'lucide-react';
import { auth } from './firebase';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LeadGeneration from './components/LeadGeneration';
import CampaignManager from './components/CampaignManager';
import './styles/SubAdminDashboard.css';

function SubAdminDashboard({ user }) {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const handleSectionChange = (section) => {
        setActiveSection(section);
        if (isMobile) {
            setIsMobileMenuOpen(false);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return <Dashboard user={user} />;
            case 'leads':
                return <LeadGeneration user={user} />;
            case 'campaigns':
                return <CampaignManager user={user} />;
            default:
                return <Dashboard user={user} />;
        }
    };

    return (
        <div className="subadmin-dashboard">
            {/* Mobile Menu Button */}
            {isMobile && (
                <button
                    className="mobile-menu-btn"
                    onClick={toggleMobileMenu}
                    style={{
                        position: 'fixed',
                        top: '1rem',
                        left: '1rem',
                        zIndex: 1001,
                        background: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            )}

            {/* Mobile Overlay */}
            {isMobile && isMobileMenuOpen && (
                <div
                    className="mobile-overlay active"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <Sidebar
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
                user={user}
                onLogout={handleLogout}
                isMobileOpen={isMobileMenuOpen}
                isMobile={isMobile}
            />
            <main className="main-content" style={{ paddingTop: isMobile ? '4rem' : '0' }}>
                {renderContent()}
            </main>
        </div>
    );
}

export default SubAdminDashboard;
