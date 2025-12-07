import { useState, useEffect } from 'react';
import { TeamLogin } from './TeamLogin';
import { TeamSignup } from './TeamSignup';
import { TeamSelect } from './TeamSelect';
import { TeamDashboard } from './TeamDashboard';

export function TeamApp() {
  const [view, setView] = useState<'login' | 'signup' | 'select' | 'workspace'>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('team_session_token');
    const path = window.location.pathname;
    
    if (token) {
      setIsAuthenticated(true);
      if (path.includes('/workspace')) {
        setView('workspace');
      } else if (path.includes('/select')) {
        setView('select');
      } else {
        setView('select');
      }
    } else if (path.includes('/signup')) {
      setView('signup');
    } else {
      setView('login');
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setView('select');
    window.history.pushState({}, '', '/team/select');
  };

  const handleSignupSuccess = () => {
    setView('login');
    window.history.pushState({}, '', '/team/login');
  };

  const handleTeamSelected = () => {
    setView('workspace');
    window.history.pushState({}, '', '/team/workspace');
  };

  const handleSwitchToSignup = () => {
    setView('signup');
    window.history.pushState({}, '', '/team/signup');
  };

  const handleSwitchToLogin = () => {
    setView('login');
    window.history.pushState({}, '', '/team/login');
  };

  if (view === 'workspace' && isAuthenticated) {
    return <TeamDashboard />;
  }

  if (view === 'select' && isAuthenticated) {
    return <TeamSelect onTeamSelected={handleTeamSelected} />;
  }

  if (view === 'signup') {
    return <TeamSignup onSuccess={handleSignupSuccess} onSwitchToLogin={handleSwitchToLogin} />;
  }

  return <TeamLogin onSuccess={handleLoginSuccess} onSwitchToSignup={handleSwitchToSignup} />;
}
