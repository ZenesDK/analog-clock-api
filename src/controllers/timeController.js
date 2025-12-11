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
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });
    const parts = formatter.formatToParts(now);
    const timeObj = {};
    parts.forEach(part => {
      if (part.type === 'hour' || part.type === 'minute' || part.type === 'second') {
        timeObj[part.type] = parseInt(part.value, 10);
      }
    });

    const hourAngle = (timeObj.hour % 12) * 30 + timeObj.minute * 0.5;
    const minuteAngle = timeObj.minute * 6 + timeObj.second * 0.1;
    const secondAngle = timeObj.second * 6;

    res.json({
      timezone: tz,
      time: timeObj,
      angles: {
        hour: hourAngle.toFixed(2),
        minute: minuteAngle.toFixed(2),
        second: secondAngle.toFixed(2)
      }
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid timezone' });
  }
};

module.exports = {
  getCurrentTime,
  getTimeByTimezone
};
