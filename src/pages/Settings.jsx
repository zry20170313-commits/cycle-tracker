import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit2, Save, X, User, List, Info } from 'lucide-react';
import { defaultCustomOptions } from '../data/defaultOptions';
import { activityLevels } from '../data/defaultOptions';
import { calculateBMR, calculateTDEE, calculateAge } from '../utils/cycleCalculations';

export default function Settings({ customOptions, setCustomOptions, userInfo, setUserInfo }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [editingCategory, setEditingCategory] = useState(null);
  const [newOption, setNewOption] = useState({ label: '', emoji: '' });
  const [showAddOption, setShowAddOption] = useState(null);

  const categoryLabels = {
    moods: '心情选项',
    exercises: '运动类型',
    meals: '饮食分类',
    symptoms: '症状选项',
    bowel: '排便状态',
  };

  const handleAddOption = (category) => {
    if (!newOption.label.trim()) return;
    
    const id = `custom_${Date.now()}`;
    const option = {
      id,
      label: newOption.label,
      emoji: newOption.emoji || '📝',
    };

    setCustomOptions(prev => ({
      ...prev,
      [category]: [...prev[category], option],
    }));

    setNewOption({ label: '', emoji: '' });
    setShowAddOption(null);
  };

  const handleDeleteOption = (category, optionId) => {
    if (confirm('确定要删除这个选项吗？')) {
      setCustomOptions(prev => ({
        ...prev,
        [category]: prev[category].filter(o => o.id !== optionId),
      }));
    }
  };

  const handleResetOptions = (category) => {
    if (confirm('确定要重置为默认选项吗？')) {
      setCustomOptions(prev => ({
        ...prev,
        [category]: defaultCustomOptions[category],
      }));
    }
  };

  const handleUpdateUserInfo = (field, value) => {
    const updated = { ...userInfo, [field]: value };
    
    // 如果更新了体重、身高或活动量，重新计算代谢
    if (['weight', 'height', 'activityLevel'].includes(field)) {
      const age = calculateAge(userInfo.birthday);
      updated.bmr = calculateBMR(
        field === 'weight' ? Number(value) : userInfo.weight,
        field === 'height' ? Number(value) : userInfo.height,
        age
      );
      const multiplier = field === 'activityLevel' 
        ? activityLevels.find(a => a.id === value)?.multiplier 
        : userInfo.activityMultiplier;
      updated.tdee = calculateTDEE(updated.bmr, multiplier);
      updated.activityMultiplier = multiplier;
    }
    
    setUserInfo(updated);
  };

  const handleDeleteAllData = () => {
    if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="page settings-page">
      {/* 标签切换 */}
      <div className="settings-tabs">
        <button 
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={18} /> 个人信息
        </button>
        <button 
          className={`tab ${activeTab === 'options' ? 'active' : ''}`}
          onClick={() => setActiveTab('options')}
        >
          <List size={18} /> 自定义选项
        </button>
      </div>

      {/* 个人信息设置 */}
      {activeTab === 'profile' && userInfo && (
        <section className="section profile-section">
          <div className="form-group">
            <label>昵称</label>
            <input
              type="text"
              value={userInfo.name || ''}
              onChange={e => handleUpdateUserInfo('name', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>生日</label>
            <input
              type="date"
              value={userInfo.birthday || ''}
              onChange={e => handleUpdateUserInfo('birthday', e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>身高 (cm)</label>
              <input
                type="number"
                value={userInfo.height || ''}
                onChange={e => handleUpdateUserInfo('height', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>体重 (kg)</label>
              <input
                type="number"
                value={userInfo.weight || ''}
                onChange={e => handleUpdateUserInfo('weight', e.target.value)}
                step="0.1"
              />
            </div>
          </div>

          <div className="form-group">
            <label>活动量</label>
            <select
              value={userInfo.activityLevel || 'moderate'}
              onChange={e => handleUpdateUserInfo('activityLevel', e.target.value)}
            >
              {activityLevels.map(level => (
                <option key={level.id} value={level.id}>
                  {level.label} - {level.description}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>平均周期 (天)</label>
              <input
                type="number"
                value={userInfo.averageCycleLength || 28}
                onChange={e => handleUpdateUserInfo('averageCycleLength', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>平均经期 (天)</label>
              <input
                type="number"
                value={userInfo.averagePeriodLength || 5}
                onChange={e => handleUpdateUserInfo('averagePeriodLength', e.target.value)}
              />
            </div>
          </div>

          {/* 代谢信息展示 */}
          <div className="metabolism-display">
            <h4>代谢计算结果</h4>
            <div className="metabolism-values">
              <div className="value-item">
                <span className="value">{userInfo.bmr}</span>
                <span className="label">BMR (kcal)</span>
              </div>
              <div className="value-item">
                <span className="value">{userInfo.tdee}</span>
                <span className="label">TDEE (kcal)</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 自定义选项设置 */}
      {activeTab === 'options' && (
        <section className="section options-section">
          <div className="options-info">
            <Info size={16} />
            <span>你可以自定义心情、运动、饮食等选项，添加你需要的内容</span>
          </div>

          {Object.entries(categoryLabels).map(([category, label]) => (
            <div key={category} className="option-category">
              <div className="category-header">
                <h4>{label}</h4>
                <div className="category-actions">
                  <button 
                    className="btn btn-small btn-secondary"
                    onClick={() => setShowAddOption(showAddOption === category ? null : category)}
                  >
                    <Plus size={14} /> 添加
                  </button>
                  <button 
                    className="btn btn-small btn-secondary"
                    onClick={() => handleResetOptions(category)}
                  >
                    重置
                  </button>
                </div>
              </div>

              {/* 添加新选项 */}
              {showAddOption === category && (
                <div className="add-option-form">
                  <input
                    type="text"
                    placeholder="选项名称"
                    value={newOption.label}
                    onChange={e => setNewOption(prev => ({ ...prev, label: e.target.value }))}
                  />
                  <input
                    type="text"
                    placeholder="emoji"
                    value={newOption.emoji}
                    onChange={e => setNewOption(prev => ({ ...prev, emoji: e.target.value }))}
                    className="emoji-input"
                  />
                  <button 
                    className="btn btn-small btn-primary"
                    onClick={() => handleAddOption(category)}
                  >
                    <Save size={14} />
                  </button>
                  <button 
                    className="btn btn-small btn-secondary"
                    onClick={() => {
                      setShowAddOption(null);
                      setNewOption({ label: '', emoji: '' });
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* 选项列表 */}
              <div className="options-list">
                {customOptions[category]?.map(option => (
                  <div key={option.id} className="option-item">
                    <span className="option-emoji">{option.emoji}</span>
                    <span className="option-label">{option.label}</span>
                    {!option.id.startsWith('custom_') && (
                      <span className="default-badge">默认</span>
                    )}
                    <button
                      className="btn-icon delete"
                      onClick={() => handleDeleteOption(category, option.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 数据管理 */}
      <section className="section data-section">
        <h3 className="section-title">数据管理</h3>
        <div className="data-actions">
          <button className="btn btn-secondary btn-block" onClick={() => {
            const data = {
              userInfo,
              cycleRecords: JSON.parse(localStorage.getItem('cycleRecords') || '[]'),
              dailyRecords: JSON.parse(localStorage.getItem('dailyRecords') || '[]'),
              customOptions,
              exportedAt: new Date().toISOString(),
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cycle-tracker-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
            a.click();
          }}>
            导出数据备份
          </button>
          <button className="btn btn-danger btn-block" onClick={handleDeleteAllData}>
            清除所有数据
          </button>
        </div>
      </section>

      {/* 关于 */}
      <section className="section about-section">
        <h3 className="section-title">关于</h3>
        <div className="about-content">
          <p><strong>周期伴侣</strong></p>
          <p>版本 1.0.0</p>
          <p className="about-desc">
            一款专为女性设计的生理周期追踪应用，帮助你了解自己的身体，追踪周期变化，获得个性化的健康建议。
          </p>
        </div>
      </section>
    </div>
  );
}

import { format } from 'date-fns';
