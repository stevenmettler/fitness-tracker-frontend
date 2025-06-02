import React, { useState, useEffect } from 'react';
import NewSession from './components/NewSession';
import LoginScreen from './components/LoginScreen';
import SessionDashboard from './components/SessionDashboard';

// API Configuration - Switch between local and production
const API_BASE = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000' 
  : 'https://fitness-tracker-backend-production-1780.up.railway.app';

// API Helper Functions
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    return response;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

function App() {
  // Theme state - shared across all components
  const [currentTheme, setCurrentTheme] = useState('energy');
  
  // User authentication state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Session state
  const [currentSession, setCurrentSession] = useState(null);
  
  // Session history for debugging/tracking
  const [sessionHistory, setSessionHistory] = useState([]);

  // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode JWT token to get user info
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Date.now() / 1000;
        
        if (payload.exp > now) {
          setUser({ 
            username: payload.sub, 
            id: payload.user_id // Extract user_id from token
          });
          console.log('🔄 Restored user from token:', {
            username: payload.sub,
            user_id: payload.user_id
          });
        } else {
          // Token expired
          console.log('⏰ Token expired, removing...');
          localStorage.removeItem('token');
        }
      } catch (e) {
        // Invalid token
        console.log('❌ Invalid token, removing...');
        localStorage.removeItem('token');
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
        localStorage.setItem('token', data.access_token);
        
        // Decode token to get user info INCLUDING DATABASE ID
        const payload = JSON.parse(atob(data.access_token.split('.')[1]));
        
        if (!payload.user_id) {
          console.error('❌ No user_id in token payload:', payload);
          return { success: false, error: 'Invalid token - missing user ID' };
        }
        
        setUser({ 
          username: payload.sub, 
          id: payload.user_id // This is the REAL database user ID
        });
        
        console.log('✅ Login successful:', {
          username: payload.sub,
          user_id: payload.user_id,
          token_expires: new Date(payload.exp * 1000).toLocaleString()
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

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCurrentSession(null);
    console.log('👋 User logged out');
  };

  // Handle session start
  const handleStartSession = (sessionData) => {
    console.log('🏁 New session started:', sessionData);
    
    // Initialize session with proper structure and timing
    const newSession = {
      ...sessionData,
      workouts: [], // Ensure workouts array exists
      started_at: new Date().toISOString(), // Use actual start time
      user_id: user?.id, // Use actual user ID from database
      notes: '' // Initialize empty notes
    };
    
    setCurrentSession(newSession);
    console.log('📊 Session initialized with user_id:', user?.id);
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
    // Send session to backend - use original payload without user_id
    const response = await apiCall('/sessions/', {
      method: 'POST',
      body: JSON.stringify(sessionPayload) // ← Use sessionPayload directly
    });

    if (response.ok) {
      const savedSession = await response.json();
      console.log('✅ Session saved to backend successfully!', savedSession);
      
      // Add to session history for tracking
      setSessionHistory(prev => [...prev, {
        ...sessionPayload, // ← Use sessionPayload instead of correctedPayload
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
        `👤 User: ${user.username}\n` + // ← Show username instead of user_id
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
  
  // Clear current session only after successful save
  setCurrentSession(null);
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
        console.log('User ID being used in sessions:', user?.id);
        console.log('Current Session:', currentSession);
        console.log('Current Theme:', currentTheme);
        console.log('Token:', localStorage.getItem('token') ? 'Present' : 'None');
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
  }, [user, currentSession, currentTheme, sessionHistory]);

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
      ) : !currentSession ? (
        // Show new session screen if user is logged in but no session started
        <NewSession 
          onStartSession={handleStartSession}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
          onLogout={handleLogout}  // Added logout prop
          user={user}              // Added user prop
        />
      ) : (
        // Show session in progress
        <SessionDashboard 
          session={currentSession}
          user={user}
          onAddWorkout={handleAddWorkout}
          onEndSession={handleEndSession}
          onLogout={handleLogout}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
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