import { differenceInDays, addDays, format, parseISO, startOfDay } from 'date-fns';

// 计算基础代谢率 (Mifflin-St Jeor公式)
export function calculateBMR(weight, height, age) {
  // 女性公式: BMR = 10 × 体重 + 6.25 × 身高 - 5 × 年龄 - 161
  return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
}

// 计算每日总消耗 (TDEE)
export function calculateTDEE(bmr, activityMultiplier) {
  return Math.round(bmr * activityMultiplier);
}

// 根据生日计算年龄
export function calculateAge(birthday) {
  const today = new Date();
  const birthDate = new Date(birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// 获取当前周期阶段
export function getCurrentPhase(cycleRecords, averageCycleLength = 28) {
  if (!cycleRecords || cycleRecords.length === 0) {
    return null;
  }

  // 按日期排序，最新的在前
  const sortedRecords = [...cycleRecords].sort((a, b) => 
    new Date(b.startDate) - new Date(a.startDate)
  );

  const lastPeriod = sortedRecords[0];
  const periodStartDate = parseISO(lastPeriod.startDate);
  const today = startOfDay(new Date());
  
  // 计算当前周期天数
  const daysSinceLastPeriod = differenceInDays(today, periodStartDate) + 1;
  
  // 计算平均周期长度
  const avgCycle = calculateAverageCycleLength(cycleRecords) || averageCycleLength;
  
  // 计算平均经期长度
  const avgPeriodLength = calculateAveragePeriodLength(cycleRecords) || 5;

  // 判断当前阶段
  if (daysSinceLastPeriod <= avgPeriodLength) {
    return {
      phase: 'menstrual',
      dayOfCycle: daysSinceLastPeriod,
      daysUntilNextPeriod: avgCycle - daysSinceLastPeriod + 1,
    };
  } else if (daysSinceLastPeriod <= 13) {
    return {
      phase: 'follicular',
      dayOfCycle: daysSinceLastPeriod,
      daysUntilNextPeriod: avgCycle - daysSinceLastPeriod + 1,
    };
  } else if (daysSinceLastPeriod <= 16) {
    return {
      phase: 'ovulation',
      dayOfCycle: daysSinceLastPeriod,
      daysUntilNextPeriod: avgCycle - daysSinceLastPeriod + 1,
    };
  } else {
    return {
      phase: 'luteal',
      dayOfCycle: daysSinceLastPeriod,
      daysUntilNextPeriod: avgCycle - daysSinceLastPeriod + 1,
    };
  }
}

// 计算平均周期长度
export function calculateAverageCycleLength(cycleRecords) {
  if (!cycleRecords || cycleRecords.length < 2) {
    return null;
  }

  const sortedRecords = [...cycleRecords].sort((a, b) => 
    new Date(a.startDate) - new Date(b.startDate)
  );

  let totalDays = 0;
  for (let i = 1; i < sortedRecords.length; i++) {
    const diff = differenceInDays(
      parseISO(sortedRecords[i].startDate),
      parseISO(sortedRecords[i - 1].startDate)
    );
    totalDays += diff;
  }

  return Math.round(totalDays / (sortedRecords.length - 1));
}

// 计算平均经期长度
export function calculateAveragePeriodLength(cycleRecords) {
  if (!cycleRecords || cycleRecords.length === 0) {
    return null;
  }

  const totalDays = cycleRecords.reduce((sum, record) => {
    return sum + (record.duration || 5);
  }, 0);

  return Math.round(totalDays / cycleRecords.length);
}

// 预测下次经期
export function predictNextPeriod(cycleRecords, averageCycleLength = 28) {
  if (!cycleRecords || cycleRecords.length === 0) {
    return null;
  }

  const sortedRecords = [...cycleRecords].sort((a, b) => 
    new Date(b.startDate) - new Date(a.startDate)
  );

  const lastPeriod = sortedRecords[0];
  const avgCycle = calculateAverageCycleLength(cycleRecords) || averageCycleLength;
  
  const nextPeriodDate = addDays(parseISO(lastPeriod.startDate), avgCycle);
  
  return {
    date: nextPeriodDate,
    formatted: format(nextPeriodDate, 'yyyy-MM-dd'),
    displayDate: format(nextPeriodDate, 'M月d日'),
  };
}

// 预测排卵日
export function predictOvulation(cycleRecords, averageCycleLength = 28) {
  if (!cycleRecords || cycleRecords.length === 0) {
    return null;
  }

  const sortedRecords = [...cycleRecords].sort((a, b) => 
    new Date(b.startDate) - new Date(a.startDate)
  );

  const lastPeriod = sortedRecords[0];
  const avgCycle = calculateAverageCycleLength(cycleRecords) || averageCycleLength;
  
  // 排卵通常在下次月经前14天
  const ovulationDate = addDays(parseISO(lastPeriod.startDate), avgCycle - 14);
  
  return {
    date: ovulationDate,
    formatted: format(ovulationDate, 'yyyy-MM-dd'),
    displayDate: format(ovulationDate, 'M月d日'),
  };
}

// 获取周期日历数据
export function getCycleCalendarData(cycleRecords, year, month) {
  const calendarData = {};
  
  cycleRecords.forEach(record => {
    const startDate = parseISO(record.startDate);
    const duration = record.duration || 5;
    
    for (let i = 0; i < duration; i++) {
      const date = format(addDays(startDate, i), 'yyyy-MM-dd');
      calendarData[date] = 'period';
    }
  });

  return calendarData;
}

// 格式化日期显示
export function formatDateDisplay(dateString) {
  return format(parseISO(dateString), 'M月d日');
}
