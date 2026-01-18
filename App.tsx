import React, { useState, useEffect } from 'react';
import { User, AppView } from './types';
import { getSession, logout } from './services/api';
import { AuthFlow } from './components/AuthFlow';
import { XrayDashboard } from './components/XrayDashboard';
import { LandingPage } from './components/LandingPage';
import { WebDashboard } from './components/WebDashboard';
import { UserSuccessView } from './components/UserSuccessView';
import { BlogPage } from './components/BlogPage';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<AppView>(AppView.LOGIN);
  const [showExtensionOverlay, setShowExtensionOverlay] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [showBlogPage, setShowBlogPage] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Helper to enforce role-based routing
  const routeUserBasedOnRole = (u: User) => {
    if (u.role === 'trainer') {
      setView(AppView.WEB_DASHBOARD);
    } else {
      // STRICT: Users are NEVER allowed on the dashboard view
      setView(AppView.USER_SUCCESS);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }

    // Restore Session & Enforce Rules
    const session = getSession();
    // Only restore if we have valid user data (prevent corrupted session restore)
    if (session && session.id && session.email) {
      // Ensure all required properties are present
      const completeUser: User = {
        id: session.id,
        name: session.name || '',
        email: session.email || '',
        passwordHash: session.passwordHash || '',
        isApproved: session.isApproved || false,
        role: session.role || 'user',
        walletBalance: session.walletBalance || 0,
        referralCount: session.referralCount || 0,
        subscriptionExpiry: session.subscriptionExpiry || new Date().toISOString(),
        referralLink: session.referralLink || '',
        token: session.token
      };
      setUser(completeUser);
      setShowLandingPage(false);
      routeUserBasedOnRole(completeUser);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleLoginSuccess = (u: User) => {
    setUser(u);
    setShowLandingPage(false);
    routeUserBasedOnRole(u);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setShowExtensionOverlay(false);
    setShowLandingPage(true);
    setView(AppView.LOGIN);
  };

  const handleLaunchExtension = () => {
    if (!user) return;
    setShowExtensionOverlay(true);
  };

  // 0. Render Blog Page
  if (showBlogPage) {
    return (
      <BlogPage
        onBack={() => setShowBlogPage(false)}
        isDarkMode={isDarkMode}
      />
    );
  }

  // 1. Render Landing Page (Public)
  if (showLandingPage && !user) {
    return (
      <LandingPage 
        onLogin={handleLoginSuccess}
        onSignupUser={() => { setView(AppView.SIGNUP_USER); setShowLandingPage(false); }}
        onSignupTrainer={() => { setView(AppView.SIGNUP_TRAINER); setShowLandingPage(false); }}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onOpenBlog={() => setShowBlogPage(true)}
      />
    );
  }

  // 2. Render Main Application Wrapper
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-200 font-sans selection:bg-brand selection:text-black transition-colors duration-300">
      
      {/* TRAINER VIEW: Protected Web Dashboard */}
      {user && view === AppView.WEB_DASHBOARD && !showExtensionOverlay && (
         <WebDashboard 
            user={user} 
            onLogout={handleLogout} 
            onLaunchExtension={handleLaunchExtension}
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
         />
      )}

      {/* USER VIEW: Success Screen (Strictly Enforced) */}
      {user && view === AppView.USER_SUCCESS && (
        <UserSuccessView 
            user={user}
            onLogout={handleLogout}
            isDarkMode={isDarkMode}
        />
      )}

      {/* Authentication Views (Login/Signup/Payment) */}
      {!user && (view === AppView.LOGIN || view === AppView.SIGNUP_USER || view === AppView.SIGNUP_TRAINER || view === AppView.PAYMENT || view === AppView.PENDING_APPROVAL) && (
          <div className="min-h-screen flex items-center justify-center p-4">
            <AuthFlow 
                currentView={view} 
                setView={setView} 
                onLoginSuccess={handleLoginSuccess}
                onBackToLanding={() => setShowLandingPage(true)}
            />
          </div>
      )}

      {/* EXTENSION OVERLAY */}
      {showExtensionOverlay && (
        <XrayDashboard 
            onClose={() => setShowExtensionOverlay(false)} 
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
        />
      )}
    </div>
  );
};

export default App;