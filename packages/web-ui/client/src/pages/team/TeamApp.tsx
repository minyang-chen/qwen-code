import { useState, useEffect } from 'react';
import { TeamLogin } from './TeamLogin';
import { TeamSignup } from './TeamSignup';
import { TeamDashboard } from './TeamDashboard';

export function TeamApp() {
  const [view, setView] = useState<'login' | 'signup' | 'dashboard'>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('team_session_token');
    const path = window.location.pathname;
    
    if (token) {
      setIsAuthenticated(true);
      setView('dashboard');
    } else if (path.includes('/signup')) {
      setView('signup');
    } else {
      setView('login');
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setView('dashboard');
    window.history.pushState({}, '', '/team/dashboard');
  };

  const handleSignupSuccess = () => {
    setView('login');
    window.history.pushState({}, '', '/team/login');
  };

  const handleSwitchToSignup = () => {
    setView('signup');
    window.history.pushState({}, '', '/team/signup');
  };

  const handleSwitchToLogin = () => {
    setView('login');
    window.history.pushState({}, '', '/team/login');
  };

  if (view === 'dashboard' && isAuthenticated) {
    return <TeamDashboard />;
  }

  if (view === 'signup') {
    return <TeamSignup onSuccess={handleSignupSuccess} onSwitchToLogin={handleSwitchToLogin} />;
  }

  return <TeamLogin onSuccess={handleLoginSuccess} onSwitchToSignup={handleSwitchToSignup} />;
}
