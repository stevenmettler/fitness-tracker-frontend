import React from 'react';

function Header({ title, user, onLogout }) {
  return (
    <header style={{ background: '#f0f0f0', padding: '1rem' }}>
      <h1>{title}</h1>
      {user && (
        <div>
          <span>Welcome, {user}!</span>
          <button onClick={onLogout} style={{ marginLeft: '1rem' }}>
            Logout
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;