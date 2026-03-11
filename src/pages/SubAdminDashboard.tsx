import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { Menu, Clock } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import GammaSidebar from '../components/gamma/GammaSidebar';
import GammaDashboard from '../components/gamma/GammaDashboard';
import GammaLeadGeneration from '../components/gamma/GammaLeadGeneration';
import GammaCampaignManager from '../components/gamma/GammaCampaignManager';
import GammaProductManager from '../components/gamma/GammaProductManager';
import GammaProfileSettings from '../components/gamma/GammaProfileSettings';
import GammaCallHistory from '../components/gamma/GammaCallHistory';
import GammaMobileNav from '../components/gamma/GammaMobileNav';
import { useConversation } from '@elevenlabs/react';

interface Props {
  user: any;
  userProfile: any;
  googleToken: string | null;
  onGoogleAuth: () => Promise<void>;
}

const SubAdminDashboard = ({ user, userProfile, googleToken, onGoogleAuth }: Props) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [moduleSettings, setModuleSettings] = useState({ leadsEnabled: true, campaignsEnabled: true });
  
  const conversation = useConversation();

  const combinedSettings = {
    leadsEnabled: moduleSettings.leadsEnabled && (userProfile?.leadsEnabled !== false),
    campaignsEnabled: moduleSettings.campaignsEnabled && (userProfile?.campaignsEnabled !== false)
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'modules'), (docSnap) => {
      if (docSnap.exists()) {
        const settings = docSnap.data() as any;
        setModuleSettings(settings);
        if (!settings.leadsEnabled && activeSection === 'leads') setActiveSection('dashboard');
        if (!settings.campaignsEnabled && activeSection === 'campaigns') setActiveSection('dashboard');
      }
    });
    return () => unsubscribe();
  }, [activeSection]);

  const handleLogout = async () => { try { await signOut(auth); } catch (e) { console.error(e); } };

  useEffect(() => {
    if (!userProfile?.sessionTimeout || !userProfile?.sessionStartedAt || userProfile.role === 'admin') {
      setTimeLeft(null); return;
    }
    const interval = setInterval(() => {
      const start = new Date(userProfile.sessionStartedAt).getTime();
      const limit = userProfile.sessionTimeout * 60 * 1000;
      const remaining = Math.max(0, limit - (Date.now() - start));
      if (remaining <= 0) { clearInterval(interval); signOut(auth); }
      else setTimeLeft(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [userProfile]);

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return <GammaDashboard user={user} userProfile={userProfile} />;
      case 'leads': return combinedSettings.leadsEnabled ? <GammaLeadGeneration user={user} /> : <GammaDashboard user={user} userProfile={userProfile} />;
      case 'campaigns': return combinedSettings.campaignsEnabled ? <GammaCampaignManager user={user} /> : <GammaDashboard user={user} userProfile={userProfile} />;
      case 'products': return <GammaProductManager user={user} userProfile={userProfile} googleToken={googleToken} onGoogleAuth={onGoogleAuth} />;
      case 'profile': return <GammaProfileSettings user={user} userProfile={userProfile} googleToken={googleToken} onGoogleAuth={onGoogleAuth} />;
      case 'history': return <GammaCallHistory user={user} />;
      default: return <GammaDashboard user={user} userProfile={userProfile} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 z-20 h-14 bg-card/90 backdrop-blur-xl border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <button className="p-1.5" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu size={20} className="text-foreground" />
            </button>
            <span className="text-sm font-bold font-display text-foreground">{userProfile?.company || 'GAMMA'}</span>
          </div>
          {timeLeft !== null && (
            <div className={`flex items-center gap-1 text-xs font-mono ${timeLeft < 60000 ? 'text-destructive' : 'text-muted-foreground'}`}>
              <Clock size={12} /> {formatTime(timeLeft)}
            </div>
          )}
        </header>
      )}

      {!isMobile && (
        <GammaSidebar
          activeSection={activeSection}
          onSectionChange={s => { setActiveSection(s); if (isMobile) setIsMobileMenuOpen(false); }}
          user={user} userProfile={userProfile} onLogout={handleLogout}
          isMobile={isMobile} isMobileOpen={isMobileMenuOpen}
          moduleSettings={combinedSettings}
          toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          conversation={conversation}
        />
      )}

      {isMobile && isMobileMenuOpen && (
        <GammaSidebar
          activeSection={activeSection}
          onSectionChange={s => { setActiveSection(s); setIsMobileMenuOpen(false); }}
          user={user} userProfile={userProfile} onLogout={handleLogout}
          isMobile={true} isMobileOpen={true}
          moduleSettings={combinedSettings}
          toggleMobileMenu={() => setIsMobileMenuOpen(false)}
          conversation={conversation}
        />
      )}

      <main className={`transition-all duration-300 ${isMobile ? 'pt-14 pb-20 px-4' : 'ml-[240px] p-6'}`}>
        {renderContent()}
      </main>

      {isMobile && (
        <GammaMobileNav
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          moduleSettings={combinedSettings}
          conversation={conversation}
        />
      )}
    </div>
  );
};

export default SubAdminDashboard;
