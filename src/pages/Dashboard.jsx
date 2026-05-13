import { useState } from 'react';
import { format, subDays, parseISO, startOfDay } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Calendar, Activity } from 'lucide-react';
import { getCurrentPhase, calculateAverageCycleLength, calculateAveragePeriodLength } from '../utils/cycleCalculations';
import { cyclePhases } from '../data/defaultOptions';

export default function Dashboard({ cycleRecords, dailyRecords, userInfo }) {
  const [activeChart, setActiveChart] = useState('weight');

  // 准备体重数据
  const weightData = dailyRecords
    .filter(r => r.weight)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-30)
    .map(r => ({
      date: format(parseISO(r.date), 'M/d'),
      weight: Number(r.weight),
      phase: r.phase,
    }));

  // 准备心情数据
  const moodCounts = {};
  dailyRecords.forEach(r => {
    if (r.mood) {
      moodCounts[r.mood] = (moodCounts[r.mood] || 0) + 1;
    }
  });

  const moodData = Object.entries(moodCounts).map(([moodId, count]) => {
    const mood = userInfo?.customOptions?.moods?.find(m => m.id === moodId) || 
                 { label: moodId, emoji: '😊' };
    return {
      name: mood.label,
      emoji: mood.emoji,
      count,
    };
  });

  // 按周期阶段分析心情
  const phaseMoodData = {};
  Object.keys(cyclePhases).forEach(phase => {
    phaseMoodData[phase] = { total: 0, moods: {} };
  });

  dailyRecords.forEach(r => {
    if (r.phase && r.mood) {
      phaseMoodData[r.phase].total++;
      phaseMoodData[r.phase].moods[r.mood] = (phaseMoodData[r.phase].moods[r.mood] || 0) + 1;
    }
  });

  // 计算最近7天的记录情况
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const record = dailyRecords.find(r => r.date === date);
    last7Days.push({
      date: format(subDays(new Date(), i), 'M/d'),
      hasRecord: !!record,
      mood: record?.mood,
      weight: record?.weight,
    });
  }

  const currentPhase = getCurrentPhase(cycleRecords);
  const avgCycle = calculateAverageCycleLength(cycleRecords);
  const avgPeriod = calculateAveragePeriodLength(cycleRecords);

  return (
    <div className="page dashboard-page">
      {/* 概览卡片 */}
      <section className="section overview-section">
        <div className="overview-cards">
          <div className="overview-card">
            <div className="overview-icon">📊</div>
            <div className="overview-content">
              <span className="overview-value">{dailyRecords.length}</span>
              <span className="overview-label">总记录天数</span>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon">🩸</div>
            <div className="overview-content">
              <span className="overview-value">{cycleRecords.length}</span>
              <span className="overview-label">周期记录</span>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon">📅</div>
            <div className="overview-content">
              <span className="overview-value">{avgCycle || '-'}</span>
              <span className="overview-label">平均周期</span>
            </div>
          </div>
        </div>
      </section>

      {/* 最近7天 */}
      <section className="section recent-week">
        <h3 className="section-title">最近7天</h3>
        <div className="week-grid">
          {last7Days.map((day, index) => (
            <div key={index} className={`day-cell ${day.hasRecord ? 'has-record' : ''}`}>
              <span className="day-date">{day.date}</span>
              <div className="day-indicator">
                {day.hasRecord ? '✓' : '○'}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 体重趋势 */}
      {weightData.length > 1 && (
        <section className="section chart-section">
          <h3 className="section-title">
            <TrendingUp size={18} /> 体重趋势
          </h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis 
                  domain={['dataMin - 1', 'dataMax + 1']} 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#E74C3C" 
                  strokeWidth={2}
                  dot={{ fill: '#E74C3C', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* 心情分布 */}
      {moodData.length > 0 && (
        <section className="section chart-section">
          <h3 className="section-title">
            <Activity size={18} /> 心情分布
          </h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#9B59B6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* 周期阶段与心情关联 */}
      {Object.values(phaseMoodData).some(p => p.total > 0) && (
        <section className="section phase-mood-section">
          <h3 className="section-title">
            <Calendar size={18} /> 各阶段心情分析
          </h3>
          <div className="phase-mood-grid">
            {Object.entries(cyclePhases).map(([key, phase]) => {
              const data = phaseMoodData[key];
              if (data.total === 0) return null;
              
              const topMood = Object.entries(data.moods)
                .sort((a, b) => b[1] - a[1])[0];
              
              return (
                <div key={key} className="phase-mood-card" style={{ borderColor: phase.color }}>
                  <div className="phase-mood-header">
                    <span>{phase.emoji}</span>
                    <span>{phase.name}</span>
                  </div>
                  <div className="phase-mood-stats">
                    <span className="stat">{data.total} 条记录</span>
                    {topMood && (
                      <span className="top-mood">
                        最常见：{topMood[0]}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 代谢信息 */}
      {userInfo?.bmr && (
        <section className="section metabolism-section">
          <h3 className="section-title">代谢数据</h3>
          <div className="metabolism-info">
            <div className="metabolism-item">
              <span className="label">基础代谢 (BMR)</span>
              <span className="value">{userInfo.bmr} kcal/天</span>
            </div>
            <div className="metabolism-item">
              <span className="label">每日消耗 (TDEE)</span>
              <span className="value">{userInfo.tdee} kcal/天</span>
            </div>
            <div className="metabolism-item">
              <span className="label">活动量</span>
              <span className="value">{userInfo.activityMultiplier}x</span>
            </div>
          </div>
        </section>
      )}

      {/* 空状态 */}
      {dailyRecords.length === 0 && (
        <section className="section empty-state-section">
          <div className="empty-state">
            <span className="empty-icon">📊</span>
            <h3>还没有数据</h3>
            <p>开始记录你的日常，这里会显示趋势分析</p>
          </div>
        </section>
      )}
    </div>
  );
}
