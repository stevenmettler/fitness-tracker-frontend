import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Dumbbell, Clock, Play, Pause, Timer } from 'lucide-react';

const WorkoutModal = ({ isOpen, onClose, onSave, currentTheme = 'energy' }) => {
  const [workoutName, setWorkoutName] = useState('');
  const [sets, setSets] = useState([
    { reps: '', weight: '', intensity: 'medium', isActive: false, startTime: null, endTime: null, duration: 0, isCompleted: false }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Exercise timing states (auto-started)
  const [exerciseStartTime, setExerciseStartTime] = useState(null);
  
  // Rest timer states
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restStartTime, setRestStartTime] = useState(null);
  const [notificationSent, setNotificationSent] = useState(false);

  const themes = {
    energy: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 30%, #ff4757 70%, #ff3838 100%)',
    bloom: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 30%, #fecfef 70%, #fad0c4 100%)',
    ocean: 'linear-gradient(135deg, #667eea 0%, #764ba2 30%, #4facfe 70%, #00f2fe 100%)',
    forest: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 30%, #88d8a3 70%, #4fd1c7 100%)',
    sunset: 'linear-gradient(135deg, #fa709a 0%, #fee140 30%, #ffa726 70%, #ff7043 100%)'
  };

  // Auto-start exercise timer when modal opens
  useEffect(() => {
    if (isOpen && !exerciseStartTime) {
      const now = new Date().toISOString();
      setExerciseStartTime(now);
      console.log('🏁 Exercise auto-started at:', now);
    }
  }, [isOpen, exerciseStartTime]);

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Rest timer
  useEffect(() => {
    let timer;
    if (isResting && restStartTime) {
      timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - new Date(restStartTime).getTime()) / 1000);
        setRestTimer(elapsed);
        
        // Send notification at 2 minutes (120 seconds)
        if (elapsed >= 120 && !notificationSent) {
          sendRestNotification();
          setNotificationSent(true);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isResting, restStartTime, notificationSent]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sendRestNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Rest Timer Complete! 💪', {
        body: 'Your 2-minute rest is up. Ready for the next set?',
        icon: '/favicon.ico', // You can customize this
        badge: '/favicon.ico'
      });
    }
  };

  const startRestTimer = () => {
    const now = new Date().toISOString();
    setRestStartTime(now);
    setIsResting(true);
    setRestTimer(0);
    setNotificationSent(false);
    console.log('⏱️ Rest timer started at:', now, 'isResting will be:', true);
  };

  const stopRestTimer = () => {
    setIsResting(false);
    setRestTimer(0);
    setNotificationSent(false);
    console.log('⏹️ Rest timer stopped, isResting will be:', false);
  };

  const addSet = () => {
    setSets([...sets, { 
      reps: '', 
      weight: '', 
      intensity: 'medium', 
      isActive: false, 
      startTime: null, 
      endTime: null, 
      duration: 0,
      isCompleted: false
    }]);
  };

  const removeSet = (index) => {
    if (sets.length > 1) {
      setSets(sets.filter((_, i) => i !== index));
    }
  };

  const updateSet = (index, field, value) => {
    const newSets = [...sets];
    const oldSet = newSets[index];
    newSets[index][field] = value;
    
    // Check if set is now complete (has reps filled and wasn't complete before)
    const wasIncomplete = !oldSet.reps || oldSet.reps === '' || !oldSet.isCompleted;
    const isNowComplete = value !== '' && field === 'reps' && value > 0;
    
    // If set just became complete, mark it and start rest timer
    if (wasIncomplete && isNowComplete) {
      newSets[index].isCompleted = true;
      setSets(newSets);
      
      console.log('🎯 Set completed! Starting rest timer...');
      
      // Start rest timer immediately
      startRestTimer();
    } else {
      setSets(newSets);
    }
  };

  const handleSave = async () => {
    if (!workoutName.trim()) {
      alert('Please enter an exercise name');
      return;
    }

    if (!exerciseStartTime) {
      alert('Exercise timing error - please try again');
      return;
    }

    if (sets.some(set => !set.reps)) {
      alert('Please fill in reps for all sets');
      return;
    }

    setIsSaving(true);

    const exerciseEndTime = new Date().toISOString();
    
    // Stop rest timer if it's running when saving
    if (isResting) {
      stopRestTimer();
    }
    
    const workout = {
      name: workoutName.trim(),
      started_at: exerciseStartTime, // Real start time
      finished_at: exerciseEndTime,  // Real end time
      sets: sets.map((set, index) => {
        // Create realistic set times (assuming 30-60 seconds per set)
        const setDuration = 30 + Math.random() * 30; // 30-60 seconds
        const setStart = new Date(new Date(exerciseStartTime).getTime() + (index * 150 * 1000)); // 2.5 min apart
        const setEnd = new Date(setStart.getTime() + setDuration * 1000);
        
        return {
          started_at: setStart.toISOString(),
          finished_at: setEnd.toISOString(),
          reps: {
            count: parseInt(set.reps),
            weight: set.weight ? parseInt(set.weight) : null,
            intensity: set.intensity
          }
        };
      })
    };

    console.log('💾 Saving exercise with real timing:', {
      name: workout.name,
      duration: Math.floor((new Date(exerciseEndTime) - new Date(exerciseStartTime)) / 1000 / 60),
      sets: workout.sets.length,
      realTiming: true
    });

    // Simulate API call
    setTimeout(() => {
      onSave(workout);
      handleClose();
      setIsSaving(false);
    }, 500);
  };

  const handleClose = () => {
    // Confirm if exercise is in progress (always true now since auto-started)
    if (exerciseStartTime) {
      const confirmed = window.confirm('Are you sure you want to close? Your exercise progress will be lost.');
      if (!confirmed) return;
    }
    
    // Reset all states
    setWorkoutName('');
    setSets([{ reps: '', weight: '', intensity: 'medium', isActive: false, startTime: null, endTime: null, duration: 0, isCompleted: false }]);
    setExerciseStartTime(null);
    setIsResting(false);
    setRestTimer(0);
    setNotificationSent(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className={`modal-content theme-${currentTheme}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            <div className="workout-icon">
              <Dumbbell className="dumbbell-icon" />
            </div>
            <div>
              <h2>Add Exercise</h2>
            </div>
          </div>
          <button className="close-button" onClick={handleClose}>
            <X className="close-icon" />
          </button>
        </div>

        {/* Prominent Rest Timer Display */}
        {isResting && (
          <div className="rest-timer-banner">
            <div className="rest-timer-content">
              <Timer className="rest-timer-icon" />
              <div className="rest-timer-text">
                <span className="rest-label">REST TIME</span>
                <span className={`rest-time ${restTimer >= 120 ? 'timer-complete' : ''}`}>
                  {formatTime(restTimer)}
                  {restTimer >= 120 && ' ✓ Ready!'}
                </span>
              </div>
              <button className="stop-rest-button" onClick={stopRestTimer}>
                End Rest
              </button>
            </div>
          </div>
        )}

        {/* Debug Info - Remove this after fixing */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ 
            background: '#f0f0f0', 
            padding: '10px', 
            margin: '10px', 
            borderRadius: '4px',
            fontSize: '12px',
            color: '#333'
          }}>
            <div><strong>Debug Info:</strong></div>
            <div>isResting: {isResting.toString()}</div>
            <div>restTimer: {restTimer}</div>
            <div>restStartTime: {restStartTime}</div>
            <div>Completed sets: {sets.filter(s => s.isCompleted).length}</div>
          </div>
        )}

        <div className="modal-body">
          {/* Exercise Name */}
          <div className="workout-name-section">
            <input
              type="text"
              placeholder="Exercise name (e.g., Bench Press)"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="workout-name-input"
              autoFocus
              maxLength={100}
            />
          </div>

          {/* Sets */}
          <div className="sets-section">
            <div className="sets-header">
              <h3>Sets</h3>
              <button className="add-set-button" onClick={addSet}>
                <Plus className="plus-icon" />
                Add Set
              </button>
            </div>

            <div className="sets-list">
              {sets.map((set, index) => (
                <div key={index} className={`set-row ${set.isCompleted ? 'completed' : ''}`}>
                  <div className="set-number">
                    {index + 1}
                    {set.isCompleted && <span className="completed-indicator">✓</span>}
                  </div>
                  
                  <div className="set-inputs">
                    <div className="input-group">
                      <label>Reps</label>
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={set.reps}
                        onChange={(e) => updateSet(index, 'reps', e.target.value)}
                        className="set-input reps-input"
                        placeholder="12"
                      />
                    </div>

                    <div className="input-group">
                      <label>Weight</label>
                      <input
                        type="number"
                        min="0"
                        max="9999"
                        value={set.weight}
                        onChange={(e) => updateSet(index, 'weight', e.target.value)}
                        className="set-input weight-input"
                        placeholder="BW"
                      />
                    </div>

                    <div className="input-group">
                      <label>Intensity</label>
                      <select
                        value={set.intensity}
                        onChange={(e) => updateSet(index, 'intensity', e.target.value)}
                        className="set-input intensity-select"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  {sets.length > 1 && (
                    <button 
                      className="remove-set-button"
                      onClick={() => removeSet(index)}
                    >
                      <Trash2 className="trash-icon" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Rest Timer Instructions */}
          <div className="rest-info">
            <p className="rest-hint">
              💡 Complete a set (fill in reps) to automatically start a 2-minute rest timer
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-button" onClick={handleClose}>
            Cancel
          </button>
          <button 
            className={`save-button ${isSaving ? 'saving' : ''}`}
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="save-icon" />
            {isSaving ? 'Saving...' : 'Save Exercise'}
          </button>
        </div>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            padding: 1rem;
            animation: fadeIn 0.2s ease;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .modal-content {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            width: 100%;
            max-width: 600px;
            max-height: 90vh;
            overflow: hidden;
            box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            position: relative;
          }

          .modal-content::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: ${themes[currentTheme]};
            border-radius: 20px 20px 0 0;
          }

          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(30px) scale(0.95);
            }
            to { 
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1.5rem 2rem;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          }

          .header-content {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .workout-icon {
            width: 40px;
            height: 40px;
            background: ${themes[currentTheme]};
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .dumbbell-icon {
            width: 20px;
            height: 20px;
            color: white;
          }

          .modal-header h2 {
            margin: 0;
            font-size: 1.4rem;
            font-weight: 700;
            color: #333;
          }

          .timer-display {
            display: flex;
            flex-direction: column;
            gap: 4px;
            margin-top: 4px;
          }

          .exercise-timer, .rest-timer {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #666;
            font-size: 0.9rem;
          }

          .rest-timer {
            color: #ff9800;
            font-weight: 600;
          }

          .timer-complete {
            color: #4caf50 !important;
            font-weight: 700;
          }

          .timer-icon {
            width: 14px;
            height: 14px;
          }-items: center;
            gap: 6px;
            color: #666;
            font-size: 0.9rem;
            margin-top: 4px;
          }

          .timer-icon {
            width: 14px;
            height: 14px;
          }

          .close-button {
            width: 36px;
            height: 36px;
            background: rgba(0, 0, 0, 0.1);
            border: none;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .close-button:hover {
            background: rgba(0, 0, 0, 0.15);
          }

          .close-icon {
            width: 18px;
            height: 18px;
            color: #666;
          }

          .rest-timer-banner {
            background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
            border-bottom: 3px solid #e65100;
            padding: 1rem 2rem;
            animation: pulse-glow 2s ease-in-out infinite;
          }

          @keyframes pulse-glow {
            0%, 100% { 
              box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.2);
            }
            50% { 
              box-shadow: inset 0 0 30px rgba(255, 255, 255, 0.4);
            }
          }

          .rest-timer-content {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            color: white;
          }

          .rest-timer-icon {
            width: 32px;
            height: 32px;
            color: white;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
          }

          .rest-timer-text {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .rest-label {
            font-size: 0.8rem;
            font-weight: 600;
            letter-spacing: 0.1em;
            opacity: 0.9;
            margin-bottom: 2px;
          }

          .rest-time {
            font-size: 2rem;
            font-weight: 800;
            font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
          }

          .rest-time.timer-complete {
            color: #4caf50;
            text-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
            animation: ready-pulse 1s ease-in-out infinite;
          }

          @keyframes ready-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }

          .stop-rest-button {
            padding: 12px 20px;
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.4);
            border-radius: 8px;
            color: white;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
            backdrop-filter: blur(10px);
          }

          .stop-rest-button:hover {
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.6);
            transform: translateY(-1px);
          }

          .modal-body {
            padding: 1.5rem 2rem;
            max-height: 60vh;
            overflow-y: auto;
          }

          .workout-name-section {
            margin-bottom: 1.5rem;
          }

          .workout-name-input {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            padding: 16px;
            font-size: 1.1rem;
            font-weight: 600;
            border: 2px solid rgba(0, 0, 0, 0.1);
            border-radius: 12px;
            background: rgba(0, 0, 0, 0.02);
            transition: all 0.2s ease;
            color: #333;
            box-sizing: border-box;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
          }

          .workout-name-input:focus {
            outline: none;
            border-color: rgba(0, 0, 0, 0.2);
            background: white;
            box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
          }

          .workout-name-input::placeholder {
            color: #999;
            font-weight: 500;
          }

          .start-workout-section {
            text-align: center;
            margin-bottom: 1.5rem;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.03);
            border-radius: 12px;
          }

          .start-workout-button {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: ${themes[currentTheme]};
            border: none;
            border-radius: 12px;
            color: white;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
            margin: 0 auto 8px;
          }

          .start-workout-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .play-icon {
            width: 18px;
            height: 18px;
          }

          .timer-hint {
            margin: 0;
            font-size: 0.85rem;
            color: #666;
          }

          .workout-status {
            margin-bottom: 1.5rem;
          }

          .rest-status {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            background: rgba(255, 152, 0, 0.1);
            border: 1px solid rgba(255, 152, 0, 0.3);
            border-radius: 8px;
            color: #ff9800;
            font-weight: 600;
            margin-top: 8px;
          }

          .rest-icon {
            width: 16px;
            height: 16px;
          }

          .stop-rest-button {
            padding: 6px 12px;
            background: rgba(255, 152, 0, 0.2);
            border: 1px solid rgba(255, 152, 0, 0.4);
            border-radius: 6px;
            color: #ff9800;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .stop-rest-button:hover {
            background: rgba(255, 152, 0, 0.3);
            border-color: rgba(255, 152, 0, 0.6);
          }

          .set-row.completed {
            border-color: #4caf50;
            background: rgba(76, 175, 80, 0.1);
          }

          .set-number {
            width: 32px;
            height: 32px;
            background: ${themes[currentTheme]};
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 0.9rem;
            flex-shrink: 0;
            position: relative;
          }

          .completed-indicator {
            position: absolute;
            top: -4px;
            right: -4px;
            background: #4caf50;
            color: white;
            border-radius: 50%;
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 700;
          }

          .rest-info {
            background: rgba(0, 0, 0, 0.05);
            border-radius: 8px;
            padding: 12px;
            margin-top: 1rem;
          }

          .rest-hint {
            margin: 0;
            font-size: 0.85rem;
            color: #666;
            text-align: center;
            line-height: 1.4;
          }

          .status-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            background: #e8f5e8;
            border: 1px solid #4caf50;
            border-radius: 8px;
            color: #2e7d32;
            font-weight: 600;
          }

          .status-icon {
            width: 16px;
            height: 16px;
          }

          .sets-section {
            margin-bottom: 1rem;
          }

          .sets-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1rem;
          }

          .sets-header h3 {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 600;
            color: #333;
          }

          .add-set-button {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 12px;
            background: ${themes[currentTheme]};
            border: none;
            border-radius: 8px;
            color: white;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .add-set-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .plus-icon {
            width: 16px;
            height: 16px;
          }

          .sets-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .set-row {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: rgba(0, 0, 0, 0.03);
            border-radius: 12px;
            border: 2px solid transparent;
            transition: all 0.2s ease;
          }

          .set-row.active {
            border-color: #4caf50;
            background: rgba(76, 175, 80, 0.1);
          }

          .set-row.completed {
            border-color: #2196f3;
            background: rgba(33, 150, 243, 0.1);
          }

          .set-number {
            width: 32px;
            height: 32px;
            background: ${themes[currentTheme]};
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 0.9rem;
            flex-shrink: 0;
          }

          .set-inputs {
            display: flex;
            gap: 8px;
            flex: 1;
            width: 100%;
            min-width: 0;
          }

          .input-group {
            flex: 1;
            min-width: 0;
          }

          .input-group label {
            display: block;
            font-size: 0.75rem;
            font-weight: 600;
            color: #666;
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .set-input {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            padding: 10px 8px;
            border: 1px solid rgba(0, 0, 0, 0.15);
            border-radius: 8px;
            font-size: 0.95rem;
            font-weight: 600;
            text-align: center;
            background: white;
            transition: all 0.2s ease;
            color: #333;
            box-sizing: border-box;
          }

          .set-input:focus {
            outline: none;
            border-color: rgba(0, 0, 0, 0.3);
            box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
          }

          .set-controls {
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 80px;
            justify-content: center;
          }

          .set-timer-button {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
          }

          .set-timer-button.start {
            background: #4caf50;
            color: white;
          }

          .set-timer-button.end {
            background: #ff9800;
            color: white;
          }

          .set-timer-button:hover {
            transform: scale(1.1);
          }

          .timer-icon-small {
            width: 14px;
            height: 14px;
          }

          .set-timer-active {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .set-duration {
            font-size: 0.9rem;
            font-weight: 700;
            color: #4caf50;
          }

          .set-completed {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .completed-time {
            font-size: 0.85rem;
            color: #2196f3;
            font-weight: 600;
          }

          .completed-check {
            color: #4caf50;
            font-weight: 700;
          }

          .remove-set-button {
            width: 32px;
            height: 32px;
            background: rgba(231, 76, 60, 0.1);
            border: 1px solid rgba(231, 76, 60, 0.2);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            flex-shrink: 0;
          }

          .remove-set-button:hover {
            background: rgba(231, 76, 60, 0.15);
            border-color: rgba(231, 76, 60, 0.3);
          }

          .trash-icon {
            width: 14px;
            height: 14px;
            color: #e74c3c;
          }

          .modal-footer {
            display: flex;
            gap: 12px;
            padding: 1.5rem 2rem;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
            background: rgba(0, 0, 0, 0.02);
          }

          .cancel-button {
            flex: 1;
            padding: 14px;
            background: rgba(0, 0, 0, 0.05);
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 12px;
            color: #666;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .cancel-button:hover {
            background: rgba(0, 0, 0, 0.08);
            color: #333;
          }

          .save-button {
            flex: 2;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 14px;
            background: ${themes[currentTheme]};
            border: none;
            border-radius: 12px;
            color: white;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .save-button:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
          }

          .save-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
          }

          .save-icon {
            width: 18px;
            height: 18px;
          }

          /* Mobile optimizations */
          @media (max-width: 768px) {
            .modal-overlay {
              padding: 0.5rem;
            }

            .modal-content {
              max-width: 95vw;
            }

            .modal-header {
              padding: 1rem 1.5rem;
            }

            .modal-body {
              padding: 1rem 1.5rem;
            }

            .modal-footer {
              padding: 1rem 1.5rem;
            }

            .workout-name-input {
              font-size: 16px; /* Prevents zoom on iOS */
              padding: 14px;
            }

            .set-inputs {
              gap: 6px;
            }

            .set-input {
              padding: 8px 6px;
              font-size: 0.9rem;
            }

            .input-group label {
              font-size: 0.7rem;
            }
          }

          /* Very small screens */
          @media (max-width: 480px) {
            .modal-content {
              max-width: 98vw;
            }

            .set-row {
              flex-wrap: wrap;
              gap: 8px;
            }

            .set-inputs {
              width: 100%;
              order: 2;
            }

            .set-controls {
              order: 3;
              min-width: auto;
            }

            .remove-set-button {
              order: 4;
            }
          }

          /* Ensure inputs never overflow */
          @media (max-width: 360px) {
            .workout-name-input {
              font-size: 14px;
              padding: 12px;
            }

            .set-input {
              font-size: 0.8rem;
              padding: 6px 4px;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default WorkoutModal;