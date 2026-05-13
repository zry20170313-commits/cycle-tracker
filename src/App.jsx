import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Setup from './pages/Setup';
import Cycle from './pages/Cycle';
import DailyRecord from './pages/DailyRecord';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import { defaultCustomOptions } from './data/defaultOptions';
import './App.css';

function App() {
  const [userInfo, setUserInfo] = useState(() => {
    const saved = localStorage.getItem('userInfo');
    return saved ? JSON.parse(saved) : null;
  });

  const [cycleRecords, setCycleRecords] = useState(() => {
    const saved = localStorage.getItem('cycleRecords');
    return saved ? JSON.parse(saved) : [];
  });

  const [dailyRecords, setDailyRecords] = useState(() => {
    const saved = localStorage.getItem('dailyRecords');
    return saved ? JSON.parse(saved) : [];
  });

  const [customOptions, setCustomOptions] = useState(() => {
    const saved = localStorage.getItem('customOptions');
    return saved ? JSON.parse(saved) : defaultCustomOptions;
  });

  useEffect(() => {
    if (userInfo) {
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    }
  }, [userInfo]);

  useEffect(() => {
    localStorage.setItem('cycleRecords', JSON.stringify(cycleRecords));
  }, [cycleRecords]);

  useEffect(() => {
    localStorage.setItem('dailyRecords', JSON.stringify(dailyRecords));
  }, [dailyRecords]);

  useEffect(() => {
    localStorage.setItem('customOptions', JSON.stringify(customOptions));
  }, [customOptions]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout userInfo={userInfo} />}>
          <Route index element={<Home userInfo={userInfo} cycleRecords={cycleRecords} dailyRecords={dailyRecords} />} />
          <Route path="setup" element={<Setup userInfo={userInfo} setUserInfo={setUserInfo} />} />
          <Route path="cycle" element={<Cycle cycleRecords={cycleRecords} setCycleRecords={setCycleRecords} />} />
          <Route path="daily" element={<DailyRecord dailyRecords={dailyRecords} setDailyRecords={setDailyRecords} customOptions={customOptions} />} />
          <Route path="dashboard" element={<Dashboard cycleRecords={cycleRecords} dailyRecords={dailyRecords} userInfo={userInfo} />} />
          <Route path="settings" element={<Settings customOptions={customOptions} setCustomOptions={setCustomOptions} userInfo={userInfo} setUserInfo={setUserInfo} />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
