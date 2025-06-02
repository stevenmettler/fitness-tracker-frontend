import React, { useState } from 'react';
import { Plus, Zap, Palette, X, LogOut, User } from 'lucide-react';

const NewSession = ({ onStartSession, currentTheme = 'energy', onThemeChange, onLogout, user }) => {
  const [isStarting, setIsStarting] = useState(false);
  const [showThemeWheel, setShowThemeWheel] = useState(false);

  const themes = {
    energy: {
      name: 'Energy',
      colors: ['#ff6b35', '#f7931e', '#ff4757'],
      background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 30%, #ff4757 70%, #ff3838 100%)',
      subtitle: 'Push your limits today',
      hint: 'Your strength journey starts here'
    },
    bloom: {
      name: 'Bloom',
      colors: ['#ff9a9e', '#fecfef', '#fad0c4'],
      background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 30%, #fecfef 70%, #fad0c4 100%)',
      subtitle: 'Bloom into your best self',
      hint: 'Embrace your power today'
    },
    ocean: {
      name: 'Ocean',
      colors: ['#667eea', '#764ba2', '#4facfe'],
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 30%, #4facfe 70%, #00f2fe 100%)',
      subtitle: 'Dive deep into strength',
      hint: 'Make waves with every rep'
    },
    forest: {
      name: 'Forest',
      colors: ['#56ab2f', '#a8e6cf', '#88d8a3'],
      background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 30%, #88d8a3 70%, #4fd1c7 100%)',
      subtitle: 'Grow stronger naturally',
      hint: 'Root yourself in power'
    },
    sunset: {
      name: 'Sunset',
      colors: ['#fa709a', '#fee140', '#ffa726'],
      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 30%, #ffa726 70%, #ff7043 100%)',
      subtitle: 'End the day strong',
      hint: 'Golden hour gains await'
    }
  };

  const currentThemeData = themes[currentTheme];

const handleStartSession = () => {
  setIsStarting(true);
  
  const newSession = {
    started_at: new Date().toISOString(),
    // user_id: null, ← REMOVE THIS LINE
    notes: '',
    workouts: []
  };
  
  setTimeout(() => {
    setIsStarting(false);
    onStartSession(newSession);
  }, 500);
};

  const handleThemeSelect = (themeKey) => {
    onThemeChange(themeKey);
    setShowThemeWheel(false);
  };

  return (
    <div className={`new-session-container theme-${currentTheme}`}>
      {/* Header with theme toggle and logout */}
      <div className="new-session-header">
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
            <span className="username-text">{user?.username}</span>
          </div>
          
          <button onClick={onLogout} className="logout-button">
            <LogOut className="logout-icon" />
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </div>

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

      <div className="content-wrapper">
        <div className="icon-wrapper">
          <div className="energy-ring">
            <Zap className="energy-icon" />
          </div>
        </div>
        
        <h1 className="title">READY TO LIFT?</h1>
        <p className="subtitle">{currentThemeData.subtitle}</p>
        
        <button 
          className={`start-button ${isStarting ? 'loading' : ''}`}
          onClick={handleStartSession}
          disabled={isStarting}
        >
          {isStarting ? (
            <div className="loading-content">
              <div className="spinner"></div>
              <span>Let's Go!</span>
            </div>
          ) : (
            <div className="button-content">
              <Plus className="plus-icon" />
              <span>Start New Session</span>
            </div>
          )}
        </button>
        
        <p className="hint">{currentThemeData.hint}</p>
      </div>

      <style jsx>{`
        .new-session-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background-size: 400% 400%;
          animation: gradient-shift 8s ease infinite;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
          position: relative;
          overflow: hidden;
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

        .new-session-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10;
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

        .username-text {
          color: white;
        }

        .logout-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(255, 59, 48, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 59, 48, 0.3);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .logout-button:hover {
          background: rgba(255, 59, 48, 0.25);
          border-color: rgba(255, 59, 48, 0.5);
          transform: translateY(-1px);
        }

        .logout-icon {
          width: 18px;
          height: 18px;
        }

        .logout-text {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
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

        .new-session-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
          pointer-events: none;
        }

        .content-wrapper {
          text-align: center;
          max-width: 400px;
          width: 100%;
          position: relative;
          z-index: 1;
        }

        .icon-wrapper {
          margin-bottom: 2.5rem;
          position: relative;
        }

        .energy-ring {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 120px;
          height: 120px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          box-shadow: 
            0 0 30px rgba(255, 255, 255, 0.2),
            inset 0 0 30px rgba(255, 255, 255, 0.1);
          animation: energy-pulse 2s ease-in-out infinite;
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
          width: 52px;
          height: 52px;
          color: #ffffff;
          filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.6));
        }

        .title {
          font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          font-size: 2.8rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 0.8rem;
          line-height: 1.1;
          text-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.2),
            0 0 20px rgba(255, 255, 255, 0.3);
          letter-spacing: -0.02em;
        }

        .subtitle {
          font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 3rem;
          font-weight: 500;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .start-button {
          width: 100%;
          max-width: 320px;
          height: 80px;
          background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
          border: none;
          border-radius: 16px;
          color: #333;
          font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem;
          box-shadow: 
            0 10px 30px rgba(0, 0, 0, 0.2),
            0 4px 8px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          position: relative;
          overflow: hidden;
        }

        .start-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          transition: left 0.6s;
        }

        .start-button:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 
            0 15px 40px rgba(0, 0, 0, 0.25),
            0 8px 16px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          background: linear-gradient(135deg, #fff 0%, #fff 100%);
        }

        .start-button:hover:not(:disabled)::before {
          left: 100%;
        }

        .start-button:active:not(:disabled) {
          transform: translateY(-1px) scale(1.01);
        }

        .start-button:disabled {
          cursor: not-allowed;
          opacity: 0.8;
        }

        .start-button.loading {
          background: linear-gradient(135deg, #f1f2f6 0%, #ddd 100%);
          color: #666;
        }

        .button-content {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 1;
        }

        .plus-icon {
          width: 26px;
          height: 26px;
        }

        .loading-content {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 1;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 2px solid rgba(51, 51, 51, 0.3);
          border-top: 2px solid #333;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .hint {
          color: rgba(255, 255, 255, 0.8);
          font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          font-size: 0.95rem;
          font-weight: 400;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .new-session-container {
            padding: 1rem;
          }

          .new-session-header {
            padding: 1rem;
          }

          .user-controls {
            gap: 0.5rem;
          }

          .username-text,
          .logout-text {
            display: none;
          }
          
          .user-info,
          .logout-button {
            padding: 10px 12px;
          }

          .palette-icon {
            width: 16px;
            height: 16px;
          }

          .theme-wheel {
            padding: 1.5rem;
            margin: 1rem;
          }

          .wheel-title {
            font-size: 1.3rem;
          }

          .theme-options {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 0.8rem;
          }

          .theme-option {
            padding: 0.8rem;
          }

          .title {
            font-size: 2.2rem;
          }

          .subtitle {
            font-size: 1rem;
            margin-bottom: 2.5rem;
          }

          .start-button {
            height: 72px;
            font-size: 1.1rem;
            max-width: 280px;
          }

          .energy-ring {
            width: 100px;
            height: 100px;
          }

          .energy-icon {
            width: 44px;
            height: 44px;
          }

          .plus-icon {
            width: 22px;
            height: 22px;
          }
        }

        /* Touch targets for mobile */
        @media (hover: none) {
          .start-button:hover:not(:disabled) {
            transform: none;
            background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
          }

          .start-button:active:not(:disabled) {
            background: linear-gradient(135deg, #f1f2f6 0%, #e9ecef 100%);
            transform: scale(0.98);
          }

          .theme-toggle:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: none;
          }

          .theme-option:hover {
            transform: none;
          }
        }

        /* Very small screens */
        @media (max-width: 480px) {
          .title {
            font-size: 2rem;
          }

          .subtitle {
            font-size: 0.95rem;
          }

          .start-button {
            height: 68px;
            font-size: 1rem;
            max-width: 260px;
          }

          .energy-ring {
            width: 90px;
            height: 90px;
          }

          .energy-icon {
            width: 40px;
            height: 40px;
          }

          .user-controls {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-end;
          }
          
          .username-text,
          .logout-text {
            display: inline;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default NewSession;