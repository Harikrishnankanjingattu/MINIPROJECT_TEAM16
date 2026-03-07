import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth, db } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Mail, Lock, Building2, Bot, ArrowRight, Zap, Hexagon } from 'lucide-react';

interface AuthPageProps {
  initialMode?: string;
  onGoogleAuth?: () => Promise<void>;
  googleToken?: string | null;
}

const AuthPage = ({ initialMode = 'login', onGoogleAuth, googleToken }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string }>({ type: '', text: '' });

  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email, company, role: 'subadmin', status: 'active',
          leadsEnabled: true, campaignsEnabled: true,
          createdAt: new Date().toISOString()
        });
        setMessage({ type: 'success', text: 'Account created successfully!' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (onGoogleAuth) {
      await onGoogleAuth();
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          company: result.user.displayName || 'New Business',
          role: 'subadmin', status: 'active',
          leadsEnabled: true, campaignsEnabled: true,
          createdAt: new Date().toISOString()
        });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Google Authentication failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card w-full max-w-md p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="relative w-14 h-14 mx-auto mb-4 flex items-center justify-center group">
            <div className="absolute inset-0 bg-[linear-gradient(-45deg,#a855f7,#ec4899,#3b82f6,#a855f7)] bg-[length:400%_400%] animate-gradient-xy rounded-2xl blur opacity-60 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative w-14 h-14 bg-background border border-white/20 rounded-2xl flex items-center justify-center overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[linear-gradient(-45deg,#a855f7,#ec4899,#3b82f6,#a855f7)] bg-[length:400%_400%] animate-gradient-xy opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <Hexagon size={28} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse-glow" />
            </div>
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60 mb-2">GAMMA</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {isLogin ? 'Sign in to your dashboard.' : 'Create your automation account.'}
          </p>
        </div>

        {message.text && (
          <div className={`mb-4 ${message.type === 'success' ? 'message-success' : 'message-error'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Organization</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  className="input-gamma pl-10"
                  placeholder="e.g. Nexus Industries"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                className="input-gamma pl-10"
                placeholder="admin@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                className="input-gamma pl-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-gamma w-full flex items-center justify-center gap-2" disabled={loading}>
            {loading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={16} /></>
            )}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground">or continue with</span>
            </div>
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-lg hover:bg-secondary/50 transition-all text-sm font-medium text-foreground"
            onClick={handleGoogleAuth}
            disabled={loading}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Google Workspace
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isLogin ? "Don't have an account?" : 'Already registered?'}
          <button
            type="button"
            className="ml-1 text-primary hover:underline font-medium"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
