import React from 'react';
import { ArrowRight, Bot, PhoneCall, BarChart3, Clock } from 'lucide-react';

const LandingPage = ({ onGetStarted, onLogin }) => {
  return (
    <div style={styles.page}>
      <style>{keyframes}</style>

      {/* HEADER */}
      <header style={{ ...styles.header, animation: 'fadeDown 0.8s ease' }}>
        <div style={styles.logoBox}>
          <div style={styles.logoIcon}><Bot size={26} color="white" /></div>
          <span style={styles.logoText}>AutoConnect</span>
        </div>
        <div style={styles.navBtns}>
          <button style={styles.linkBtn} onClick={onLogin}>Log in</button>
          <button style={styles.primaryBtn} onClick={onGetStarted}>Get Started</button>
        </div>
      </header>

      {/* HERO */}
      <main style={styles.heroWrap}>
        <div style={styles.heroText}>
          <div style={styles.badge}>⚡ AI POWERED</div>

          <h1 style={styles.title}>
            Automate customer calls<br />
            <span style={styles.gradientText}>24/7 with AI</span>
          </h1>

          <p style={styles.subtitle}>
            Smart AI voice agents converting your leads nonstop.
          </p>

          <div style={styles.actions}>
            <button style={styles.primaryBtnLg} onClick={onGetStarted}>
              Get Started <ArrowRight size={18} />
            </button>
            <button style={styles.secondaryBtn} onClick={onLogin}>View Demo</button>
          </div>
        </div>

        {/* VISUAL */}
        <div style={styles.visual}>
          <div style={{ ...styles.glow, animation: 'pulse 4s infinite' }} />
          <div style={{ ...styles.glow, background: '#3b82f6', animation: 'pulse 6s infinite' }} />
        </div>
      </main>

      {/* FEATURES */}
      <section style={styles.features}>
        {[{icon:<PhoneCall />,title:'AI Calls',desc:'Natural human-like conversations'},{icon:<Clock />,title:'24/7 Online',desc:'Never miss a customer call'},{icon:<BarChart3 />,title:'Analytics',desc:'Track conversion and performance'}].map((f,i)=>(
          <div key={i} style={styles.card}>
            <div style={styles.cardIcon}>{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

const styles = {
  page: { minHeight:'100vh', background:'#050b1a', color:'#fff', fontFamily:'Inter, sans-serif' },
  header:{ display:'flex', justifyContent:'space-between', padding:'20px 60px', backdropFilter:'blur(12px)', position:'sticky', top:0 },
  logoBox:{ display:'flex', alignItems:'center', gap:10 },
  logoIcon:{ background:'linear-gradient(135deg,#3b82f6,#06b6d4)', padding:10, borderRadius:12 },
  logoText:{ fontSize:20, fontWeight:700 },
  navBtns:{ display:'flex', gap:12 },
  linkBtn:{ background:'transparent', border:'none', color:'#cbd5f5', cursor:'pointer' },
  primaryBtn:{ background:'linear-gradient(135deg,#2563eb,#06b6d4)', border:'none', color:'#fff', padding:'10px 18px', borderRadius:10 },
  heroWrap:{ display:'grid', gridTemplateColumns:'1fr 1fr', padding:'80px 60px', alignItems:'center' },
  heroText:{ animation:'fadeUp 1s ease' },
  badge:{ display:'inline-block', marginBottom:16, padding:'6px 14px', borderRadius:999, background:'#0f1b3d', color:'#60a5fa' },
  title:{ fontSize:52, lineHeight:1.1, marginBottom:20 },
  gradientText:{ background:'linear-gradient(90deg,#3b82f6,#22d3ee)', WebkitBackgroundClip:'text', color:'transparent' },
  subtitle:{ color:'#cbd5e1', maxWidth:420 },
  actions:{ display:'flex', gap:14, marginTop:30 },
  primaryBtnLg:{ display:'flex', gap:8, alignItems:'center', padding:'14px 22px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#3b82f6,#22d3ee)', color:'#fff' },
  secondaryBtn:{ background:'transparent', border:'1px solid #334155', color:'#cbd5e1', padding:'14px 22px', borderRadius:12 },
  visual:{ position:'relative', height:360 },
  glow:{ position:'absolute', width:220, height:220, borderRadius:'50%', filter:'blur(80px)', opacity:0.7, top:'20%', left:'30%' },
  features:{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:30, padding:'60px' },
  card:{ background:'rgba(255,255,255,0.04)', padding:30, borderRadius:20, transition:'0.3s', animation:'fadeUp 1.2s ease' },
  cardIcon:{ color:'#60a5fa', marginBottom:14 }
};

const keyframes = `
@keyframes fadeUp{ from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none}}
@keyframes fadeDown{ from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:none}}
@keyframes pulse{ 0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}`;

export default LandingPage;
