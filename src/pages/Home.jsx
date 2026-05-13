import { Link, useNavigate } from 'react-router-dom';
import { Calendar, PlusCircle, TrendingUp, Heart, ChevronRight } from 'lucide-react';
import { getCurrentPhase, predictNextPeriod, predictOvulation } from '../utils/cycleCalculations';
import { cyclePhases } from '../data/defaultOptions';

export default function Home({ userInfo, cycleRecords, dailyRecords }) {
  const navigate = useNavigate();

  // 如果没有用户信息，显示引导页面
  if (!userInfo) {
    return (
      <div className="page home-welcome">
        <div className="welcome-content">
          <div className="welcome-icon">
            <Heart size={64} />
          </div>
          <h2>欢迎使用周期伴侣</h2>
          <p>了解你的身体，追踪你的周期，活出更好的自己</p>
          <button className="btn btn-primary btn-large" onClick={() => navigate('/setup')}>
            开始设置
          </button>
        </div>
      </div>
    );
  }

  const currentPhase = getCurrentPhase(cycleRecords, userInfo.averageCycleLength || 28);
  const nextPeriod = predictNextPeriod(cycleRecords, userInfo.averageCycleLength || 28);
  const nextOvulation = predictOvulation(cycleRecords, userInfo.averageCycleLength || 28);

  const phaseInfo = currentPhase ? cyclePhases[currentPhase.phase] : null;

  return (
    <div className="page home-page">
      {/* 当前阶段卡片 */}
      <section className="section phase-section">
        <div 
          className="phase-card"
          style={{ background: phaseInfo ? `linear-gradient(135deg, ${phaseInfo.color}22, ${phaseInfo.color}44)` : undefined }}
        >
          {phaseInfo ? (
            <>
              <div className="phase-header">
                <span className="phase-emoji">{phaseInfo.emoji}</span>
                <div className="phase-title">
                  <h3>当前阶段：{phaseInfo.name}</h3>
                  <p className="phase-day">周期第 {currentPhase.dayOfCycle} 天</p>
                </div>
              </div>
              <p className="phase-description">{phaseInfo.description}</p>
              
              <div className="phase-predictions">
                {nextPeriod && (
                  <div className="prediction-item">
                    <Calendar size={16} />
                    <span>预计下次经期：{nextPeriod.displayDate}</span>
                  </div>
                )}
                {nextOvulation && (
                  <div className="prediction-item">
                    <span className="ovulation-dot"></span>
                    <span>预计排卵日：{nextOvulation.displayDate}</span>
                  </div>
                )}
              </div>

              <Link to="/cycle" className="phase-link">
                查看详情 <ChevronRight size={16} />
              </Link>
            </>
          ) : (
            <div className="no-phase">
              <p>还没有周期记录</p>
              <button className="btn btn-primary" onClick={() => navigate('/cycle')}>
                开始记录
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 今日建议 */}
      {phaseInfo && (
        <section className="section advice-section">
          <h3 className="section-title">今日建议</h3>
          <div className="advice-cards">
            <div className="advice-card">
              <div className="advice-icon">🏃‍♀️</div>
              <h4>运动</h4>
              <p>{phaseInfo.exerciseAdvice}</p>
            </div>
            <div className="advice-card">
              <div className="advice-icon">🥗</div>
              <h4>饮食</h4>
              <p>{phaseInfo.dietAdvice}</p>
            </div>
            <div className="advice-card">
              <div className="advice-icon">💡</div>
              <h4>生活</h4>
              <p>{phaseInfo.lifeTips}</p>
            </div>
          </div>
        </section>
      )}

      {/* 快捷操作 */}
      <section className="section quick-actions">
        <h3 className="section-title">快捷操作</h3>
        <div className="action-buttons">
          <Link to="/daily" className="action-btn">
            <PlusCircle size={24} />
            <span>今日记录</span>
          </Link>
          <Link to="/cycle" className="action-btn">
            <Calendar size={24} />
            <span>周期记录</span>
          </Link>
          <Link to="/dashboard" className="action-btn">
            <TrendingUp size={24} />
            <span>数据看板</span>
          </Link>
        </div>
      </section>

      {/* 代谢信息 */}
      {userInfo.bmr && (
        <section className="section metabolism-section">
          <h3 className="section-title">代谢数据</h3>
          <div className="metabolism-cards">
            <div className="metabolism-card">
              <span className="metabolism-value">{userInfo.bmr}</span>
              <span className="metabolism-label">基础代谢 (kcal)</span>
            </div>
            <div className="metabolism-card">
              <span className="metabolism-value">{userInfo.tdee}</span>
              <span className="metabolism-label">每日消耗 (kcal)</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
