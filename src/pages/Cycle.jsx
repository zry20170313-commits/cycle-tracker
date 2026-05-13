import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Info } from 'lucide-react';
import { getCurrentPhase, predictNextPeriod, predictOvulation, calculateAverageCycleLength, calculateAveragePeriodLength, getCycleCalendarData } from '../utils/cycleCalculations';
import { cyclePhases } from '../data/defaultOptions';

export default function Cycle({ cycleRecords, setCycleRecords }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPhaseInfo, setShowPhaseInfo] = useState(null);
  const [newRecord, setNewRecord] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    duration: 5,
    notes: '',
  });

  const currentPhase = getCurrentPhase(cycleRecords);
  const nextPeriod = predictNextPeriod(cycleRecords);
  const nextOvulation = predictOvulation(cycleRecords);
  const avgCycle = calculateAverageCycleLength(cycleRecords);
  const avgPeriod = calculateAveragePeriodLength(cycleRecords);

  // 日历数据
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const calendarData = getCycleCalendarData(cycleRecords);

  // 从周日开始
  const startDay = monthStart.getDay();
  const paddingDays = Array(startDay).fill(null);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleAddRecord = () => {
    if (!newRecord.startDate) return;
    
    const record = {
      id: Date.now(),
      startDate: newRecord.startDate,
      duration: Number(newRecord.duration),
      notes: newRecord.notes,
      createdAt: new Date().toISOString(),
    };

    setCycleRecords(prev => [...prev, record]);
    setShowAddModal(false);
    setNewRecord({
      startDate: format(new Date(), 'yyyy-MM-dd'),
      duration: 5,
      notes: '',
    });
  };

  const handleDeleteRecord = (id) => {
    if (confirm('确定要删除这条记录吗？')) {
      setCycleRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  return (
    <div className="page cycle-page">
      {/* 当前阶段信息 */}
      {currentPhase && (
        <section className="section current-phase">
          <div 
            className="phase-badge"
            style={{ backgroundColor: cyclePhases[currentPhase.phase].color }}
          >
            {cyclePhases[currentPhase.phase].emoji} {cyclePhases[currentPhase.phase].name}
          </div>
          <p className="cycle-day">周期第 {currentPhase.dayOfCycle} 天</p>
          <p className="days-until">
            距下次经期约 {currentPhase.daysUntilNextPeriod} 天
          </p>
        </section>
      )}

      {/* 预测信息 */}
      <section className="section predictions">
        <div className="prediction-card">
          <div className="prediction-icon">🩸</div>
          <div className="prediction-content">
            <span className="prediction-label">预计下次经期</span>
            <span className="prediction-value">
              {nextPeriod ? nextPeriod.displayDate : '暂无数据'}
            </span>
          </div>
        </div>
        <div className="prediction-card">
          <div className="prediction-icon">✨</div>
          <div className="prediction-content">
            <span className="prediction-label">预计排卵日</span>
            <span className="prediction-value">
              {nextOvulation ? nextOvulation.displayDate : '暂无数据'}
            </span>
          </div>
        </div>
      </section>

      {/* 周期统计 */}
      {(avgCycle || avgPeriod) && (
        <section className="section stats">
          <div className="stat-item">
            <span className="stat-value">{avgCycle || '-'}</span>
            <span className="stat-label">平均周期(天)</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{avgPeriod || '-'}</span>
            <span className="stat-label">平均经期(天)</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{cycleRecords.length}</span>
            <span className="stat-label">记录次数</span>
          </div>
        </section>
      )}

      {/* 日历 */}
      <section className="section calendar-section">
        <div className="calendar-header">
          <button onClick={handlePrevMonth} className="btn-icon">
            <ChevronLeft size={20} />
          </button>
          <h3>{format(currentMonth, 'yyyy年M月')}</h3>
          <button onClick={handleNextMonth} className="btn-icon">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="calendar-weekdays">
          {['日', '一', '二', '三', '四', '五', '六'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>

        <div className="calendar-days">
          {paddingDays.map((_, index) => (
            <div key={`padding-${index}`} className="calendar-day empty"></div>
          ))}
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isPeriod = calendarData[dateStr] === 'period';
            
            return (
              <div
                key={dateStr}
                className={`calendar-day ${isPeriod ? 'period' : ''} ${isToday(day) ? 'today' : ''}`}
              >
                <span>{format(day, 'd')}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 四阶段科普 */}
      <section className="section phases-info">
        <h3 className="section-title">周期四阶段</h3>
        <div className="phases-list">
          {Object.entries(cyclePhases).map(([key, phase]) => (
            <div 
              key={key} 
              className={`phase-item ${currentPhase?.phase === key ? 'active' : ''}`}
              onClick={() => setShowPhaseInfo(key)}
            >
              <div className="phase-icon" style={{ backgroundColor: phase.color }}>
                {phase.emoji}
              </div>
              <div className="phase-info">
                <h4>{phase.name}</h4>
                <p>{phase.description.substring(0, 30)}...</p>
              </div>
              <Info size={16} className="info-icon" />
            </div>
          ))}
        </div>
      </section>

      {/* 历史记录 */}
      <section className="section history-section">
        <div className="section-header">
          <h3 className="section-title">历史记录</h3>
          <button className="btn btn-primary btn-small" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> 添加
          </button>
        </div>
        
        {cycleRecords.length > 0 ? (
          <div className="history-list">
            {[...cycleRecords]
              .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
              .slice(0, 10)
              .map(record => (
                <div key={record.id} className="history-item">
                  <div className="history-date">
                    <span className="date">{format(parseISO(record.startDate), 'M月d日')}</span>
                    <span className="year">{format(parseISO(record.startDate), 'yyyy年')}</span>
                  </div>
                  <div className="history-duration">
                    {record.duration} 天
                  </div>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDeleteRecord(record.id)}
                  >
                    删除
                  </button>
                </div>
              ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>还没有周期记录</p>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              添加第一条记录
            </button>
          </div>
        )}
      </section>

      {/* 添加记录弹窗 */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>添加经期记录</h3>
            
            <div className="form-group">
              <label>开始日期</label>
              <input
                type="date"
                value={newRecord.startDate}
                onChange={e => setNewRecord(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            
            <div className="form-group">
              <label>持续天数</label>
              <select
                value={newRecord.duration}
                onChange={e => setNewRecord(prev => ({ ...prev, duration: e.target.value }))}
              >
                {[2, 3, 4, 5, 6, 7, 8].map(d => (
                  <option key={d} value={d}>{d} 天</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>备注（可选）</label>
              <textarea
                value={newRecord.notes}
                onChange={e => setNewRecord(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="记录特殊情况..."
                rows={3}
              />
            </div>
            
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                取消
              </button>
              <button className="btn btn-primary" onClick={handleAddRecord}>
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 阶段详情弹窗 */}
      {showPhaseInfo && (
        <div className="modal-overlay" onClick={() => setShowPhaseInfo(null)}>
          <div className="modal phase-detail-modal" onClick={e => e.stopPropagation()}>
            <div 
              className="phase-detail-header"
              style={{ backgroundColor: cyclePhases[showPhaseInfo].color }}
            >
              <span className="phase-detail-emoji">{cyclePhases[showPhaseInfo].emoji}</span>
              <h3>{cyclePhases[showPhaseInfo].name}</h3>
            </div>
            
            <div className="phase-detail-content">
              <p className="phase-description">{cyclePhases[showPhaseInfo].description}</p>
              
              <div className="advice-section">
                <h4>🏃‍♀️ 运动建议</h4>
                <p>{cyclePhases[showPhaseInfo].exerciseAdvice}</p>
              </div>
              
              <div className="advice-section">
                <h4>🥗 饮食建议</h4>
                <p>{cyclePhases[showPhaseInfo].dietAdvice}</p>
              </div>
              
              <div className="advice-section">
                <h4>💡 生活提示</h4>
                <p>{cyclePhases[showPhaseInfo].lifeTips}</p>
              </div>
            </div>
            
            <button className="btn btn-block" onClick={() => setShowPhaseInfo(null)}>
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
