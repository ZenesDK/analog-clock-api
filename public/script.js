async function fetchTime() {
  try {
    const res = await fetch('/api/time');
    const data = await res.json();
    updateClock(data);
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

async function fetchTimeByTimezone() {
  const tz = document.getElementById('timezone').value;
  if (!tz) {
    alert('Введите часовой пояс');
    return;
  }
  try {
    const res = await fetch(`/api/time/timezone?tz=${encodeURIComponent(tz)}`);
    const data = await res.json();
    if (data.error) {
      alert(data.error);
      return;
    }
    updateClock(data);
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

function updateClock(data) {
  const hourHand = document.getElementById('hour-hand');
  const minuteHand = document.getElementById('minute-hand');
  const secondHand = document.getElementById('second-hand');
  const timeText = document.getElementById('time-text');
  const anglesText = document.getElementById('angles-text');

  const { time, angles } = data;

  hourHand.style.transform = `translateX(-50%) rotate(${angles.hour}deg)`;
  minuteHand.style.transform = `translateX(-50%) rotate(${angles.minute}deg)`;
  secondHand.style.transform = `translateX(-50%) rotate(${angles.second}deg)`;

  timeText.textContent = `Время: ${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
  anglesText.textContent = `Углы: час ${angles.hour}°, минута ${angles.minute}°, секунда ${angles.second}°`;
}

fetchTime();
setInterval(fetchTime, 1000);
