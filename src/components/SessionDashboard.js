import React, { useState, useEffect } from 'react';
import { Palette, X, Plus, Clock, Target, Zap, LogOut, User } from 'lucide-react';
import WorkoutModal from './WorkoutModal';

const SessionDashboard = ({ session, user, onAddWorkout, onEndSession, onLogout, currentTheme = 'energy', onThemeChange }) => {
  const [showThemeWheel, setShowThemeWheel] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [currentSession, setCurrentSession] = useState({
    ...session,
    workouts: session.workouts || []
  });
  const [sessionTimer, setSessionTimer] = useState(0);

  const themes = {
    energy: {
      name: 'Energy',
      colors: ['#ff6b35', '#f7931e', '#ff4757'],
      background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 30%, #ff4757 70%, #ff3838 100%)',
    },
    bloom: {
      name: 'Bloom',
      colors: ['#ff9a9e', '#fecfef', '#fad0c4'],
      background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 30%, #fecfef 70%, #fad0c4 100%)',
    },
    ocean: {
      name: 'Ocean',
      colors: ['#667eea', '#764ba2', '#4facfe'],
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 30%, #4facfe 70%, #00f2fe 100%)',
    },
    forest: {
      name: 'Forest',
      colors: ['#56ab2f', '#a8e6cf', '#88d8a3'],
      background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 30%, #88d8a3 70%, #4fd1c7 100%)',
    },
    sunset: {
      name: 'Sunset',
      colors: ['#fa709a', '#fee140', '#ffa726'],
      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 30%, #ffa726 70%, #ff7043 100%)',
    }
  };

  // Update session timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleThemeSelect = (themeKey) => {
    onThemeChange(themeKey);
    setShowThemeWheel(false);
  };

  // Handle adding workout - open the modal
  const handleAddWorkout = () => {
    setShowWorkoutModal(true);
  };

  // Handle saving workout from modal with proper timing
