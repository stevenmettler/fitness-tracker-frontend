import React from 'react';
import NewSession from './NewSession';

function Dashboard({ user }) {
  return (
    <div>
      <h2>Dashboard</h2>
      <p>Hello {user}, ready for your workout?</p>
      <div>
        <h3>Your Stats</h3>
        <ul>
          <li>Total Workouts: 0</li>
          <li>Total Sets: 0</li>
          <li>Total Reps: 0</li>
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;