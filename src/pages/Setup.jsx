import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateBMR, calculateTDEE, calculateAge } from '../utils/cycleCalculations';
import { activityLevels } from '../data/defaultOptions';

export default function Setup({ userInfo, setUserInfo }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: userInfo?.name || '',
    birthday: userInfo?.birthday || '',
    height: userInfo?.height || '',
    weight: userInfo?.weight || '',
    activityLevel: userInfo?.activityLevel || 'moderate',
    averageCycleLength: userInfo?.averageCycleLength || 28,
    averagePeriodLength: userInfo?.averagePeriodLength || 5,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = '请输入昵称';
    if (!formData.birthday) newErrors.birthday = '请选择生日';
    if (!formData.height || formData.height < 100 || formData.height > 250) {
      newErrors.height = '请输入有效身高 (100-250cm)';
    }
    if (!formData.weight || formData.weight < 30 || formData.weight > 200) {
      newErrors.weight = '请输入有效体重 (30-200kg)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    const age = calculateAge(formData.birthday);
    const bmr = calculateBMR(Number(formData.weight), Number(formData.height), age);
    const activityMultiplier = activityLevels.find(a => a.id === formData.activityLevel)?.multiplier || 1.55;
    const tdee = calculateTDEE(bmr, activityMultiplier);

    const newUserInfo = {
      ...formData,
      age,
      bmr,
      tdee,
      activityMultiplier,
      setupCompleted: true,
    };

    setUserInfo(newUserInfo);
    navigate('/');
  };

  return (
    <div className="page setup-page">
      <div className="setup-header">
        <h2>个人信息设置</h2>
        <p>设置你的基础信息，我们将为你计算基础代谢率</p>
      </div>

      <form onSubmit={handleSubmit} className="setup-form">
        <div className="form-group">
          <label htmlFor="name">昵称</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="请输入昵称"
          />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="birthday">生日</label>
          <input
            type="date"
            id="birthday"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
          />
          {errors.birthday && <span className="error">{errors.birthday}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="height">身高 (cm)</label>
            <input
              type="number"
              id="height"
              name="height"
              value={formData.height}
              onChange={handleChange}
              placeholder="165"
            />
            {errors.height && <span className="error">{errors.height}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="weight">体重 (kg)</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder="55"
              step="0.1"
            />
            {errors.weight && <span className="error">{errors.weight}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="activityLevel">活动量</label>
          <select
            id="activityLevel"
            name="activityLevel"
            value={formData.activityLevel}
            onChange={handleChange}
          >
            {activityLevels.map(level => (
              <option key={level.id} value={level.id}>
                {level.label} - {level.description}
              </option>
            ))}
          </select>
        </div>

        <div className="form-divider">
          <span>周期设置</span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="averageCycleLength">平均周期 (天)</label>
            <input
              type="number"
              id="averageCycleLength"
              name="averageCycleLength"
              value={formData.averageCycleLength}
              onChange={handleChange}
              min="21"
              max="35"
            />
            <span className="hint">正常范围：21-35天</span>
          </div>

          <div className="form-group">
            <label htmlFor="averagePeriodLength">平均经期 (天)</label>
            <input
              type="number"
              id="averagePeriodLength"
              name="averagePeriodLength"
              value={formData.averagePeriodLength}
              onChange={handleChange}
              min="2"
              max="8"
            />
            <span className="hint">正常范围：2-8天</span>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-large btn-block">
          保存设置
        </button>
      </form>
    </div>
  );
}
