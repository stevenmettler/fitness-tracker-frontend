import React, { useState } from 'react';
import { X, Plus, Trash2, Save, Dumbbell } from 'lucide-react';

const WorkoutModal = ({ isOpen, onClose, onSave, currentTheme = 'energy' }) => {
  const [workoutName, setWorkoutName] = useState('');
  const [sets, setSets] = useState([
    { reps: '', weight: '', intensity: 'medium' }
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const themes = {
    energy: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 30%, #ff4757 70%, #ff3838 100%)',
    bloom: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 30%, #fecfef 70%, #fad0c4 100%)',
    ocean: 'linear-gradient(135deg, #667eea 0%, #764ba2 30%, #4facfe 70%, #00f2fe 100%)',
    forest: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 30%, #88d8a3 70%, #4fd1c7 100%)',
    sunset: 'linear-gradient(135deg, #fa709a 0%, #fee140 30%, #ffa726 70%, #ff7043 100%)'
  };

  const addSet = () => {
    setSets([...sets, { reps: '', weight: '', intensity: 'medium' }]);
  };

  const removeSet = (index) => {
    if (sets.length > 1) {
      setSets(sets.filter((_, i) => i !== index));
    }
  };

  const updateSet = (index, field, value) => {
    const newSets = [...sets];
    newSets[index][field] = value;
    setSets(newSets);
  };

  const handleSave = async () => {
    if (!workoutName.trim()) {
      alert('Please enter a workout name');
      return;
    }

    if (sets.some(set => !set.reps)) {
      alert('Please fill in reps for all sets');
      return;
    }

    setIsSaving(true);

    const workout = {
      name: workoutName.trim(),
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      sets: sets.map(set => ({
        started_at: new Date().toISOString(),
        finished_at: new Date().toISOString(),
        reps: {
          count: parseInt(set.reps),
          weight: set.weight ? parseInt(set.weight) : null,
          intensity: set.intensity
        }
      }))
    };

    // Simulate API call
    setTimeout(() => {
      onSave(workout);
      handleClose();
      setIsSaving(false);
    }, 500);
  };

  const handleClose = () => {
    setWorkoutName('');
    setSets([{ reps: '', weight: '', intensity: 'medium' }]);
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
            <h2>Add Workout</h2>
          </div>
          <button className="close-button" onClick={handleClose}>
            <X className="close-icon" />
          </button>
        </div>

        <div className="modal-body">
          {/* Workout Name */}
          <div className="workout-name-section">
            <input
              type="text"
              placeholder="Exercise name (e.g., Bench Press)"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="workout-name-input"
              autoFocus
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
                <div key={index} className="set-row">
                  <div className="set-number">
                    {index + 1}
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
            {isSaving ? 'Saving...' : 'Save Workout'}
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
            max-width: 500px;
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
            padding: 16px;
            font-size: 1.1rem;
            font-weight: 600;
            border: 2px solid rgba(0, 0, 0, 0.1);
            border-radius: 12px;
            background: rgba(0, 0, 0, 0.02);
            transition: all 0.2s ease;
            color: #333;
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
            border: 1px solid rgba(0, 0, 0, 0.08);
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
            padding: 10px 8px;
            border: 1px solid rgba(0, 0, 0, 0.15);
            border-radius: 8px;
            font-size: 0.95rem;
            font-weight: 600;
            text-align: center;
            background: white;
            transition: all 0.2s ease;
            color: #333;
          }

          .set-input:focus {
            outline: none;
            border-color: rgba(0, 0, 0, 0.3);
            box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
          }

          .reps-input {
            color: #e74c3c;
          }

          .weight-input {
            color: #3498db;
          }

          .intensity-select {
            color: #f39c12;
            cursor: pointer;
          }

          .set-input::placeholder {
            color: #bbb;
            font-weight: 500;
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
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
          }

          .save-button.saving {
            background: rgba(0, 0, 0, 0.3);
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

            .modal-header {
              padding: 1rem 1.5rem;
            }

            .modal-body {
              padding: 1rem 1.5rem;
            }

            .modal-footer {
              padding: 1rem 1.5rem;
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

          @media (max-width: 480px) {
            .modal-content {
              max-width: 100%;
              margin: 0.5rem;
            }

            .set-row {
              padding: 10px;
              gap: 8px;
            }

            .set-number {
              width: 28px;
              height: 28px;
              font-size: 0.8rem;
            }

            .modal-footer {
              flex-direction: column;
              gap: 8px;
            }

            .cancel-button, .save-button {
              padding: 12px;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default WorkoutModal;