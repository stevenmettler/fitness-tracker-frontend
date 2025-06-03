import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Target, TrendingUp, Filter, Search, ChevronDown, ChevronRight, Dumbbell, Trophy, Zap, ArrowLeft, User, LogOut, Palette, X, Download, FileText } from 'lucide-react';

const SessionHistory = ({ user, onBack, onLogout, currentTheme = 'energy', onThemeChange }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSession, setExpandedSession] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showThemeWheel, setShowThemeWheel] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

useEffect(() => {
  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching sessions from backend for user:', user.username);
      
      // API Configuration - Same as App.js
      const API_BASE = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8000' 
        : 'https://fitness-tracker-backend-production-1780.up.railway.app';

      // API Helper Function - Same as App.js
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/sessions/`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      
      if (response.ok) {
        const sessionsData = await response.json();
        console.log('✅ Sessions fetched successfully:', sessionsData);
        
        // Transform backend data to match frontend expectations
        const transformedSessions = sessionsData.map(session => ({
          id: session.id,
          started_at: session.started_at,
          finished_at: session.finished_at,
          notes: session.notes || '',
          workouts: session.workouts.map(workout => ({
            name: workout.name,
            started_at: workout.started_at,
            finished_at: workout.finished_at,
            sets: workout.sets.map(set => ({
              reps: {
                count: set.reps.count,
                weight: set.reps.weight,
                intensity: set.reps.intensity
              }
            }))
          }))
        }));
        
        setSessions(transformedSessions);
        console.log('📊 Transformed sessions:', transformedSessions);
        
      } else if (response.status === 404) {
        // No sessions found - this is okay, just show empty state
        console.log('📭 No sessions found for user');
        setSessions([]);
        
      } else if (response.status === 401 || response.status === 403) {
        // Authentication issue
        console.error('🔒 Authentication error:', response.status);
        setError('Authentication error. Please log in again.');
        
      } else {
        // Other error
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('❌ Error fetching sessions:', errorData);
        setError(errorData.detail || 'Failed to load sessions');
      }
      
    } catch (error) {
      console.error('❌ Network error fetching sessions:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Only fetch if user exists
  if (user && user.id) {
    fetchSessions();
  } else {
    console.error('❌ No user data available for fetching sessions');
    setError('User data not available');
    setLoading(false);
  }
}, [user]);

  // CSV Export Functions
  const escapeCSVValue = (value) => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const generateSessionSummaryCSV = (sessionsToExport) => {
    const headers = [
      'Session ID',
      'Date',
      'Start Time',
      'End Time',
      'Duration (minutes)',
      'Total Exercises',
      'Total Sets',
      'Total Reps',
      'Total Weight (lbs)',
      'Notes'
    ];

    const rows = sessionsToExport.map(session => {
      const sessionDate = new Date(session.started_at);
      const sessionEndDate = new Date(session.finished_at);
      const durationMs = sessionEndDate - sessionDate;
      const durationMinutes = Math.round(durationMs / (1000 * 60));
      
      const stats = calculateTotalStats(session);
      
      return [
        session.id,
        sessionDate.toLocaleDateString(),
        sessionDate.toLocaleTimeString(),
        sessionEndDate.toLocaleTimeString(),
        durationMinutes,
        session.workouts.length,
        stats.totalSets,
        stats.totalReps,
        stats.totalWeight,
        session.notes || ''
      ];
    });

    const csvContent = [
      headers.map(escapeCSVValue).join(','),
      ...rows.map(row => row.map(escapeCSVValue).join(','))
    ].join('\n');

    return csvContent;
  };

  const generateDetailedWorkoutCSV = (sessionsToExport) => {
    const headers = [
      'Session ID',
      'Session Date',
      'Session Duration (min)',
      'Exercise Name',
      'Exercise Order',
      'Set Number',
      'Reps',
      'Weight (lbs)',
      'Intensity',
      'Volume (reps × weight)',
      'Session Notes'
    ];

    const rows = [];
    
    sessionsToExport.forEach(session => {
      const sessionDate = new Date(session.started_at);
      const sessionEndDate = new Date(session.finished_at);
      const sessionDurationMinutes = Math.round((sessionEndDate - sessionDate) / (1000 * 60));
      
      session.workouts.forEach((workout, workoutIndex) => {
        workout.sets.forEach((set, setIndex) => {
          const volume = set.reps.weight ? set.reps.count * set.reps.weight : 0;
          
          rows.push([
            session.id,
            sessionDate.toLocaleDateString(),
            sessionDurationMinutes,
            workout.name,
            workoutIndex + 1,
            setIndex + 1,
            set.reps.count,
            set.reps.weight || '',
            set.reps.intensity,
            volume || '',
            session.notes || ''
          ]);
        });
      });
    });

    const csvContent = [
      headers.map(escapeCSVValue).join(','),
      ...rows.map(row => row.map(escapeCSVValue).join(','))
    ].join('\n');

    return csvContent;
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleExportSummary = async () => {
    setIsExporting(true);
    
    try {
      const sessionsToExport = filteredAndSortedSessions;
      const csvContent = generateSessionSummaryCSV(sessionsToExport);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `fitness-sessions-summary-${timestamp}.csv`;
      
      downloadCSV(csvContent, filename);
      
      setTimeout(() => {
        alert(`✅ Exported ${sessionsToExport.length} sessions to ${filename}`);
      }, 500);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ Failed to export sessions. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDetailed = async () => {
    setIsExporting(true);
    
    try {
      const sessionsToExport = filteredAndSortedSessions;
      const csvContent = generateDetailedWorkoutCSV(sessionsToExport);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `fitness-workouts-detailed-${timestamp}.csv`;
      
      downloadCSV(csvContent, filename);
      
      const totalSets = sessionsToExport.reduce((total, session) => 
        total + session.workouts.reduce((workoutTotal, workout) => 
          workoutTotal + workout.sets.length, 0), 0);
      
      setTimeout(() => {
        alert(`✅ Exported ${totalSets} workout sets from ${sessionsToExport.length} sessions to ${filename}`);
      }, 500);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ Failed to export detailed workouts. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleThemeSelect = (themeKey) => {
    onThemeChange(themeKey);
    setShowThemeWheel(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateSessionDuration = (started, finished) => {
    const start = new Date(started);
    const end = new Date(finished);
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const calculateTotalStats = (session) => {
    const totalSets = session.workouts.reduce((total, workout) => total + workout.sets.length, 0);
    const totalReps = session.workouts.reduce((total, workout) =>
      total + workout.sets.reduce((setTotal, set) => setTotal + set.reps.count, 0), 0
    );
    const totalWeight = session.workouts.reduce((total, workout) =>
      total + workout.sets.reduce((setTotal, set) => 
        setTotal + (set.reps.weight ? set.reps.weight * set.reps.count : 0), 0
      ), 0
    );
    
    return { totalSets, totalReps, totalWeight };
  };

  const filteredAndSortedSessions = sessions
    .filter(session => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesNotes = session.notes?.toLowerCase().includes(searchLower);
        const matchesWorkouts = session.workouts.some(workout => 
          workout.name.toLowerCase().includes(searchLower)
        );
        if (!matchesNotes && !matchesWorkouts) return false;
      }
      
      if (filterPeriod !== 'all') {
        const sessionDate = new Date(session.started_at);
        const now = new Date();
        const diffDays = (now - sessionDate) / (1000 * 60 * 60 * 24);
        
        switch (filterPeriod) {
          case 'week':
            if (diffDays > 7) return false;
            break;
          case 'month':
            if (diffDays > 30) return false;
            break;
          case 'year':
            if (diffDays > 365) return false;
            break;
          default:
            break;
        }
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.started_at) - new Date(b.started_at);
        case 'duration':
          const durationA = new Date(a.finished_at) - new Date(a.started_at);
          const durationB = new Date(b.finished_at) - new Date(b.started_at);
          return durationB - durationA;
        case 'workouts':
          return b.workouts.length - a.workouts.length;
        case 'newest':
        default:
          return new Date(b.started_at) - new Date(a.started_at);
      }
    });

  const overallStats = sessions.reduce((acc, session) => {
    const stats = calculateTotalStats(session);
    acc.totalSessions += 1;
    acc.totalWorkouts += session.workouts.length;
    acc.totalSets += stats.totalSets;
    acc.totalReps += stats.totalReps;
    acc.totalWeight += stats.totalWeight;
    acc.totalDuration += new Date(session.finished_at) - new Date(session.started_at);
    return acc;
  }, { totalSessions: 0, totalWorkouts: 0, totalSets: 0, totalReps: 0, totalWeight: 0, totalDuration: 0 });

  const formatDuration = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className={`history-container theme-${currentTheme}`}>
      {/* Header */}
      <div className="history-header">
        <div className="header-left">
          <button className="back-button" onClick={onBack}>
            <ArrowLeft className="back-icon" />
            <span>Back</span>
          </button>
          
          <button 
            className="theme-toggle" 
            onClick={() => setShowThemeWheel(!showThemeWheel)}
          >
            <Palette className="palette-icon" />
            <span>Themes</span>
          </button>
        </div>

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

      <div className="history-content">
        {/* Page Title */}
        <div className="page-title-section">
          <div className="title-icon">
            <Trophy className="trophy-icon" />
          </div>
          <h1 className="page-title">Your Fitness Journey</h1>
          <p className="page-subtitle">Track your progress and celebrate your achievements</p>
        </div>

        {/* Overall Stats */}
        {!loading && sessions.length > 0 && (
          <div className="stats-overview">
            <div className="stat-card">
              <div className="stat-icon">🏋️</div>
              <div className="stat-content">
                <span className="stat-value">{overallStats.totalSessions}</span>
                <span className="stat-label">Total Sessions</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">💪</div>
              <div className="stat-content">
                <span className="stat-value">{overallStats.totalWorkouts}</span>
                <span className="stat-label">Exercises</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <span className="stat-value">{overallStats.totalSets}</span>
                <span className="stat-label">Total Sets</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-content">
                <span className="stat-value">{formatDuration(overallStats.totalDuration)}</span>
                <span className="stat-label">Time Trained</span>
              </div>
            </div>
          </div>
        )}

        {/* Export Section */}
        {!loading && filteredAndSortedSessions.length > 0 && (
          <div className="export-section">
            <div className="export-header">
              <h3 className="export-title">
                <FileText className="export-title-icon" />
                Export Your Data
              </h3>
              <p className="export-subtitle">
                Download your fitness data for analysis in Excel, Google Sheets, or other tools
              </p>
            </div>
            
            <div className="export-buttons">
              <button 
                className={`export-button summary ${isExporting ? 'exporting' : ''}`}
                onClick={handleExportSummary}
                disabled={isExporting}
              >
                <Download className="export-icon" />
                <div className="export-button-content">
                  <span className="export-button-title">Session Summary</span>
                  <span className="export-button-desc">One row per session with totals</span>
                </div>
              </button>
              
              <button 
                className={`export-button detailed ${isExporting ? 'exporting' : ''}`}
                onClick={handleExportDetailed}
                disabled={isExporting}
              >
                <Download className="export-icon" />
                <div className="export-button-content">
                  <span className="export-button-title">Detailed Workouts</span>
                  <span className="export-button-desc">One row per set with full details</span>
                </div>
              </button>
            </div>
            
            <div className="export-info">
              <p className="export-note">
                📄 Exporting {filteredAndSortedSessions.length} sessions 
                {(searchTerm || filterPeriod !== 'all') && ' (filtered)'}
              </p>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="controls-section">
          <div className="search-bar">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search sessions or exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filters">
            <select 
              value={filterPeriod} 
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Time</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="year">Past Year</option>
            </select>
            
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="duration">Longest Duration</option>
              <option value="workouts">Most Exercises</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your sessions...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
            <div className="error-state">
                <div className="error-icon">⚠️</div>
                <h3>Unable to Load Sessions</h3>
                <p>{error}</p>
                <button 
                className="retry-button"
                onClick={() => window.location.reload()}
                >
                Try Again
                </button>
            </div>
            )}

        {/* Empty State */}
        {!loading && filteredAndSortedSessions.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <Dumbbell className="dumbbell-icon" />
            </div>
            <h3>No sessions found</h3>
            <p>
              {searchTerm || filterPeriod !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start your first workout session to see it here!'
              }
            </p>
          </div>
        )}

        {/* Sessions List */}
        {!loading && filteredAndSortedSessions.length > 0 && (
          <div className="sessions-list">
            {filteredAndSortedSessions.map((session) => {
              const stats = calculateTotalStats(session);
              const isExpanded = expandedSession === session.id;
              
              return (
                <div key={session.id} className={`session-card ${isExpanded ? 'expanded' : ''}`}>
                  <div 
                    className="session-summary"
                    onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                  >
                    <div className="session-main-info">
                      <div className="session-date-time">
                        <h3 className="session-date">{formatDate(session.started_at)}</h3>
                        <div className="session-time">
                          {formatTime(session.started_at)} - {formatTime(session.finished_at)}
                        </div>
                      </div>
                      
                      <div className="session-quick-stats">
                        <div className="quick-stat">
                          <Clock className="quick-stat-icon" />
                          <span>{calculateSessionDuration(session.started_at, session.finished_at)}</span>
                        </div>
                        <div className="quick-stat">
                          <Target className="quick-stat-icon" />
                          <span>{session.workouts.length} exercises</span>
                        </div>
                        <div className="quick-stat">
                          <TrendingUp className="quick-stat-icon" />
                          <span>{stats.totalSets} sets</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="expand-button">
                      {isExpanded ? (
                        <ChevronDown className="expand-icon" />
                      ) : (
                        <ChevronRight className="expand-icon" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="session-details">
                      {session.notes && (
                        <div className="session-notes">
                          <h4>Session Notes</h4>
                          <p>"{session.notes}"</p>
                        </div>
                      )}
                      
                      <div className="session-stats-detailed">
                        <div className="detailed-stat">
                          <span className="stat-label">Total Reps</span>
                          <span className="stat-value">{stats.totalReps}</span>
                        </div>
                        <div className="detailed-stat">
                          <span className="stat-label">Total Weight</span>
                          <span className="stat-value">{stats.totalWeight.toLocaleString()} lbs</span>
                        </div>
                        <div className="detailed-stat">
                          <span className="stat-label">Average Sets/Exercise</span>
                          <span className="stat-value">{(stats.totalSets / session.workouts.length).toFixed(1)}</span>
                        </div>
                      </div>
                      
                      <div className="workouts-breakdown">
                        <h4>Exercise Breakdown</h4>
                        {session.workouts.map((workout, workoutIndex) => (
                          <div key={workoutIndex} className="workout-item">
                            <div className="workout-header">
                              <h5>{workout.name}</h5>
                              <span className="workout-sets-count">{workout.sets.length} sets</span>
                            </div>
                            <div className="workout-sets">
                              {workout.sets.map((set, setIndex) => (
                                <div key={setIndex} className="set-item">
                                  <span className="set-number">{setIndex + 1}</span>
                                  <div className="set-details">
                                    <span className="set-reps">{set.reps.count} reps</span>
                                    {set.reps.weight && (
                                      <span className="set-weight">@ {set.reps.weight}lbs</span>
                                    )}
                                    <span className={`intensity-badge ${set.reps.intensity}`}>
                                      {set.reps.intensity}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .theme-energy { background: ${themes.energy.background}; }
        .theme-bloom { background: ${themes.bloom.background}; }
        .theme-ocean { background: ${themes.ocean.background}; }
        .theme-forest { background: ${themes.forest.background}; }
        .theme-sunset { background: ${themes.sunset.background}; }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          position: relative;
          z-index: 5;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .back-button, .theme-toggle {
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

        .back-button:hover, .theme-toggle:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .back-icon, .palette-icon {
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

        .history-content {
          padding: 0 2rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-title-section {
          text-align: center;
          margin-bottom: 3rem;
        }

        .title-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          margin-bottom: 1rem;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .trophy-icon {
          width: 40px;
          height: 40px;
          color: #ffffff;
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
        }

        .page-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 0.5rem 0;
          text-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.2),
            0 0 20px rgba(255, 255, 255, 0.3);
          letter-spacing: -0.02em;
        }

        .page-subtitle {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1.1rem;
          font-weight: 400;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          margin: 0;
        }

        .stats-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        .stat-card .stat-icon {
          font-size: 2.5rem;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          backdrop-filter: blur(10px);
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: white;
          line-height: 1;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
        }

        .export-section {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 3rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .export-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .export-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: white;
          font-size: 1.4rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
        }

        .export-title-icon {
          width: 24px;
          height: 24px;
        }

        .export-subtitle {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1rem;
          margin: 0;
          line-height: 1.4;
        }

        .export-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .export-button {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          text-align: left;
        }

        .export-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .export-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .export-button.exporting .export-icon {
          animation: spin 1s linear infinite;
        }

        .export-icon {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
          color: rgba(255, 255, 255, 0.8);
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .export-button-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .export-button-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: white;
        }

        .export-button-desc {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.3;
        }

        .export-info {
          text-align: center;
        }

        .export-note {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
          margin: 0;
          font-style: italic;
        }

        .controls-section {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-bar {
          position: relative;
          flex: 1;
          min-width: 250px;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          color: rgba(255, 255, 255, 0.6);
        }

        .search-input {
          width: 100%;
          padding: 16px 16px 16px 50px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .search-input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.4);
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .filters {
          display: flex;
          gap: 1rem;
        }

        .filter-select {
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          min-width: 120px;
        }

        .filter-select:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.4);
          background: rgba(255, 255, 255, 0.15);
        }

        .filter-select option {
          background: #333;
          color: white;
        }

        .loading-state, .error-state, .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        .empty-icon {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          backdrop-filter: blur(10px);
        }

        .dumbbell-icon {
          width: 40px;
          height: 40px;
          color: rgba(255, 255, 255, 0.6);
        }

        .empty-state h3 {
          color: white;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 1rem;
          margin: 0;
        }

        .sessions-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .session-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .session-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        }

        .session-card.expanded {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .session-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .session-summary:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .session-main-info {
          display: flex;
          align-items: center;
          gap: 2rem;
          flex: 1;
        }

        .session-date-time {
          min-width: 200px;
        }

        .session-date {
          color: white;
          font-size: 1.2rem;
          font-weight: 700;
          margin: 0 0 0.25rem 0;
        }

        .session-time {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .session-quick-stats {
          display: flex;
          gap: 2rem;
          flex: 1;
        }

        .quick-stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .quick-stat-icon {
          width: 16px;
          height: 16px;
          color: rgba(255, 255, 255, 0.6);
        }

        .expand-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .expand-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .expand-icon {
          width: 20px;
          height: 20px;
          color: rgba(255, 255, 255, 0.8);
          transition: transform 0.2s ease;
        }

        .session-details {
          padding: 0 2rem 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .session-notes {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border-left: 4px solid rgba(255, 255, 255, 0.3);
        }

        .session-notes h4 {
          color: white;
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
        }

        .session-notes p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.95rem;
          font-style: italic;
          margin: 0;
          line-height: 1.4;
        }

        .session-stats-detailed {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .detailed-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          text-align: center;
        }

        .detailed-stat .stat-label {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.8rem;
          font-weight: 500;
          margin-bottom: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .detailed-stat .stat-value {
          color: white;
          font-size: 1.3rem;
          font-weight: 700;
        }

        .workouts-breakdown {
          margin-top: 1.5rem;
        }

        .workouts-breakdown h4 {
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
        }

        .workout-item {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .workout-item:last-child {
          margin-bottom: 0;
        }

        .workout-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .workout-header h5 {
          color: white;
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
        }

        .workout-sets-count {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.8rem;
          font-weight: 500;
        }

        .workout-sets {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .set-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .set-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          color: white;
          font-size: 0.8rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .set-details {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }

        .set-reps, .set-weight {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .intensity-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .intensity-badge.low {
          background: rgba(46, 204, 113, 0.2);
          color: #2ecc71;
          border: 1px solid rgba(46, 204, 113, 0.3);
        }

        .intensity-badge.medium {
          background: rgba(243, 156, 18, 0.2);
          color: #f39c12;
          border: 1px solid rgba(243, 156, 18, 0.3);
        }

        .intensity-badge.high {
          background: rgba(231, 76, 60, 0.2);
          color: #e74c3c;
          border: 1px solid rgba(231, 76, 60, 0.3);
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
          .history-header {
            padding: 1rem;
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .header-left {
            justify-content: space-between;
          }

          .user-controls {
            justify-content: center;
          }

          .user-info span {
            display: none;
          }

          .history-content {
            padding: 0 1rem 1rem;
          }

          .page-title {
            font-size: 2rem;
          }

          .stats-overview {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }

          .export-buttons {
            grid-template-columns: 1fr;
          }

          .controls-section {
            flex-direction: column;
          }

          .session-main-info {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .session-quick-stats {
            gap: 1rem;
            flex-wrap: wrap;
          }
        }

        @media (max-width: 480px) {
          .page-title {
            font-size: 1.8rem;
          }

          .stats-overview {
            grid-template-columns: 1fr;
          }

          .session-stats-detailed {
            grid-template-columns: 1fr;
          }
          .history-container {
            min-height: 100vh;
            background-size: 400% 400%;
            animation: gradient-shift 8s ease infinite;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
            position: relative;
            overflow-x: hidden;
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            }
        .error-state {
        text-align: center;
        padding: 3rem 2rem;
        color: rgba(255, 255, 255, 0.8);
        }

        .error-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        }

        .error-state h3 {
        color: white;
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        }

        .error-state p {
        color: rgba(255, 255, 255, 0.7);
        font-size: 1rem;
        margin-bottom: 1.5rem;
        }

        .retry-button {
        padding: 12px 24px;
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        color: white;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        }

        .retry-button:hover {
        background: rgba(255, 255, 255, 0.25);
        transform: translateY(-1px);
        }
        }
      `}</style>
    </div>
  );
};

export default SessionHistory;