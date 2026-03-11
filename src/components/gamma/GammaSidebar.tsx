import { useState } from 'react';
import {
  LayoutDashboard, UserPlus, Megaphone, ChevronLeft, ChevronRight,
  LogOut, User, PhoneForwarded, Package, Zap, Hexagon, Bot, Mic, Square
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  user: any;
  userProfile: any;
  onLogout: () => void;
  isMobile: boolean;
  isMobileOpen: boolean;
  toggleMobileMenu: () => void;
  moduleSettings?: { leadsEnabled: boolean; campaignsEnabled: boolean };
  conversation: any;
}

const GammaSidebar = ({
  activeSection, onSectionChange, user, userProfile, onLogout,
  isMobile, isMobileOpen, moduleSettings, toggleMobileMenu, conversation
}: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getDisplayName = () => {
    if (userProfile?.role === 'admin') return 'Master Admin';
    return userProfile?.company || user?.email?.split('@')[0] || 'User';
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
    ...(moduleSettings?.leadsEnabled !== false ? [{ id: 'leads', icon: UserPlus, label: 'Lead Gen' }] : []),
    ...(moduleSettings?.campaignsEnabled !== false ? [{ id: 'campaigns', icon: Megaphone, label: 'Campaigns' }] : []),
    { id: 'products', icon: Package, label: 'Products' },
    { id: 'history', icon: PhoneForwarded, label: 'Call History' },
    { id: 'buy', icon: Zap, label: 'Buy Credits' },
    { id: 'profile', icon: User, label: 'Account' },
    { id: 'call', icon: Bot, label: 'Test Mode' },
  ];

  const collapsed = isCollapsed && !isMobile;
  
  const handleMenuClick = async (item: any) => {
    if (item.id !== 'call') {
      onSectionChange(item.id);
      if (isMobile) toggleMobileMenu();
    } else if (item.id === 'call') {
      if (conversation.status === 'connected') {
        await conversation.endSession();
      } else {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          await conversation.startSession({
            agentId: 'agent_2601kkewjkdfe91rx16t6camg0qb'
          } as any);
        } catch (error) {
          console.error('Failed to start conversation:', error);
          alert('Failed to start the call. Please ensure microphone permissions are granted.');
        }
      }
    }
  };

  return (
    <>
      <aside className={`
        fixed top-0 left-0 h-full z-30 bg-sidebar border-r border-sidebar-border
        flex flex-col transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-[240px]'}
        ${isMobile ? (isMobileOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2 overflow-hidden group">
            <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
              <div className="absolute inset-0 bg-[linear-gradient(-45deg,#a855f7,#ec4899,#3b82f6,#a855f7)] bg-[length:400%_400%] animate-gradient-xy rounded-lg blur opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative w-8 h-8 bg-background border border-white/20 rounded-lg flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(-45deg,#a855f7,#ec4899,#3b82f6,#a855f7)] bg-[length:400%_400%] animate-gradient-xy opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <Hexagon size={16} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-[spin_4s_linear_infinite]" />
              </div>
            </div>
            {!collapsed && <span className="text-[15px] font-bold font-display truncate tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60">GAMMA</span>}
          </div>
          {!isMobile && (
            <button
              className="w-6 h-6 rounded-md hover:bg-sidebar-accent flex items-center justify-center text-sidebar-foreground"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {!collapsed && <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 py-2 font-semibold">Menu</p>}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id && item.id !== 'call';
            const isCall = item.id === 'call';
            
            let displayLabel = item.label;
            let displayIcon = <Icon size={18} className="nav-icon shrink-0" />;
            
            if (isCall) {
              if (conversation.status === 'connected') {
                displayLabel = conversation.isSpeaking ? 'AI Speaking...' : 'Listening... (Click to End)';
                displayIcon = <Square size={18} className="nav-icon shrink-0 text-destructive animate-pulse" />;
              } else if (conversation.status === 'connecting') {
                displayLabel = 'Connecting...';
                displayIcon = <div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />;
              }
            }
            
            return (
              <button
                key={item.id}
                className={`
                  nav-link w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
                  ${active ? 'active' : 'text-sidebar-foreground hover:bg-sidebar-accent'}
                  ${isCall && conversation.status === 'connected' ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : ''}
                  ${collapsed ? 'justify-center' : ''}
                `}
                onClick={() => handleMenuClick(item)}
                title={collapsed ? displayLabel : undefined}
              >
                {displayIcon}
                {!collapsed && <span className="truncate">{displayLabel}</span>}
                {active && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                {isCall && conversation.status === 'connected' && !collapsed && (
                  <div className="ml-auto flex gap-1">
                     <span className="w-1 h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
                     <span className="w-1 h-4 rounded-full bg-primary animate-pulse" style={{ animationDelay: '150ms' }} />
                     <span className="w-1 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 text-xs font-bold text-foreground">
              {userProfile?.companyLogo ? (
                <img src={userProfile.companyLogo} alt="Logo" className="w-full h-full rounded-full object-cover" />
              ) : (
                (userProfile?.company?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()
              )}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{getDisplayName()}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{userProfile?.plan || 'Free'}</p>
                </div>
                <button className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" onClick={onLogout}>
                  <LogOut size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {isMobile && isMobileOpen && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-20" onClick={toggleMobileMenu} />
      )}
    </>
  );
};

export default GammaSidebar;