const handleSaveWorkout = (workoutData) => {
  // No need to modify timing - WorkoutModal now provides real times
  console.log('💪 Received workout with real timing:', {
    name: workoutData.name,
    started_at: workoutData.started_at,
    finished_at: workoutData.finished_at,
    duration: Math.floor((new Date(workoutData.finished_at) - new Date(workoutData.started_at)) / 1000 / 60) + ' minutes',
    sets: workoutData.sets.length
  });
  
  // Add workout to the current session with real timing data
  const updatedSession = {
    ...currentSession,
    workouts: [...currentSession.workouts, workoutData]
  };
  
  // Update local session state
  setCurrentSession(updatedSession);
  
  // Call parent's onAddWorkout function if provided
  if (onAddWorkout) {
    onAddWorkout(workoutData);
  }
  
  // Close the modal
  setShowWorkoutModal(false);
  
  console.log('📊 Session updated. Total workouts:', updatedSession.workouts.length);
};

  // Generate complete session payload for backend
  const generateSessionPayload = () => {
    const now = new Date().toISOString();
    
    const sessionPayload = {
      user_id: user.id || 1, // You'll need to get this from actual user data
      started_at: currentSession.started_at,
      finished_at: now,
      notes: currentSession.notes || `Session completed with ${currentSession.workouts.length} workouts`,
      workouts: currentSession.workouts.map(workout => ({
        name: workout.name,
        started_at: workout.started_at,
        finished_at: workout.finished_at,
        sets: workout.sets.map(set => ({
          started_at: set.started_at,
          finished_at: set.finished_at,
          reps: {
            count: set.reps.count,
            intensity: set.reps.intensity,
            weight: set.reps.weight
          }
        }))
      }))
    };

    return sessionPayload;
  };

  // Handle ending session with payload generation
  const handleEndSessionWithPayload = () => {
    const sessionPayload = generateSessionPayload();
    
    console.log('Session Payload for Backend:', JSON.stringify(sessionPayload, null, 2));
    
    // Pass the payload to the parent component
    onEndSession(sessionPayload);
  };

  // Add session notes functionality
  const handleAddNotes = () => {
    const notes = prompt('Add notes about this session:', currentSession.notes || '');
    if (notes !== null) {
      const updatedSession = {
        ...currentSession,
        notes: notes
      };
      setCurrentSession(updatedSession);
    }
  };

  const formatSessionTime = (startTime) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now - start;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Calculate total sets across all workouts
  const getTotalSets = () => {
    return currentSession.workouts.reduce((total, workout) => total + workout.sets.length, 0);
  };

  // Calculate total reps across all workouts
  const getTotalReps = () => {
    return currentSession.workouts.reduce((total, workout) =>
      total + workout.sets.reduce((setTotal, set) => setTotal + set.reps.count, 0), 0
    );
  };

  return (
    <div className={`session-container theme-${currentTheme}`}>
      {/* Header */}
      <div className="session-header">
        <button 
          className="theme-toggle" 
          onClick={() => setShowThemeWheel(!showThemeWheel)}
        >
          <Palette className="palette-icon" />
          <span>Themes</span>
        </button>

        <div className="user-controls">
          <div className="user-info">
            <User className="user-icon" />
            <span>{user.username}</span>
          </div>
          <button onClick={onLogout} className="logout-button">
            <LogOut className="logout-icon" />
          </button>
        </div>
      </div>

      {/* Theme Wheel */}
      {showThemeWheel && (
        <div className="theme-wheel-overlay" onClick={() => setShowThemeWheel(false)}>
          <div className="theme-wheel" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-wheel"
              onClick={() => setShowThemeWheel(false)}
            >
              <X className="close-icon" />
            </button>
            
            <h3 className="wheel-title">Choose Your Vibe</h3>
            
            <div className="theme-options">
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  className={`theme-option ${currentTheme === key ? 'active' : ''}`}
                  onClick={() => handleThemeSelect(key)}
                  style={{ background: theme.background }}
                >
                  <div className="theme-preview">
                    <div className="preview-colors">
                      {theme.colors.map((color, index) => (
                        <div 
                          key={index}
                          className="color-dot" 
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="theme-name">{theme.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Workout Modal */}
      <WorkoutModal 
        isOpen={showWorkoutModal}
        onClose={() => setShowWorkoutModal(false)}
        onSave={handleSaveWorkout}
        currentTheme={currentTheme}
      />

      {/* Main Content */}
      <div className="session-content">
        <div className="session-info">
          <div className="session-title">
            <div className="energy-ring">
              <Zap className="energy-icon" />
            </div>
            <h1>SESSION IN PROGRESS</h1>
          </div>
          
          <div className="session-stats">
            <div className="stat-card">
              <Clock className="stat-icon" />
              <div className="stat-content">
                <span className="stat-label">Duration</span>
                <span className="stat-value">{formatSessionTime(currentSession.started_at)}</span>
              </div>
            </div>
            
            <div className="stat-card">
              <Target className="stat-icon" />
              <div className="stat-content">
                <span className="stat-label">Workouts</span>
                <span className="stat-value">{currentSession.workouts.length}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💪</div>
              <div className="stat-content">
                <span className="stat-label">Total Sets</span>
                <span className="stat-value">{getTotalSets()}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🔥</div>
              <div className="stat-content">
                <span className="stat-label">Total Reps</span>
                <span className="stat-value">{getTotalReps()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-section">
          <button className="add-workout-button" onClick={handleAddWorkout}>
            <Plus className="plus-icon" />
            <span>Add Workout to Session</span>
          </button>
          
          <div className="secondary-actions">
            <button className="notes-button" onClick={handleAddNotes}>
              📝 {currentSession.notes ? 'Edit Notes' : 'Add Notes'}
            </button>
            
            <button className="preview-payload-button" onClick={() => {
              const payload = generateSessionPayload();
              console.log('Current Session Payload:', JSON.stringify(payload, null, 2));
              alert('Session payload logged to console - check developer tools!');
            }}>
              🔍 Preview Payload
            </button>
          </div>
          
          <p className="action-hint">Track your exercises and sets</p>
        </div>

        {/* Session Notes Display */}
        {currentSession.notes && (
          <div className="session-notes">
            <h4>Session Notes:</h4>
            <p>"{currentSession.notes}"</p>
          </div>
        )}

        {/* Session Controls */}
        <div className="session-controls">
          <button className="end-session-button" onClick={handleEndSessionWithPayload}>
            🏁 End Session & Save
          </button>
        </div>

        {/* Workout List (if any) */}
        {currentSession.workouts.length > 0 && (
          <div className="workouts-list">
            <h3 className="workouts-title">Today's Workouts</h3>
            {currentSession.workouts.map((workout, index) => (
              <div key={workout.id || index} className="workout-item">
                <div className="workout-header">
                  <h4>{workout.name}</h4>
                  <div className="workout-meta">
                    <span className="workout-sets">{workout.sets.length} sets</span>
                    <span className="workout-time">
                      {new Date(workout.started_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
                <div className="workout-details">
                  {workout.sets.map((set, setIndex) => (
                    <span key={setIndex} className="set-summary">
                      {set.reps.count} reps
                      {set.reps.weight && ` @ ${set.reps.weight}lbs`}
                      <span className={`intensity-dot ${set.reps.intensity}`}></span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Debug Panel (Remove in production) */}
        <div className="debug-panel">
          <details>
            <summary>🔧 Debug Info (Click to expand)</summary>
            <pre>{JSON.stringify(currentSession, null, 2)}</pre>
          </details>
        </div>
      </div>

      <style jsx>{`
        .session-container {
          min-height: 100vh;
          background-size: 400% 400%;
          animation: gradient-shift 8s ease infinite;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
          position: relative;
          overflow-x: hidden;
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .theme-energy { background: ${themes.energy.background}; }
        .theme-bloom { background: ${themes.bloom.background}; }
        .theme-ocean { background: ${themes.ocean.background}; }
        .theme-forest { background: ${themes.forest.background}; }
        .theme-sunset { background: ${themes.sunset.background}; }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .session-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          position: relative;
          z-index: 5;
        }

        .theme-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .theme-toggle:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .palette-icon {
          width: 18px;
          height: 18px;
        }

        .user-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          font-weight: 600;
        }

        .user-icon {
          width: 18px;
          height: 18px;
        }

        .logout-button {
          padding: 12px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .logout-button:hover {
          background: rgba(255, 59, 48, 0.2);
          border-color: rgba(255, 59, 48, 0.3);
        }

        .logout-icon {
          width: 18px;
          height: 18px;
        }

        .theme-wheel-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .theme-wheel {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          position: relative;
          animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          max-width: 90vw;
        }

        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .close-wheel {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(0, 0, 0, 0.1);
          border: none;
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .close-wheel:hover {
          background: rgba(0, 0, 0, 0.2);
        }

        .close-icon {
          width: 20px;
          height: 20px;
          color: #666;
        }

        .wheel-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .theme-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
          max-width: 500px;
        }

        .theme-option {
          border: 3px solid transparent;
          border-radius: 16px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
          position: relative;
          overflow: hidden;
        }

        .theme-option:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .theme-option.active {
          border-color: rgba(255, 255, 255, 0.8);
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
        }

        .theme-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .preview-colors {
          display: flex;
          gap: 4px;
        }

        .color-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.8);
        }

        .theme-name {
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .session-content {
          padding: 0 2rem 2rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .session-info {
          text-align: center;
          margin-bottom: 3rem;
        }

        .session-title {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2rem;
        }

        .energy-ring {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100px;
          height: 100px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          box-shadow: 
            0 0 30px rgba(255, 255, 255, 0.2),
            inset 0 0 30px rgba(255, 255, 255, 0.1);
          animation: energy-pulse 2s ease-in-out infinite;
          margin-bottom: 1.5rem;
        }

        @keyframes energy-pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 
              0 0 30px rgba(255, 255, 255, 0.2),
              inset 0 0 30px rgba(255, 255, 255, 0.1);
          }
          50% { 
            transform: scale(1.05);
            box-shadow: 
              0 0 50px rgba(255, 255, 255, 0.4),
              inset 0 0 40px rgba(255, 255, 255, 0.2);
          }
        }

        .energy-icon {
          width: 40px;
          height: 40px;
          color: #ffffff;
          filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.6));
        }

        .session-title h1 {
          font-size: 2.5rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          text-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.2),
            0 0 20px rgba(255, 255, 255, 0.3);
          letter-spacing: -0.02em;
        }

        .session-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          width: 24px;
          height: 24px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 24px;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
        }

        .action-section {
          text-align: center;
          margin-bottom: 3rem;
        }

        .add-workout-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          max-width: 400px;
          height: 80px;
          margin: 0 auto 1rem;
          background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
          border: none;
          border-radius: 16px;
          color: #333;
          font-size: 1.2rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 
            0 10px 30px rgba(0, 0, 0, 0.2),
            0 4px 8px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          position: relative;
          overflow: hidden;
        }

        .add-workout-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          transition: left 0.6s;
        }

        .add-workout-button:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 
            0 15px 40px rgba(0, 0, 0, 0.25),
            0 8px 16px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          background: linear-gradient(135deg, #fff 0%, #fff 100%);
        }

        .add-workout-button:hover::before {
          left: 100%;
        }

        .plus-icon {
          width: 26px;
          height: 26px;
        }

        .secondary-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin: 1rem 0;
          flex-wrap: wrap;
        }

        .notes-button, .preview-payload-button {
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
          font-size: 0.9rem;
        }

        .notes-button:hover, .preview-payload-button:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-1px);
        }

        .action-hint {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.95rem;
          font-weight: 400;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          margin-top: 1rem;
        }

        .session-notes {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 2rem;
          text-align: center;
        }

        .session-notes h4 {
          color: white;
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
        }

        .session-notes p {
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          font-style: italic;
        }

        .session-controls {
          text-align: center;
          margin-bottom: 2rem;
        }

        .end-session-button {
          padding: 16px 40px;
          background: rgba(46, 204, 113, 0.15);
          border: 2px solid rgba(46, 204, 113, 0.3);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .end-session-button:hover {
          background: rgba(46, 204, 113, 0.25);
          border-color: rgba(46, 204, 113, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(46, 204, 113, 0.2);
        }

        .workouts-list {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
          margin-top: 2rem;
        }

        .workouts-title {
          color: white;
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .workout-item {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .workout-item:last-child {
          margin-bottom: 0;
        }

        .workout-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .workout-item h4 {
          color: white;
          margin: 0;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .workout-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
        }

        .workout-sets, .workout-time {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .workout-details {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .set-summary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.85rem;
          font-weight: 500;
        }

        .intensity-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .intensity-dot.low {
          background-color: #2ecc71;
        }

        .intensity-dot.medium {
          background-color: #f39c12;
        }

        .intensity-dot.high {
          background-color: #e74c3c;
        }

        .debug-panel {
          margin-top: 2rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          overflow: hidden;
        }

        .debug-panel details {
          padding: 1rem;
        }

        .debug-panel summary {
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          font-weight: 600;
          padding-bottom: 0.5rem;
        }

        .debug-panel pre {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
          padding: 1rem;
          color: #fff;
          font-size: 0.8rem;
          overflow: auto;
          max-height: 300px;
          white-space: pre-wrap;
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .session-header {
            padding: 1rem;
          }

          .user-controls {
            gap: 0.5rem;
          }

          .user-info span {
            display: none;
          }

          .session-content {
            padding: 0 1rem 1rem;
          }

          .session-title h1 {
            font-size: 2rem;
          }

          .energy-ring {
            width: 80px;
            height: 80px;
            margin-bottom: 1rem;
          }

          .energy-icon {
            width: 32px;
            height: 32px;
          }

          .session-stats {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }

          .add-workout-button {
            height: 70px;
            font-size: 1.1rem;
          }

          .secondary-actions {
            flex-direction: column;
            gap: 0.5rem;
          }

          .workout-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .workout-meta {
            align-items: flex-start;
          }
        }

        @media (max-width: 480px) {
          .session-title h1 {
            font-size: 1.8rem;
          }

          .add-workout-button {
            height: 65px;
            font-size: 1rem;
          }

          .session-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default SessionDashboard;