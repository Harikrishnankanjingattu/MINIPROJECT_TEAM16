import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Smartphone, Mail, Lock, Building2, Bot, Globe, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import './AuthPage.css';

const AuthPage = ({ initialMode = 'login', onGoogleAuth, googleToken }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

  const handleAuth = async (e) => {
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
          email,
          company,
          role: 'subadmin',
          status: 'active',
          leadsEnabled: true,
          campaignsEnabled: true,
          createdAt: new Date().toISOString()
        });
        setMessage({ type: 'success', text: 'Account created successfully!' });
      }
    } catch (error) {
      console.error("Auth Error:", error);
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
          role: 'subadmin',
          status: 'active',
          leadsEnabled: true,
          campaignsEnabled: true,
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Google Auth Error:", error);
      setMessage({ type: 'error', text: "Google Authentication failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
  return (
    <div className="auth-mesh-bg">
      <div className="auth-wrapper centered">
        <div className="auth-container glass-effect animate-fade">
          <header className="auth-header">
            <div className="auth-logo-box">
              <Bot size={32} color="white" strokeWidth={2.5} />
            </div>
            <h1 className="auth-title">
              AutoConnect AI
            </h1>
            <p className="auth-subtitle">
              {isLogin
                ? 'Sign in to your orchestration hub.'
                : 'Request enterprise-grade voice automation.'}
            </p>
          </header>

          {message.text && (
            <div className={`auth-message ${message.type}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleAuth} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label>Organization</label>
                <div className="input-container">
                  <Building2 className="input-icon" size={18} />
                  <input
                    type="text"
                    placeholder="e.g. Nexus Industries"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Admin Email</label>
              <div className="input-container">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  placeholder="admin@nexus.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Access Key</label>
              <div className="input-container">
                <Lock className="input-icon" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : (isLogin ? 'Initialize Session' : 'Create Master Account')}
              {!loading && <ArrowRight size={18} style={{ marginLeft: '8px' }} />}
            </button>

            <div className="auth-divider">
              <span>or secure connect</span>
            </div>

            <button
              type="button"
              className="google-auth-btn"
              onClick={handleGoogleAuth}
              disabled={loading}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
              Google Workspace
            </button>
          </form>

          <footer className="auth-footer">
            <p>
              {isLogin ? "New to the platform?" : 'Already registered?'}
              <button type="button" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Request Access' : 'Return to Login'}
              </button>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
