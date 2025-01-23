import React, { useState, useEffect } from 'react';
import { UserProfile } from './components/UserProfile';
import { JobMatcher } from './components/JobMatcher';
import { ResumeGenerator } from './components/ResumeGenerator';

function App() {
  const [activeTab, setActiveTab] = useState('profile');
  const [userProfile, setUserProfile] = useState(null);

  return (
    <div className="app-container">
      <nav>
        <button onClick={() => setActiveTab('profile')}>Profile</button>
        <button onClick={() => setActiveTab('matcher')}>Job Matcher</button>
        <button onClick={() => setActiveTab('generator')}>Generate</button>
      </nav>

      <main>
        {activeTab === 'profile' && <UserProfile />}
        {activeTab === 'matcher' && <JobMatcher />}
        {activeTab === 'generator' && <ResumeGenerator />}
      </main>
    </div>
  );
}

export default App;