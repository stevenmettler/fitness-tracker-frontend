import React, { useState } from 'react';
import { Palette, X, Eye, EyeOff, Zap, ArrowLeft } from 'lucide-react';

const LoginScreen = ({ onLogin, onRegister, currentTheme, onThemeChange }) => {
  const [showThemeWheel, setShowThemeWheel] = useState(false);
  const [currentView, setCurrentView] = useState('login'); // 'login', 'signup', 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [signupData, setSignupData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [error, setError] = useState('');

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

  const handleThemeSelect = (themeKey) => {
    onThemeChange(themeKey);
    setShowThemeWheel(false);
  };

const handleLogin = async () => {
  setLoading(true);
  setError('');
  
  if (!loginData.username || !loginData.password) {
    setError('Please fill in all fields');
    setLoading(false);
    return;
  }
  
  if (loginData.password.length < 8) {
    setError('Password must be at least 8 characters');
    setLoading(false);
    return;
  }
  
  try {
    // Call the parent's login function with real data
    const result = await onLogin({
      username: loginData.username,
      password: loginData.password
    });
    
    if (!result.success) {
      setError(result.error);
    }
  } catch (err) {
    console.error('Login error:', err);
    setError('An unexpected error occurred. Please try again.');
  }
  
  setLoading(false);
};

  const handleSignup = async () => {
    setLoading(true);
    setError('');
    
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    if (!signupData.username || !signupData.email || !signupData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }
    
    if (signupData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }
    
    // Call the parent's register function
    const result = await onRegister({
      username: signupData.username,
      email: signupData.email,
      password: signupData.password
    });
    
    if (result.success) {
      setCurrentView('login');
      setError('Account created successfully! Please log in.');
      // Clear signup form
      setSignupData({ username: '', email: '', password: '', confirmPassword: '' });
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    setError('');
    
    // Simulate API call (forgot password not implemented in backend yet)
    setTimeout(() => {
      if (forgotEmail) {
        setError('Password reset feature coming soon!');
        setTimeout(() => setCurrentView('login'), 2000);
      } else {
        setError('Please enter your email');
      }
      setLoading(false);
    }, 1000);
  };

  const renderLoginForm = () => (
    <div className="form-container">
      <div className="form-header">
        <div className="icon-wrapper">
          <div className="energy-ring">
            <Zap className="energy-icon" />
          </div>
        </div>
        <h1 className="form-title">Welcome Back</h1>
        <p className="form-subtitle">Ready to crush your goals?</p>
      </div>

      <div className="form-content">
        <div className="input-group">
          <input
            type="text"
            placeholder="Username"
            value={loginData.username}
            onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
            className="form-input"
            autoComplete="username"
            maxLength={50}
          />
        </div>

        <div className="input-group">
          <div className="password-input">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              className="form-input password-field"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            >
              {showPassword ? <EyeOff className="eye-icon" /> : <Eye className="eye-icon" />}
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`form-button ${loading ? 'loading' : ''}`}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

        <div className="form-links">
          <button onClick={() => setCurrentView('forgot')} className="text-link">
            Forgot Password?
          </button>
          <button onClick={() => setCurrentView('signup')} className="text-link">
            Create Account
          </button>
        </div>
      </div>
    </div>
  );

  const renderSignupForm = () => (
    <div className="form-container">
      <div className="form-header">
        <button onClick={() => setCurrentView('login')} className="back-button">
          <ArrowLeft className="back-icon" />
        </button>
        <div className="icon-wrapper">
          <div className="energy-ring">
            <Zap className="energy-icon" />
          </div>
        </div>
        <h1 className="form-title">Join the Journey</h1>
        <p className="form-subtitle">Start your fitness transformation</p>
      </div>

      <div className="form-content">
        <div className="input-group">
          <input
            type="text"
            placeholder="Username"
            value={signupData.username}
            onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
            className="form-input"
            autoComplete="username"
            maxLength={50}
          />
        </div>

        <div className="input-group">
          <input
            type="email"
            placeholder="Email"
            value={signupData.email}
            onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
            className="form-input"
            autoComplete="email"
            maxLength={100}
          />
        </div>

        <div className="input-group">
          <div className="password-input">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password (min 8 characters)"
              value={signupData.password}
              onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
              className="form-input password-field"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            >
              {showPassword ? <EyeOff className="eye-icon" /> : <Eye className="eye-icon" />}
            </button>
          </div>
        </div>

        <div className="input-group">
          <div className="password-input">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={signupData.confirmPassword}
              onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
              className="form-input password-field"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="password-toggle"
            >
              {showConfirmPassword ? <EyeOff className="eye-icon" /> : <Eye className="eye-icon" />}
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          onClick={handleSignup}
          disabled={loading}
          className={`form-button ${loading ? 'loading' : ''}`}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <div className="form-links">
          <button onClick={() => setCurrentView('login')} className="text-link">
            Already have an account? Sign In
          </button>
        </div>
      </div>
    </div>
  );

  const renderForgotForm = () => (
    <div className="form-container">
      <div className="form-header">
        <button onClick={() => setCurrentView('login')} className="back-button">
          <ArrowLeft className="back-icon" />
        </button>
        <div className="icon-wrapper">
          <div className="energy-ring">
            <Zap className="energy-icon" />
          </div>
        </div>
        <h1 className="form-title">Reset Password</h1>
        <p className="form-subtitle">Feature coming soon!</p>
      </div>

      <div className="form-content">
        <div className="input-group">
          <input
            type="email"
            placeholder="Enter your email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            className="form-input"
            autoComplete="email"
            maxLength={100}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          onClick={handleForgotPassword}
          disabled={loading}
          className={`form-button ${loading ? 'loading' : ''}`}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        <div className="form-links">
          <button onClick={() => setCurrentView('login')} className="text-link">
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`login-container theme-${currentTheme}`}>
      <button 
        className="theme-toggle" 
        onClick={() => setShowThemeWheel(!showThemeWheel)}
      >
        <Palette className="palette-icon" />
        <span>Themes</span>
      </button>

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

      {currentView === 'login' && renderLoginForm()}
      {currentView === 'signup' && renderSignupForm()}
      {currentView === 'forgot' && renderForgotForm()}

      <style jsx>{`
        .login-container {
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

        .theme-toggle {
          position: absolute;
          top: 2rem;
          right: 2rem;
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
          z-index: 10;
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

        .form-container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 24px;
          padding: 2.5rem;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          position: relative;
          animation: slideUp 0.4s ease;
        }

        .form-header {
          text-align: center;
          margin-bottom: 2rem;
          position: relative;
        }

        .back-button {
          position: absolute;
          top: 0;
          left: 0;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateX(-2px);
        }

        .back-icon {
          width: 20px;
          height: 20px;
        }

        .icon-wrapper {
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: center;
        }

        .energy-ring {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          box-shadow: 
            0 0 20px rgba(255, 255, 255, 0.2),
            inset 0 0 20px rgba(255, 255, 255, 0.1);
          animation: energy-pulse 2s ease-in-out infinite;
        }

        @keyframes energy-pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 
              0 0 20px rgba(255, 255, 255, 0.2),
              inset 0 0 20px rgba(255, 255, 255, 0.1);
          }
          50% { 
            transform: scale(1.05);
            box-shadow: 
              0 0 30px rgba(255, 255, 255, 0.4),
              inset 0 0 25px rgba(255, 255, 255, 0.2);
          }
        }

        .energy-icon {
          width: 32px;
          height: 32px;
          color: #ffffff;
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.6));
        }

        .form-title {
          font-size: 2rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .form-subtitle {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1rem;
          font-weight: 400;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .form-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .input-group {
          position: relative;
          width: 100%;
        }

        .form-input {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          box-sizing: border-box;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }

        .form-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .form-input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.4);
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
        }

        .password-input {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .password-field {
          padding-right: 50px;
        }

        .password-toggle {
          position: absolute;
          right: 16px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          padding: 4px;
          transition: all 0.2s ease;
          z-index: 2;
        }

        .password-toggle:hover {
          color: rgba(255, 255, 255, 0.8);
        }

        .eye-icon {
          width: 20px;
          height: 20px;
        }

        .form-button {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
          border: none;
          border-radius: 12px;
          color: #333;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        .form-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
          background: linear-gradient(135deg, #fff 0%, #fff 100%);
        }

        .form-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .form-links {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: center;
        }

        .text-link {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
          cursor: pointer;
          text-decoration: underline;
          transition: all 0.2s ease;
        }

        .text-link:hover {
          color: white;
        }

        .error-message {
          padding: 12px;
          background: rgba(255, 59, 48, 0.1);
          border: 1px solid rgba(255, 59, 48, 0.3);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
          text-align: center;
          backdrop-filter: blur(10px);
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .login-container {
            padding: 1rem;
          }

          .theme-toggle {
            top: 1rem;
            right: 1rem;
            padding: 10px 12px;
            font-size: 0.8rem;
          }

          .form-container {
            padding: 2rem;
            max-width: 90vw;
          }

          .form-title {
            font-size: 1.8rem;
          }

          .energy-ring {
            width: 70px;
            height: 70px;
          }

          .energy-icon {
            width: 28px;
            height: 28px;
          }

          .form-input {
            font-size: 16px; /* Prevents zoom on iOS */
            padding: 14px 18px;
          }

          .password-field {
            padding-right: 45px;
          }

          .password-toggle {
            right: 14px;
          }
        }

        @media (max-width: 480px) {
          .form-container {
            padding: 1.5rem;
            max-width: 95vw;
          }

          .form-title {
            font-size: 1.6rem;
          }

          .form-input {
            padding: 12px 16px;
          }

          .password-field {
            padding-right: 40px;
          }

          .password-toggle {
            right: 12px;
          }
        }

        /* Ensure input fields never overflow */
        @media (max-width: 360px) {
          .form-container {
            padding: 1rem;
            max-width: 98vw;
          }

          .form-input {
            font-size: 14px;
            padding: 10px 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;