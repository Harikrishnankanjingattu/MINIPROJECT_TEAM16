import React, { useState } from 'react';
import { auth, db } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import './AuthPage.css';
//login page -by tobi tose 
//signup -shahin p
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage({
          type: 'success',
          text: 'Welcome back! Login successful.',
        });
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
          company: company,
          email: email,
          joinedAt: new Date().toISOString(),
        });

        setMessage({
          type: 'success',
          text: 'Account created! You can now login.',
        });
        setIsLogin(true);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMouseMove = (e) => {
    const x = e.clientX;
    const y = e.clientY;
    document.documentElement.style.setProperty('--x', `${x}px`);
    document.documentElement.style.setProperty('--y', `${y}px`);
  };

  return (
    <div className="auth-wrapper" onMouseMove={handleMouseMove}>
      <div className="spotlight-beam"></div>
      <div className="geo-shape shape-1"></div>
      <div className="geo-shape shape-2"></div>
      <div className="auth-box">
        <header>
          <h1>{isLogin ? 'Welcome Back' : 'Get Started'}</h1>
          <p>{isLogin ? 'Login to your account' : 'Create a new account'}</p>
        </header>

        {message.text && (
          <div className={`status-msg ${message.type}`}>
            {message.text}
          </div>
        )}

        <form
          onSubmit={handleAuth}
          className={`auth-form ${isLogin ? 'login' : 'signup'}`}
        >
          {!isLogin && (
            <div className="field">
              <label>Company Name</label>
              <input
                type="text"
                placeholder="Your Company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>
          )}

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <footer>
          <p>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button
              type="button"
              className="switch-btn"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AuthPage;
