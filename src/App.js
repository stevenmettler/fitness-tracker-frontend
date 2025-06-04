import React, { useState, useEffect } from 'react';
import NewSession from './components/NewSession';
import LoginScreen from './components/LoginScreen';
import SessionDashboard from './components/SessionDashboard';
import SessionHistory from './components/SessionHistory';

// API Configuration - Switch between local and production
const API_BASE = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000' 
  : 'https://fitness-tracker-backend-production-1780.up.railway.app';

// Token refresh management
let refreshTimeout = null;

function App() {
  // Theme state - shared across all components
  const [currentTheme, setCurrentTheme] = useState('energy');
  
  // User authentication state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Navigation state
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'session', 'history'
  
  // Session state
  const [currentSession, setCurrentSession] = useState(null);
  
  // Session history for debugging/tracking
  const [sessionHistory, setSessionHistory] = useState([]);

  // Enhanced API call with automatic token refresh
  const apiCall = async (endpoint, options = {}) => {
    const accessToken = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      
      // If unauthorized and we have a refresh token, try to refresh
      if (response.status === 401 && refreshToken && !endpoint.includes('/refresh')) {
        console.log('🔄 Access token expired, attempting refresh...');
        
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // Retry the original request with new token
          config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
          return await fetch(`${API_BASE}${endpoint}`, config);
        } else {
          // Refresh failed, logout user
          handleLogout('Session expired. Please log in again.');
          throw new Error('Authentication failed');
        }
      }
      
      return response;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  // Refresh access token using refresh token
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      console.log('❌ No refresh token available');
      return false;
    }

    try {
      console.log('🔄 Refreshing access token...');
      
      const response = await fetch(`${API_BASE}/users/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store new tokens and user data
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        
        // Schedule next refresh
        scheduleTokenRefresh(data.access_token);
        
        console.log('✅ Token refreshed successfully');
        return true;
      } else {
        console.log('❌ Token refresh failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Error refreshing token:', error);
      return false;
    }
  };

  // Schedule automatic token refresh before expiration
  const scheduleTokenRefresh = (token) => {
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;
      
      // Refresh 5 minutes before expiration
      const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 60000); // At least 1 minute
      
      console.log(`⏰ Token refresh scheduled in ${Math.round(refreshTime / 1000 / 60)} minutes`);
      
      refreshTimeout = setTimeout(async () => {
        console.log('🔄 Automatic token refresh triggered');
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          handleLogout('Session expired. Please log in again.');
        }
      }, refreshTime);
      
    } catch (error) {
      console.error('❌ Error scheduling token refresh:', error);
    }
  };

  // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refresh_token');
    const userData = localStorage.getItem('user_data'); // Store user data separately
    
    if (token && userData) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Date.now() / 1000;
        const user = JSON.parse(userData);
        
        if (payload.exp > now) {
          // Token is still valid
          setUser({
            username: user.username,
            id: user.id
          });
          
          // Schedule automatic refresh
          scheduleTokenRefresh(token);
          
          console.log('🔄 Restored user from valid token:', {
            username: user.username,
            user_id: user.id,
            expires_in_minutes: Math.round((payload.exp - now) / 60)
          });
        } else if (refreshToken) {
          // Token expired but we have refresh token
          console.log('⏰ Access token expired, attempting refresh...');
          refreshAccessToken().then(refreshed => {
            if (refreshed) {
              const newUserData = localStorage.getItem('user_data');
              if (newUserData) {
                const newUser = JSON.parse(newUserData);
                setUser({
                  username: newUser.username,
                  id: newUser.id
                });
              }
            } else {
              console.log('❌ Refresh failed, clearing tokens');
              localStorage.removeItem('token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user_data');
            }
          });
        } else {
          // No refresh token, clear expired access token
          console.log('⏰ Token expired with no refresh token, removing...');
          localStorage.removeItem('token');
          localStorage.removeItem('user_data');
        }
      } catch (e) {
        console.log('❌ Invalid token or user data, removing...');
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
      }
    }
    setLoading(false);
  }, []);

  // Handle user login
  const handleLogin = async (userData) => {
    if (typeof userData === 'string') {
      // This is from the mock login - keep for backwards compatibility
      console.log('🎭 Mock login:', userData);
      setUser({ username: userData, id: 1 });
      return { success: true };
    }

    // Real API login
    try {
      console.log('🔐 Attempting login for:', userData.username);
      
      const response = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userData.username,
          password: userData.password
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store tokens and user data separately
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        
        // Schedule automatic refresh
        scheduleTokenRefresh(data.access_token);
        
        // Set user from API response, not from JWT
        setUser({
          username: data.user.username,
          id: data.user.id
        });
        
        console.log('✅ Login successful:', {
          username: data.user.username,
          user_id: data.user.id,
          token_expires: new Date(JSON.parse(atob(data.access_token.split('.')[1])).exp * 1000).toLocaleString()
        });
        return { success: true };
      } else {
        // Handle different types of errors
        let errorMessage = 'Login failed';
        
        try {
          const error = await response.json();
          
          if (response.status === 422) {
            // Validation error - extract meaningful message
            if (error.detail && Array.isArray(error.detail)) {
              const passwordError = error.detail.find(err => 
                err.loc && err.loc.includes('password')
              );
              if (passwordError) {
                errorMessage = 'Password must be at least 8 characters';
              } else {
                errorMessage = 'Please check your input and try again';
              }
            } else {
              errorMessage = 'Invalid input. Please check your credentials.';
            }
          } else if (response.status === 401) {
            errorMessage = 'Invalid username or password';
          } else if (error.detail) {
            errorMessage = error.detail;
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          errorMessage = `Server error (${response.status}). Please try again.`;
        }
        
        console.error('❌ Login failed:', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      console.error('❌ Network error during login:', err);
      return { success: false, error: 'Network error. Please check your connection and try again.' };
    }
  };

  // Handle user registration
  const handleRegister = async (userData) => {
    try {
      console.log('📝 Attempting registration for:', userData.username);
      
      const response = await fetch(`${API_BASE}/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password
        })
      });

      if (response.ok) {
        console.log('✅ Registration successful for:', userData.username);
        return { success: true };
      } else {
        const error = await response.json();
        console.error('❌ Registration failed:', error.detail);
        return { success: false, error: error.detail || 'Registration failed' };
      }
    } catch (err) {
      console.error('❌ Network error during registration:', err);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Handle user logout with optional message
  const handleLogout = (message) => {
    // Clear refresh timeout
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
      refreshTimeout = null;
    }
    
    // Clear all stored data
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    
    // Reset state
    setUser(null);
    setCurrentSession(null);
    setCurrentView('dashboard');
    
    console.log('👋 User logged out');
    
    // Show message if provided
    if (message) {
      alert(message);
    }
  };

  // Navigation handlers
  const handleViewHistory = () => {
    setCurrentView('history');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleBackFromSession = () => {
    setCurrentView('dashboard');
    setCurrentSession(null);
  };

  // Handle session start
  const handleStartSession = (sessionData) => {
    console.log('🏁 New session started:', sessionData);
    
    // Initialize session with proper structure and timing
    const newSession = {
      ...sessionData,
      workouts: [], // Ensure workouts array exists
      started_at: new Date().toISOString(), // Use actual start time
      notes: '' // Initialize empty notes
    };
    
    setCurrentSession(newSession);
    setCurrentView('session'); // Switch to session view
    console.log('📊 Session initialized');
  };

  // Handle adding workout to current session
  const handleAddWorkout = (workoutData) => {
    console.log('💪 Adding workout to session:', workoutData);
    
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        workouts: [...currentSession.workouts, workoutData]
      };
      setCurrentSession(updatedSession);
      console.log('📈 Session updated. Total workouts:', updatedSession.workouts.length);
    }
  };

  // Handle ending session with payload - SEND TO BACKEND
  const handleEndSession = async (sessionPayload) => {
    console.log('🎯 SESSION COMPLETED - Preparing to send to backend...');
    
    console.log('📋 Final Session Payload:', JSON.stringify(sessionPayload, null, 2));
    
    try {
      // Send session to backend using the enhanced apiCall function
      const response = await apiCall('/sessions/', {
        method: 'POST',
        body: JSON.stringify(sessionPayload)
      });

      if (response.ok) {
        const savedSession = await response.json();
        console.log('✅ Session saved to backend successfully!', savedSession);
        
        // Add to session history for tracking
        setSessionHistory(prev => [...prev, {
          ...sessionPayload,
          completed_at: new Date().toISOString(),
          backend_id: savedSession.id
        }]);
        
        // Show success message
        const workoutCount = sessionPayload.workouts.length;
        const totalSets = sessionPayload.workouts.reduce((total, workout) => 
          total + workout.sets.length, 0
        );
        const totalReps = sessionPayload.workouts.reduce((total, workout) =>
          total + workout.sets.reduce((setTotal, set) => setTotal + set.reps.count, 0), 0
        );
        
        alert(
          `🎉 Session Saved Successfully!\n\n` +
          `👤 User: ${user.username}\n` +
          `📊 Summary:\n` +
          `• ${workoutCount} workout${workoutCount !== 1 ? 's' : ''}\n` +
          `• ${totalSets} total sets\n` +
          `• ${totalReps} total reps\n\n` +
          `💾 Data saved to backend!`
        );
        
      } else {
        const error = await response.json();
        console.error('❌ Failed to save session:', error);
        alert(`Failed to save session: ${error.detail || 'Unknown error'}`);
        return; // Don't clear session if save failed
      }
      
    } catch (error) {
      console.error('❌ Network error saving session:', error);
      alert('Network error. Session not saved. Please try again.');
      return; // Don't clear session if save failed
    }
    
    // Clear current session and return to dashboard
    setCurrentSession(null);
    setCurrentView('dashboard');
  };

  // Handle theme changes
  const handleThemeChange = (newTheme) => {
    setCurrentTheme(newTheme);
  };

  // Debug function to view session history
  const viewSessionHistory = () => {
    console.log('📚 SESSION HISTORY');
    sessionHistory.forEach((session, index) => {
      console.log(`Session ${index + 1}:`, session);
    });
    
    if (sessionHistory.length === 0) {
      console.log('No completed sessions yet.');
    }
  };

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      console.log('🔗 Testing backend connection...');
      const response = await fetch(`${API_BASE}/health`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend connection successful:', data);
        return true;
      } else {
        console.error('❌ Backend health check failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Cannot connect to backend:', error);
      return false;
    }
  };

  // Test backend on load (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      testBackendConnection();
    }
  }, []);

  // Add keyboard shortcut for debugging
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + Shift + D to view debug info
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        console.log('🔍 DEBUG INFO');
        console.log('API Base:', API_BASE);
        console.log('Current User:', user);
        console.log('Current View:', currentView);
        console.log('Current Session:', currentSession);
        console.log('Current Theme:', currentTheme);
        console.log('Token:', localStorage.getItem('token') ? 'Present' : 'None');
        console.log('Refresh Token:', localStorage.getItem('refresh_token') ? 'Present' : 'None');
        console.log('User Data:', localStorage.getItem('user_data') ? JSON.parse(localStorage.getItem('user_data')) : 'None');
        if (localStorage.getItem('token')) {
          try {
            const payload = JSON.parse(atob(localStorage.getItem('token').split('.')[1]));
            console.log('Token Payload:', payload);
          } catch (e) {
            console.log('Token decode error:', e);
          }
        }
        viewSessionHistory();
        testBackendConnection();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [user, currentView, currentSession, currentTheme, sessionHistory]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, []);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #4facfe 100%)',
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTop: '3px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '1rem'
          }}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Render different views based on currentView state
  return (
    <div className="App">
      {!user ? (
        // Show login screen if user is not authenticated
        <LoginScreen 
          onLogin={handleLogin}
          onRegister={handleRegister}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
      ) : currentView === 'history' ? (
        // Show session history page
        <SessionHistory
          user={user}
          onBack={handleBackToDashboard}
          onLogout={() => handleLogout()}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
      ) : currentView === 'session' && currentSession ? (
        // Show session in progress
        <SessionDashboard 
          session={currentSession}
          user={user}
          onAddWorkout={handleAddWorkout}
          onEndSession={handleEndSession}
          onLogout={() => handleLogout()}
          onBack={handleBackFromSession}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
      ) : (
        // Show new session screen (dashboard)
        <NewSession 
          onStartSession={handleStartSession}
          onViewHistory={handleViewHistory}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
          onLogout={() => handleLogout()}
          user={user}
        />
      )}
      
      {/* Debug Panel - Development only */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '8px',
          fontSize: '12px',
          zIndex: 1000,
          maxWidth: '200px'
        }}>
          <div><strong>🔧 Debug Info:</strong></div>
          <div>API: {API_BASE.includes('localhost') ? '🏠 Local' : '☁️ Production'}</div>
          <div>User: {user?.username || 'None'}</div>
          <div>User ID: {user?.id || 'None'}</div>
          <div>View: {currentView}</div>
          <div>Session: {currentSession ? '✅ Active' : '❌ None'}</div>
          <div>Theme: {currentTheme}</div>
          <div>History: {sessionHistory.length} sessions</div>
          <div style={{ marginTop: '5px', fontSize: '10px', opacity: 0.7 }}>
            Ctrl+Shift+D for details
          </div>
        </div>
      )}
    </div>
  );
}

export default App;