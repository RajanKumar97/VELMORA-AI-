import { useState, useEffect, useCallback } from 'react';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProblemSection from './components/ProblemSection';
import SquadSection from './components/SquadSection';
import MathSection from './components/MathSection';
import ArchitectSection from './components/ArchitectSection';
import WhyChooseSection from './components/WhyChooseSection';
import SecuritySection from './components/SecuritySection';
import ReviewsSection from './components/ReviewsSection';
import PricingSection from './components/PricingSection';
import CalculatorSection from './components/CalculatorSection';
import LeadFormSection from './components/LeadFormSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import SubscriptionModal from './components/SubscriptionModal';
import OfflineScreen from './components/OfflineScreen';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';

interface User {
  id: string;
  name: string;
  email: string;
}

type ViewMode = 'landing' | 'dashboard';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [showSubModal, setShowSubModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authDefaultToLogin, setAuthDefaultToLogin] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [view, setView] = useState<ViewMode>('landing');
  const [transitioning, setTransitioning] = useState(false);
  const [isPro, setIsPro] = useState(false);

  // Check auth on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // @ts-ignore
        const { data: { session } } = await window.supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.name || '',
            email: session.user.email || '',
          });
          setView('dashboard');
        }
      } catch (e) {
        console.log('No session found');
      } finally {
        setCheckingAuth(false);
      }
    };
    checkSession();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    // @ts-ignore
    const { data: { subscription } } = window.supabase.auth.onAuthStateChange((_event: string, session: any) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || '',
          email: session.user.email || '',
        });
        smoothTransition('dashboard');
      } else {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Smooth fade transition between views
  const smoothTransition = useCallback((target: ViewMode) => {
    setTransitioning(true);
    setTimeout(() => {
      setView(target);
      window.scrollTo({ top: 0 });
      setTimeout(() => setTransitioning(false), 50);
    }, 400);
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setLoading(false);
  }, []);

  const handleDeployClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setAuthDefaultToLogin(false);
    setTimeout(() => setShowAuthModal(true), 600);
  }, []);

  const handleLoginClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setAuthDefaultToLogin(true);
    setTimeout(() => setShowAuthModal(true), 600);
  }, []);

  const handleAuthSuccess = useCallback(() => {
    setShowAuthModal(false);
    // Auth state listener will handle the transition to dashboard
  }, []);

  const handleLogout = useCallback(async () => {
    // @ts-ignore
    await window.supabase.auth.signOut();
    setUser(null);
    smoothTransition('landing');
  }, [smoothTransition]);

  const handleGoHome = useCallback(() => {
    smoothTransition('landing');
  }, [smoothTransition]);

  // User update handled inside Dashboard settings panel

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen">
      {isOffline && <OfflineScreen />}
      {loading && <LoadingScreen onComplete={handleLoadingComplete} />}

      {/* ── Smooth fade wrapper for all view transitions ── */}
      <div className={`transition-opacity duration-400 ease-in-out ${transitioning ? 'opacity-0' : 'opacity-100'} ${loading ? 'opacity-0' : ''}`}>

        {/* ── DASHBOARD VIEW ── */}
        {!checkingAuth && user && view === 'dashboard' && (
          <Dashboard
            user={user}
            onLogout={handleLogout}
            onGoHome={handleGoHome}
            isPro={isPro}
            setIsPro={setIsPro}
          />
        )}

        {/* ── LANDING PAGE VIEW ── */}
        {view === 'landing' && (
          <div className="bg-[#050508]">
            <Navbar 
          onDeployClick={handleDeployClick} 
          onLoginClick={handleLoginClick} 
        />
            <HeroSection onDeployClick={handleDeployClick} />
            <ProblemSection />
            <SquadSection onDeployClick={handleDeployClick} />
            <MathSection />
            <ArchitectSection onDeployClick={handleDeployClick} />
            <WhyChooseSection onDeployClick={handleDeployClick} />
            <SecuritySection />
            <PricingSection onDeployClick={handleDeployClick} />
            <CalculatorSection />
            <ReviewsSection />
            <LeadFormSection />
            <CTASection onDeployClick={handleDeployClick} />
            <Footer onDeployClick={handleDeployClick} />
          </div>
        )}
      </div>

      {/* ── Modals (always above views) ── */}
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
          onAuthSuccess={handleAuthSuccess} 
          defaultToLogin={authDefaultToLogin}
        />
      )}

      {showSubModal && (
        <SubscriptionModal onClose={() => setShowSubModal(false)} />
      )}
    </div>
  );
}

