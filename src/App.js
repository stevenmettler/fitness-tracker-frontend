import React, { useState } from 'react';
import NewSession from './components/NewSession';
import LoginScreen from './components/LoginScreen';
import SessionDashboard from './components/SessionDashboard';

function App() {
  // Theme state - shared across all components
  const [currentTheme, setCurrentTheme] = useState('energy');
  
  // User authentication state
  const [user, setUser] = useState(null);
  
  // Session state
  const [currentSession, setCurrentSession] = useState(null);

  // Handle user login
  const handleLogin = (userData) => {
    console.log('User logged in:', userData);
    setUser(userData);
  };

  // Handle user logout
  const handleLogout = () => {
    setUser(null);
    setCurrentSession(null); // Clear session when logging out
  };

  // Handle session start
  const handleStartSession = (sessionData) => {
    console.log('New session started:', sessionData);
    setCurrentSession(sessionData);
  };

  // Handle theme changes
  const handleThemeChange = (newTheme) => {
    setCurrentTheme(newTheme);
  };

  return (
    <div className="App">
      {!user ? (
        // Show login screen if user is not authenticated
        <LoginScreen 
          onLogin={handleLogin}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
      ) : !currentSession ? (
        // Show new session screen if user is logged in but no session started
        <NewSession 
          onStartSession={handleStartSession}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
      ) : (
        // Show session in progress
        <SessionDashboard 
          session={currentSession}
          user={user}
          onAddWorkout={() => console.log('Add workout clicked')}
          onEndSession={() => setCurrentSession(null)}
          onLogout={handleLogout}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
      )}
    </div>
  );
}

// Helper function to get theme background
const getThemeBackground = (theme) => {
  const themes = {
    energy: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 30%, #ff4757 70%, #ff3838 100%)',
    bloom: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 30%, #fecfef 70%, #fad0c4 100%)',
    ocean: 'linear-gradient(135deg, #667eea 0%, #764ba2 30%, #4facfe 70%, #00f2fe 100%)',
    forest: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 30%, #88d8a3 70%, #4fd1c7 100%)',
    sunset: 'linear-gradient(135deg, #fa709a 0%, #fee140 30%, #ffa726 70%, #ff7043 100%)'
  };
  return themes[theme] || themes.energy;
};

export default App;