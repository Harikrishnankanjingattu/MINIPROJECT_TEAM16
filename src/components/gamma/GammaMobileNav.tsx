import {
  LayoutDashboard, UserPlus, Megaphone, Package, PhoneForwarded, User, Bot
} from 'lucide-react';

interface MobileNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  moduleSettings?: { leadsEnabled: boolean; campaignsEnabled: boolean };
}

const GammaMobileNav = ({ activeSection, onSectionChange, moduleSettings }: MobileNavProps) => {
  const items = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    ...(moduleSettings?.leadsEnabled !== false ? [{ id: 'leads', icon: UserPlus, label: 'Leads' }] : []),
    ...(moduleSettings?.campaignsEnabled !== false ? [{ id: 'campaigns', icon: Megaphone, label: 'Ads' }] : []),
    { id: 'products', icon: Package, label: 'Stock' },
    { id: 'history', icon: PhoneForwarded, label: 'Calls' },
    { id: 'help', icon: Bot, label: 'Chat' },
    { id: 'profile', icon: User, label: 'Me' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-card/90 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-lg transition-all ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
              onClick={() => onSectionChange(item.id)}
            >
              <div className="relative">
                <Icon size={20} />
                {active && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default GammaMobileNav;
