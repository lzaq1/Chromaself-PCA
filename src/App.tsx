import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Shield, Zap, ArrowRight, Menu, Github, Twitter, Instagram, LogIn, Key, Plus, Lock, RefreshCw } from 'lucide-react';
import { DetectionInterface } from './components/DetectionInterface';
import { ResultsDisplay } from './components/ResultsDisplay';
import { AnalysisResult } from './services/geminiService';
import { auth, signInWithGoogle, getUserProfile, createUserProfile, UserProfile, generateAccessCode, validateAccessCode } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export default function App() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessCode, setAccessCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        let userProfile = await getUserProfile(firebaseUser.uid);
        if (!userProfile) {
          userProfile = await createUserProfile(firebaseUser);
        }
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      alert("Login failed. Please try again.");
    }
  };

  const handleValidateCode = async () => {
    if (!user || !accessCode) return;
    setIsValidating(true);
    try {
      const success = await validateAccessCode(user.uid, accessCode.trim());
      if (success) {
        const updatedProfile = await getUserProfile(user.uid);
        setProfile(updatedProfile);
      } else {
        alert("Invalid or already used code.");
      }
    } catch (error) {
      alert("Error validating code.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!user || profile?.role !== 'admin') return;
    try {
      const code = await generateAccessCode(user.uid);
      setGeneratedCode(code);
    } catch (error) {
      alert("Error generating code.");
    }
  };

  const scrollToDetect = () => {
    document.getElementById('detect')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-16 h-16 border-4 border-[#4a40e0] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[rgba(255,255,255,0.7)] backdrop-blur-3xl border-b border-[rgba(226,232,240,0.5)]">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-8 h-20">
          <div className="text-2xl font-black text-[#4a40e0] tracking-tighter font-headline flex items-center gap-2">
            <Palette className="w-8 h-8" />
            ChromaSelf
          </div>
          <div className="hidden md:flex gap-10 items-center">
            {user && (
              <div className="flex items-center gap-3 bg-[#f1f5f9] px-4 py-2 rounded-full">
                <img src={user.photoURL || ''} alt="" className="w-6 h-6 rounded-full" />
                <span className="text-xs font-bold text-[#2c2f31]">{user.displayName}</span>
              </div>
            )}
            <button 
              onClick={() => auth.signOut()}
              className="text-[#595c5e] hover:text-[#4a40e0] font-medium text-sm transition-colors"
            >
              {user ? 'Sign Out' : 'Sign In'}
            </button>
            <button 
              onClick={scrollToDetect}
              className="bg-[#4a40e0] text-[#ffffff] px-6 py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition-all active:scale-95"
            >
              Get Started
            </button>
          </div>
          <button className="md:hidden text-[#2c2f31]">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      <main className="flex-grow pt-20">
        {!user ? (
          <div className="min-h-[80vh] flex flex-col items-center justify-center px-8 text-center">
            <div className="w-24 h-24 bg-[#4a40e0]/5 rounded-full flex items-center justify-center mb-8">
              <LogIn className="w-12 h-12 text-[#4a40e0]" />
            </div>
            <h2 className="editorial-font text-5xl font-black mb-6 tracking-tighter text-[#1a1a1a]">Welcome Back</h2>
            <p className="text-xl text-[#64748b] max-w-md mb-12 leading-relaxed font-light">
              Please sign in with Google to access your personalized color analysis and style reports.
            </p>
            <button 
              onClick={handleLogin}
              className="soul-gradient text-white px-12 py-5 rounded-2xl font-black text-xl flex items-center gap-4 shadow-2xl shadow-[#4a40e0]/30 hover:scale-105 transition-all"
            >
              <LogIn className="w-6 h-6" /> Sign In with Google
            </button>
          </div>
        ) : !profile?.isAuthorized ? (
          <div className="min-h-[80vh] flex flex-col items-center justify-center px-8 text-center">
            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-8">
              <Lock className="w-12 h-12 text-orange-500" />
            </div>
            <h2 className="editorial-font text-5xl font-black mb-6 tracking-tighter text-[#1a1a1a]">Access Restricted</h2>
            <p className="text-xl text-[#64748b] max-w-md mb-12 leading-relaxed font-light">
              This is a private beta. Please enter your invitation code to unlock the full experience.
            </p>
            <div className="w-full max-w-sm flex flex-col gap-4">
              <input 
                type="text" 
                placeholder="Enter Access Code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="w-full p-5 rounded-2xl border-2 border-[#e2e8f0] focus:border-[#4a40e0] outline-none text-center font-bold text-2xl tracking-widest uppercase"
              />
              <button 
                onClick={handleValidateCode}
                disabled={isValidating || !accessCode}
                className="soul-gradient text-white p-5 rounded-2xl font-black text-xl flex items-center justify-center gap-4 shadow-2xl shadow-[#4a40e0]/30 disabled:opacity-50"
              >
                {isValidating ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Key className="w-6 h-6" />}
                Unlock Access
              </button>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Admin Section */}
                {profile.role === 'admin' && (
                  <section className="max-w-7xl mx-auto px-8 pt-10">
                    <div className="bg-[#1a1a1a] text-white p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10">
                      <div>
                        <h3 className="editorial-font text-3xl font-bold mb-2">Admin Dashboard</h3>
                        <p className="text-white/50">Generate invitation codes for new users.</p>
                      </div>
                      <div className="flex items-center gap-4">
                        {generatedCode && (
                          <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/20 font-mono text-xl font-bold tracking-widest text-[#4a40e0]">
                            {generatedCode}
                          </div>
                        )}
                        <button 
                          onClick={handleGenerateCode}
                          className="bg-[#4a40e0] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-[#3b32c0] transition-colors"
                        >
                          <Plus className="w-5 h-5" /> Generate Code
                        </button>
                      </div>
                    </div>
                  </section>
                )}

                {/* Hero Section */}
                <section className="relative pt-20 pb-32 overflow-hidden">
                  <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#9795ff] spectrum-blur rounded-full -z-10 -translate-y-1/2 translate-x-1/4" />
                  <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#65fde6] spectrum-blur rounded-full -z-10 -translate-x-1/2 translate-y-1/4" />

                  <div className="max-w-7xl mx-auto px-8">
                    <div className="grid lg:grid-cols-12 gap-16 items-center">
                      <div className="lg:col-span-7 text-center lg:text-left">
                        <motion.span 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="inline-block px-4 py-1.5 rounded-full bg-[rgba(74,64,224,0.1)] text-[#4a40e0] font-bold text-xs tracking-widest uppercase mb-6"
                        >
                          AI-Powered Color Psychology
                        </motion.span>
                        <motion.h1 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="font-headline text-5xl md:text-7xl font-extrabold text-[#2c2f31] leading-[1.1] tracking-tighter mb-8"
                        >
                          Discover Your <span className="text-[#4a40e0] italic">Unique</span> Personality Color
                        </motion.h1>
                        <motion.p 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="text-xl text-[#595c5e] max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed"
                        >
                          Through advanced biometric analysis and color theory, we decode your essence into a digital spectrum. More than a test—it's a reflection.
                        </motion.p>
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="flex flex-wrap gap-4 justify-center lg:justify-start"
                        >
                          <button 
                            onClick={scrollToDetect}
                            className="soul-gradient text-[#ffffff] px-8 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-[rgba(74,64,224,0.2)] hover:scale-105 active:scale-95"
                          >
                            Start Detection
                          </button>
                        </motion.div>
                      </div>

                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 3 }}
                        transition={{ delay: 0.4, type: "spring" }}
                        className="lg:col-span-5 relative"
                      >
                        <div className="rounded-3xl overflow-hidden shadow-2xl border-8 border-[#ffffff]">
                          <img 
                            src="https://picsum.photos/seed/chromaself/800/1000" 
                            alt="Hero Portrait" 
                            className="w-full h-[600px] object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </section>

                {/* Detection Interface */}
                <DetectionInterface onResult={setResult} userProfile={profile} onProfileUpdate={setProfile} />

                {/* Features Grid */}
                <section className="max-w-7xl mx-auto px-8 py-32">
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 bg-[#ffffff] p-12 rounded-[3rem] relative overflow-hidden group border border-[#f1f5f9] shadow-sm">
                      <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-[#65fde6] flex items-center justify-center mb-8">
                          <Zap className="w-8 h-8 text-[#2c2f31]" />
                        </div>
                        <h3 className="font-headline text-4xl font-bold mb-6 tracking-tight">Psychological Depth</h3>
                        <p className="text-[#595c5e] text-xl leading-relaxed max-w-lg">
                          Our engine cross-references your physical spectrum with color psychology frameworks to provide a comprehensive personality report.
                        </p>
                      </div>
                      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[rgba(74,64,224,0.05)] rounded-full blur-3xl group-hover:bg-[rgba(74,64,224,0.1)] transition-colors" />
                    </div>

                    <div className="bg-[#4a40e0] p-12 rounded-[3rem] text-[#ffffff] flex flex-col justify-between shadow-xl shadow-[rgba(74,64,224,0.2)]">
                      <div>
                        <Palette className="w-12 h-12 mb-8 opacity-80" />
                        <h3 className="font-headline text-3xl font-bold mb-4 tracking-tight">Social Identity</h3>
                        <p className="text-[#9795ff] leading-relaxed text-lg">
                          Instantly export a custom "Chromatic Passport" to share your energy with the world.
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#ffffff] p-12 rounded-[3rem] border border-[#f1f5f9] shadow-sm">
                      <Shield className="w-12 h-12 text-[#ffc4b1] mb-8" />
                      <h3 className="font-headline text-3xl font-bold mb-4 tracking-tight">Privacy First</h3>
                      <p className="text-[#595c5e] leading-relaxed">
                        Your biometric data is processed on-device. We never store original photos, only the generated color data.
                      </p>
                    </div>
                  </div>
                </section>
              </motion.div>
            ) : (
              <ResultsDisplay result={result} onReset={() => setResult(null)} />
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#ffffff] border-t border-[#e2e8f0] py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="text-2xl font-black text-[#4a40e0] tracking-tighter font-headline flex items-center gap-2 mb-6">
                <Palette className="w-8 h-8" />
                ChromaSelf
              </div>
              <p className="text-[#595c5e] max-w-sm leading-relaxed">
                Empowering individuals to express their true selves through the science of color and AI-driven biometric analysis.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-[#595c5e] text-sm">
                <li><a href="#" className="hover:text-[#4a40e0] transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-[#4a40e0] transition-colors">Color Science</a></li>
                <li><a href="#" className="hover:text-[#4a40e0] transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Connect</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-[#f1f5f9] flex items-center justify-center hover:bg-[#4a40e0] hover:text-[#ffffff] transition-all">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-[#f1f5f9] flex items-center justify-center hover:bg-[#4a40e0] hover:text-[#ffffff] transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-[#f1f5f9] flex items-center justify-center hover:bg-[#4a40e0] hover:text-[#ffffff] transition-all">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-[#f1f5f9] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#595c5e] font-medium uppercase tracking-widest">
            <p>© 2024 ChromaSelf. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-[#4a40e0] transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-[#4a40e0] transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
