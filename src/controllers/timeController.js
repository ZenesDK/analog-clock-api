const getCurrentTime = (req, res) => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const hourAngle = (hours % 12) * 30 + minutes * 0.5;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const secondAngle = seconds * 6;

  res.json({
    time: {
      hours,
      minutes,
      seconds
    },
    angles: {
      hour: hourAngle.toFixed(2),
      minute: minuteAngle.toFixed(2),
      second: secondAngle.toFixed(2)
    },
    timestamp: now.toISOString()
  });
};

const getTimeByTimezone = (req, res) => {
  const tz = req.query.tz || 'UTC';
  try {
    const now = new Date();
    
    // Форматируем время для отображения
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const timeString = formatter.format(now);
    
    // Получаем числовые значения времени
    const timeParts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    }).formatToParts(now);
    
    const timeObj = {};
    timeParts.forEach(part => {
      if (part.type === 'hour') timeObj.hours = parseInt(part.value, 10);
      if (part.type === 'minute') timeObj.minutes = parseInt(part.value, 10);
      if (part.type === 'second') timeObj.seconds = parseInt(part.value, 10);
    });

    // Рассчитываем углы
    const hourAngle = (timeObj.hours % 12) * 30 + timeObj.minutes * 0.5;
    const minuteAngle = timeObj.minutes * 6 + timeObj.seconds * 0.1;
    const secondAngle = timeObj.seconds * 6;

    res.json({
      timezone: tz,
      time: {
        hours: timeObj.hours,
        minutes: timeObj.minutes,
        seconds: timeObj.seconds
      },
      angles: {
        hour: hourAngle.toFixed(2),
        minute: minuteAngle.toFixed(2),
        second: secondAngle.toFixed(2)
      },
      formattedTime: timeString,
      timezoneInfo: `Часовой пояс: ${tz}`
    });
  } catch (error) {
    console.error('Timezone error:', error.message);
    res.status(400).json({ 
      error: 'Неверный часовой пояс',
      message: 'Используйте формат: Континент/Город (например: Europe/Moscow)',
      suggested: ['Europe/Moscow', 'America/New_York', 'Asia/Tokyo', 'UTC']
    });
  }
};

const getAllTimezones = (req, res) => {
  try {
    const timezones = Intl.supportedValuesOf('timeZone');
    const popularTimezones = [
      'Europe/Moscow',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'America/New_York',
      'America/Chicago',
      'America/Los_Angeles',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Australia/Sydney',
      'UTC'
    ];
    
    res.json({
      count: timezones.length,
      popular: popularTimezones,
      allTimezones: timezones.sort()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get timezones' });
  }
};

module.exports = {
  getCurrentTime,
  getTimeByTimezone,
  getAllTimezones
};