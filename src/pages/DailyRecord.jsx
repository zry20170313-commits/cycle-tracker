import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, X, Save } from 'lucide-react';
import { getCurrentPhase } from '../utils/cycleCalculations';
import { cyclePhases } from '../data/defaultOptions';

export default function DailyRecord({ dailyRecords, setDailyRecords, customOptions }) {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('mood');
  
  const [recordData, setRecordData] = useState({
    mood: null,
    energy: null,
    sleep: { hours: '', quality: '' },
    exercises: [],
    meals: [],
    symptoms: [],
    bowel: null,
    weight: '',
    notes: '',
  });

  const currentPhase = getCurrentPhase(dailyRecords);
  const phaseInfo = currentPhase ? cyclePhases[currentPhase.phase] : null;

  // 获取当天已有记录
  const todayRecord = dailyRecords.find(r => r.date === selectedDate);

  const categories = [
    { id: 'mood', label: '心情', emoji: '😊' },
    { id: 'energy', label: '精力', emoji: '⚡' },
    { id: 'sleep', label: '睡眠', emoji: '😴' },
    { id: 'exercise', label: '运动', emoji: '🏃‍♀️' },
    { id: 'meal', label: '饮食', emoji: '🥗' },
    { id: 'symptom', label: '症状', emoji: '🤒' },
    { id: 'bowel', label: '排便', emoji: '🚽' },
    { id: 'weight', label: '体重', emoji: '⚖️' },
  ];

  const energyOptions = [
    { id: 'high', label: '充沛', emoji: '⚡', color: '#27AE60' },
    { id: 'normal', label: '正常', emoji: '😊', color: '#3498DB' },
    { id: 'low', label: '疲惫', emoji: '😴', color: '#E74C3C' },
  ];

  const sleepQualityOptions = [
    { id: 'good', label: '好', emoji: '😊' },
    { id: 'normal', label: '一般', emoji: '😐' },
    { id: 'poor', label: '差', emoji: '😫' },
  ];

  const handleSelectMood = (moodId) => {
    setRecordData(prev => ({ ...prev, mood: moodId }));
  };

  const handleSelectEnergy = (energyId) => {
    setRecordData(prev => ({ ...prev, energy: energyId }));
  };

  const handleSelectBowel = (bowelId) => {
    setRecordData(prev => ({ ...prev, bowel: bowelId }));
  };

  const handleToggleExercise = (exerciseId) => {
    setRecordData(prev => {
      const exercises = prev.exercises.includes(exerciseId)
        ? prev.exercises.filter(e => e !== exerciseId)
        : [...prev.exercises, exerciseId];
      return { ...prev, exercises };
    });
  };

  const handleToggleMeal = (mealId) => {
    setRecordData(prev => {
      const meals = prev.meals.includes(mealId)
        ? prev.meals.filter(m => m !== mealId)
        : [...prev.meals, mealId];
      return { ...prev, meals };
    });
  };

  const handleToggleSymptom = (symptomId) => {
    setRecordData(prev => {
      const symptoms = prev.symptoms.includes(symptomId)
        ? prev.symptoms.filter(s => s !== symptomId)
        : [...prev.symptoms, symptomId];
      return { ...prev, symptoms };
    });
  };

  const handleSave = () => {
    const record = {
      id: Date.now(),
      date: selectedDate,
      ...recordData,
      phase: currentPhase?.phase || null,
      createdAt: new Date().toISOString(),
    };

    // 如果已有当天记录，更新它
    setDailyRecords(prev => {
      const filtered = prev.filter(r => r.date !== selectedDate);
      return [...filtered, record];
    });

    setShowAddModal(false);
    // 重置表单
    setRecordData({
      mood: null,
      energy: null,
      sleep: { hours: '', quality: '' },
      exercises: [],
      meals: [],
      symptoms: [],
      bowel: null,
      weight: '',
      notes: '',
    });
  };

  const handleDeleteRecord = (id) => {
    if (confirm('确定要删除这条记录吗？')) {
      setDailyRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  // 获取选中心情的详情
  const getMoodDetail = (moodId) => customOptions.moods.find(m => m.id === moodId);
  const getBowelDetail = (bowelId) => customOptions.bowel.find(b => b.id === bowelId);

  return (
    <div className="page daily-page">
      {/* 日期选择 */}
      <section className="section date-section">
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          max={format(new Date(), 'yyyy-MM-dd')}
          className="date-picker"
        />
        {phaseInfo && (
          <div className="current-phase-hint" style={{ color: phaseInfo.color }}>
            {phaseInfo.emoji} {phaseInfo.name}
          </div>
        )}
      </section>

      {/* 今日记录状态 */}
      {todayRecord ? (
        <section className="section today-record">
          <h3 className="section-title">今日已记录</h3>
          <div className="record-summary">
            {todayRecord.mood && (
              <div className="summary-item">
                <span className="summary-emoji">{getMoodDetail(todayRecord.mood)?.emoji}</span>
                <span>{getMoodDetail(todayRecord.mood)?.label}</span>
              </div>
            )}
            {todayRecord.energy && (
              <div className="summary-item">
                <span className="summary-emoji">{energyOptions.find(e => e.id === todayRecord.energy)?.emoji}</span>
                <span>{energyOptions.find(e => e.id === todayRecord.energy)?.label}</span>
              </div>
            )}
            {todayRecord.weight && (
              <div className="summary-item">
                <span className="summary-emoji">⚖️</span>
                <span>{todayRecord.weight} kg</span>
              </div>
            )}
            {todayRecord.exercises?.length > 0 && (
              <div className="summary-item">
                <span className="summary-emoji">🏃‍♀️</span>
                <span>{todayRecord.exercises.length} 项运动</span>
              </div>
            )}
          </div>
          <div className="record-actions">
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              修改记录
            </button>
            <button className="btn btn-secondary" onClick={() => handleDeleteRecord(todayRecord.id)}>
              删除
            </button>
          </div>
        </section>
      ) : (
        <section className="section add-record">
          <button className="btn btn-primary btn-large btn-block" onClick={() => setShowAddModal(true)}>
            <Plus size={20} /> 添加今日记录
          </button>
        </section>
      )}

      {/* 最近记录 */}
      <section className="section recent-records">
        <h3 className="section-title">最近记录</h3>
        {dailyRecords.length > 0 ? (
          <div className="records-list">
            {[...dailyRecords]
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 7)
              .map(record => (
                <div key={record.id} className="record-item">
                  <div className="record-date">
                    {format(new Date(record.date), 'M/d')}
                  </div>
                  <div className="record-emojis">
                    {record.mood && <span>{getMoodDetail(record.mood)?.emoji}</span>}
                    {record.energy && <span>{energyOptions.find(e => e.id === record.energy)?.emoji}</span>}
                    {record.exercises?.length > 0 && <span>🏃‍♀️</span>}
                    {record.weight && <span>⚖️</span>}
                  </div>
                  <div className="record-phase">
                    {record.phase && cyclePhases[record.phase]?.emoji}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>还没有记录</p>
          </div>
        )}
      </section>

      {/* 添加记录弹窗 */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>记录 - {format(new Date(selectedDate), 'M月d日')}</h3>
              <button className="btn-close" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            {/* 分类标签 */}
            <div className="category-tabs">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>

            <div className="modal-content">
              {/* 心情 */}
              {activeCategory === 'mood' && (
                <div className="option-grid">
                  {customOptions.moods.map(mood => (
                    <button
                      key={mood.id}
                      className={`option-btn ${recordData.mood === mood.id ? 'selected' : ''}`}
                      style={{ borderColor: mood.color }}
                      onClick={() => handleSelectMood(mood.id)}
                    >
                      <span className="option-emoji">{mood.emoji}</span>
                      <span className="option-label">{mood.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* 精力 */}
              {activeCategory === 'energy' && (
                <div className="option-grid">
                  {energyOptions.map(energy => (
                    <button
                      key={energy.id}
                      className={`option-btn ${recordData.energy === energy.id ? 'selected' : ''}`}
                      style={{ borderColor: energy.color }}
                      onClick={() => handleSelectEnergy(energy.id)}
                    >
                      <span className="option-emoji">{energy.emoji}</span>
                      <span className="option-label">{energy.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* 睡眠 */}
              {activeCategory === 'sleep' && (
                <div className="sleep-input">
                  <div className="form-group">
                    <label>睡眠时长（小时）</label>
                    <input
                      type="number"
                      value={recordData.sleep.hours}
                      onChange={e => setRecordData(prev => ({
                        ...prev,
                        sleep: { ...prev.sleep, hours: e.target.value }
                      }))}
                      placeholder="7"
                      min="0"
                      max="24"
                    />
                  </div>
                  <div className="form-group">
                    <label>睡眠质量</label>
                    <div className="option-grid small">
                      {sleepQualityOptions.map(quality => (
                        <button
                          key={quality.id}
                          className={`option-btn ${recordData.sleep.quality === quality.id ? 'selected' : ''}`}
                          onClick={() => setRecordData(prev => ({
                            ...prev,
                            sleep: { ...prev.sleep, quality: quality.id }
                          }))}
                        >
                          <span>{quality.emoji}</span>
                          <span>{quality.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 运动 */}
              {activeCategory === 'exercise' && (
                <div className="option-grid multi">
                  {customOptions.exercises.map(exercise => (
                    <button
                      key={exercise.id}
                      className={`option-btn ${recordData.exercises.includes(exercise.id) ? 'selected' : ''}`}
                      onClick={() => handleToggleExercise(exercise.id)}
                    >
                      <span className="option-emoji">{exercise.emoji}</span>
                      <span className="option-label">{exercise.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* 饮食 */}
              {activeCategory === 'meal' && (
                <div className="option-grid multi">
                  {customOptions.meals.map(meal => (
                    <button
                      key={meal.id}
                      className={`option-btn ${recordData.meals.includes(meal.id) ? 'selected' : ''}`}
                      onClick={() => handleToggleMeal(meal.id)}
                    >
                      <span className="option-emoji">{meal.emoji}</span>
                      <span className="option-label">{meal.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* 症状 */}
              {activeCategory === 'symptom' && (
                <div className="option-grid multi">
                  {customOptions.symptoms.map(symptom => (
                    <button
                      key={symptom.id}
                      className={`option-btn ${recordData.symptoms.includes(symptom.id) ? 'selected' : ''}`}
                      onClick={() => handleToggleSymptom(symptom.id)}
                    >
                      <span className="option-emoji">{symptom.emoji}</span>
                      <span className="option-label">{symptom.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* 排便 */}
              {activeCategory === 'bowel' && (
                <div className="option-grid">
                  {customOptions.bowel.map(bowel => (
                    <button
                      key={bowel.id}
                      className={`option-btn ${recordData.bowel === bowel.id ? 'selected' : ''}`}
                      onClick={() => handleSelectBowel(bowel.id)}
                    >
                      <span className="option-emoji">{bowel.emoji}</span>
                      <span className="option-label">{bowel.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* 体重 */}
              {activeCategory === 'weight' && (
                <div className="weight-input">
                  <div className="form-group">
                    <label>今日体重（kg）</label>
                    <input
                      type="number"
                      value={recordData.weight}
                      onChange={e => setRecordData(prev => ({ ...prev, weight: e.target.value }))}
                      placeholder="55.0"
                      step="0.1"
                    />
                  </div>
                  <div className="form-group">
                    <label>备注</label>
                    <textarea
                      value={recordData.notes}
                      onChange={e => setRecordData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="记录今天的特殊情况..."
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary btn-block" onClick={handleSave}>
                <Save size={16} /> 保存记录
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
