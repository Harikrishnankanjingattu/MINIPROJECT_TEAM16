import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bot, Globe, MessageSquare, Database, Calendar, ShieldCheck,
  TrendingUp, Briefcase, GraduationCap, Hospital, Store, Leaf,
  Github, Twitter, Linkedin, Menu, X, ArrowRight, Zap, ChevronRight, Hexagon
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' }
  })
};

const LandingPage = ({ onGetStarted, onLogin }: LandingPageProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    { icon: Globe, title: 'Multilingual Voice', desc: 'Natural conversations in multiple regional languages with perfect tone.' },
    { icon: Bot, title: 'Emotion Detection', desc: 'Real-time sentiment analysis to adjust strategy during conversations.' },
    { icon: TrendingUp, title: 'AI Lead Scoring', desc: 'Automatically qualify and rank leads based on intent signals.' },
    { icon: Database, title: 'Sheets CRM Sync', desc: 'Real-time bidirectional sync with Google Sheets for lead management.' },
    { icon: Calendar, title: 'Smart Scheduling', desc: 'Auto-book follow-ups during AI-driven voice interactions.' },
    { icon: ShieldCheck, title: 'Context Memory', desc: 'Remembers interactions for deeply personalized follow-ups.' },
  ];

  const industries = [
    { icon: Briefcase, name: 'BFSI' },
    { icon: GraduationCap, name: 'EdTech' },
    { icon: Hospital, name: 'Healthcare' },
    { icon: Store, name: 'Retail' },
    { icon: Leaf, name: 'Agriculture' },
  ];

  const steps = [
    { num: '01', title: 'Upload Leads', desc: 'Import via CSV or Google Sheets integration.' },
    { num: '02', title: 'AI Voice Calls', desc: 'Intelligent agents conduct empathic conversations at scale.' },
    { num: '03', title: 'Score & Schedule', desc: 'Leads auto-scored, follow-ups scheduled in your CRM.' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo(0, 0)}>
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 bg-[linear-gradient(-45deg,#a855f7,#ec4899,#3b82f6,#a855f7)] bg-[length:400%_400%] animate-gradient-xy rounded-lg blur opacity-60 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative w-8 h-8 bg-background border border-white/20 rounded-lg flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(-45deg,#a855f7,#ec4899,#3b82f6,#a855f7)] bg-[length:400%_400%] animate-gradient-xy opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <Hexagon size={16} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-[spin_4s_linear_infinite]" />
              </div>
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60">
              GAMMA
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <button className="btn-ghost text-sm" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Features</button>
            <button className="btn-ghost text-sm" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>Process</button>
            <button className="btn-ghost text-sm" onClick={() => document.getElementById('industries')?.scrollIntoView({ behavior: 'smooth' })}>Industries</button>
            <button className="btn-ghost text-sm" onClick={onLogin}>Sign In</button>
            <button className="btn-gamma text-sm ml-2" onClick={onGetStarted}>Get Started <ArrowRight size={14} className="inline ml-1" /></button>
          </nav>

          <button className="md:hidden p-2 text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-20"
        >
          <div className="flex flex-col items-center gap-6 p-8">
            <button className="text-lg text-foreground" onClick={() => { document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }}>Features</button>
            <button className="text-lg text-foreground" onClick={() => { document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }}>Process</button>
            <button className="text-lg text-foreground" onClick={() => { document.getElementById('industries')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }}>Industries</button>
            <button className="text-lg text-foreground" onClick={() => { onLogin(); setMobileMenuOpen(false); }}>Sign In</button>
            <button className="btn-gamma text-base w-full max-w-xs" onClick={() => { onGetStarted(); setMobileMenuOpen(false); }}>Get Started</button>
          </div>
        </motion.div>
      )}

      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
              <motion.div variants={fadeInUp} custom={0} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-semibold mb-6">
                <Zap size={12} /> Intelligent Sales Automation
              </motion.div>
              <motion.h1 variants={fadeInUp} custom={1} className="text-4xl md:text-5xl lg:text-6xl font-bold font-display leading-tight mb-6">
                AI Sales & Lead<br />
                <span className="gradient-text">Outreach Agent</span>
              </motion.h1>
              <motion.p variants={fadeInUp} custom={2} className="text-muted-foreground text-base md:text-lg mb-8 max-w-lg">
                Automate multilingual lead conversations using emotion-aware AI voice agents. Improve engagement and conversion at scale.
              </motion.p>
              <motion.div variants={fadeInUp} custom={3} className="flex flex-wrap gap-3">
                <button className="btn-gamma text-base" onClick={onGetStarted}>
                  Get Started <ArrowRight size={16} className="inline ml-1" />
                </button>
                <button className="btn-gamma-outline text-base" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                  See How It Works
                </button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="hidden md:block"
            >
              <div className="glass-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-foreground">System Overview</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Real-time outreach tracking</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bot size={20} className="text-primary" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[{ label: 'Total Calls', value: '1,284' }, { label: 'Hot Leads', value: '342' }, { label: 'Conversion', value: '24.8%' }].map(s => (
                    <div key={s.label} className="bg-secondary/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className="text-lg font-bold font-display text-foreground mt-1">{s.value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary/30 rounded-lg p-6 flex items-center justify-center">
                    <TrendingUp size={40} className="text-primary/40" />
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-6 flex items-center justify-center">
                    <MessageSquare size={40} className="text-primary/40" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="section-title text-foreground">Advanced AI Capabilities</h2>
            <p className="section-subtitle max-w-xl mx-auto">Powerful features tailored for enterprise outreach.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card-hover p-6"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 border-t border-border/30">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="section-title text-foreground">How It Works</h2>
            <p className="section-subtitle">Three simple steps to automate your outreach.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card p-6 text-center relative"
              >
                <div className="text-4xl font-display font-bold text-primary/20 mb-3">{s.num}</div>
                <h3 className="font-display font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
                {i < 2 && <ChevronRight size={20} className="hidden md:block absolute top-1/2 -right-4 text-primary/30 -translate-y-1/2" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section id="industries" className="py-20 px-4 border-t border-border/30">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="section-title text-foreground">Tailored for Your Industry</h2>
            <p className="section-subtitle">Trusted across sectors for complex outreach needs.</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {industries.map((ind, i) => (
              <motion.div
                key={ind.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card-hover p-5 text-center"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <ind.icon size={20} className="text-primary" />
                </div>
                <p className="font-semibold text-sm text-foreground">{ind.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 px-4 border-t border-border/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="section-title text-foreground mb-8">Seamless Integrations</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[{ icon: Database, label: 'Firebase' }, { icon: Bot, label: 'Gemini AI' }, { icon: MessageSquare, label: 'n8n' }, { icon: Database, label: 'Google Sheets' }].map(i => (
              <div key={i.label} className="glass-card px-5 py-3 flex items-center gap-2 text-sm text-muted-foreground">
                <i.icon size={16} className="text-primary" /> {i.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-12 px-4">
        <div className="container mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4 group">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-[linear-gradient(-45deg,#a855f7,#ec4899,#3b82f6,#a855f7)] bg-[length:400%_400%] animate-gradient-xy rounded-lg blur opacity-60 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-8 h-8 bg-background border border-white/20 rounded-lg flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(-45deg,#a855f7,#ec4899,#3b82f6,#a855f7)] bg-[length:400%_400%] animate-gradient-xy opacity-40 group-hover:opacity-60 transition-opacity"></div>
                  <Hexagon size={16} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-[spin_4s_linear_infinite]" />
                </div>
              </div>
              <span className="text-xl font-bold font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60">
                GAMMA
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Empowering businesses with intelligent, emotion-aware voice agents.</p>
            <div className="flex gap-3">
              <Twitter size={18} className="text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
              <Linkedin size={18} className="text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
              <Github size={18} className="text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
            </div>
          </div>
          {[
            { title: 'Product', items: ['Features', 'Pricing', 'Integrations', 'Live Demo'] },
            { title: 'Resources', items: ['API Docs', 'Legal', 'Privacy Policy', 'Support'] },
            { title: 'Company', items: ['About Us', 'Careers', 'Contact'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="font-display font-semibold text-foreground mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.items.map(item => (
                  <li key={item} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="container mx-auto max-w-6xl mt-8 pt-6 border-t border-border/30 text-center text-xs text-muted-foreground">
          © 2026 GAMMA AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
