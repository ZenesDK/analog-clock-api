// Массив популярных часовых поясов для автодополнения
const popularTimezones = [
  'Europe/Moscow', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'America/New_York', 'America/Chicago', 'America/Los_Angeles',
  'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Dubai',
  'Australia/Sydney', 'Australia/Melbourne',
  'UTC', 'GMT'
];

let allTimezones = [];
let currentTimezone = null; // Текущий выбранный часовой пояс
let updateInterval = null; // Идентификатор интервала

// Загружаем все часовые пояса при загрузке страницы
async function loadAllTimezones() {
  try {
    const res = await fetch('/api/timezones');
    const data = await res.json();
    allTimezones = data.allTimezones || [];
  } catch (error) {
    console.error('Не удалось загрузить часовые пояса:', error);
    allTimezones = popularTimezones;
  }
}

// Основная функция получения времени
async function fetchTime(timezone = null) {
  try {
    let url = '/api/time';
    if (timezone) {
      url = `/api/time/timezone?tz=${encodeURIComponent(timezone)}`;
    }
    
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.error) {
      showError(data.message || data.error);
      return;
    }
    
    updateClock(data, timezone);
    hideError();
  } catch (error) {
    console.error('Ошибка:', error);
    showError('Не удалось получить время');
  }
}

// Функция для получения времени по часовому поясу
async function fetchTimeByTimezone() {
  const tz = document.getElementById('timezone').value.trim();
  if (!tz) {
    showError('Введите часовой пояс');
    return;
  }
  
  // Сохраняем выбранный часовой пояс
  currentTimezone = tz;
  
  // Останавливаем старый интервал
  if (updateInterval) {
    clearInterval(updateInterval);
  }
  
  // Запускаем новый интервал для обновления времени в выбранном поясе
  await fetchTime(tz);
  updateInterval = setInterval(() => fetchTime(tz), 1000);
}

// Функция для сброса на локальное время
function resetToLocalTime() {
  currentTimezone = null;
  
  // Останавливаем старый интервал
  if (updateInterval) {
    clearInterval(updateInterval);
  }
  
  // Запускаем обновление локального времени
  fetchTime();
  updateInterval = setInterval(fetchTime, 1000);
}

function updateClock(data, timezone = null) {
  const hourHand = document.getElementById('hour-hand');
  const minuteHand = document.getElementById('minute-hand');
  const secondHand = document.getElementById('second-hand');
  const timeText = document.getElementById('time-text');
  const anglesText = document.getElementById('angles-text');
  const timezoneText = document.getElementById('timezone-text');

  const { time, angles } = data;

  // Обновляем положение стрелок
  hourHand.style.transform = `translateX(-50%) rotate(${angles.hour}deg)`;
  minuteHand.style.transform = `translateX(-50%) rotate(${angles.minute}deg)`;
  secondHand.style.transform = `translateX(-50%) rotate(${angles.second}deg)`;

  // Форматируем время
  const timeStr = `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
  
  if (timezone) {
    timeText.textContent = `Время в ${timezone}: ${timeStr}`;
    timezoneText.textContent = `Часовой пояс: ${data.timezone || timezone}`;
  } else {
    timeText.textContent = `Локальное время: ${timeStr}`;
    timezoneText.textContent = 'Локальное время (ваш часовой пояс)';
  }
  
  anglesText.textContent = `Углы: час ${angles.hour}°, минута ${angles.minute}°, секунда ${angles.second}°`;
}

async function showAllTimezones() {
  const listDiv = document.getElementById('timezones-list');
  
  if (listDiv.style.display === 'block') {
    listDiv.style.display = 'none';
    return;
  }
  
  if (allTimezones.length === 0) {
    await loadAllTimezones();
  }
  
  let html = '<h4>Все часовые пояса (' + allTimezones.length + '):</h4>';
  html += '<button onclick="resetToLocalTime()" style="margin-bottom: 10px; padding: 8px 15px; background: #ff2e63;">Вернуться к локальному времени</button>';
  html += '<div style="column-count: 3; column-gap: 20px;">';
  
  allTimezones.forEach(tz => {
    html += `<div style="break-inside: avoid; margin-bottom: 5px;">
              <code>${tz}</code>
              <button onclick="setTimezone('${tz}')" style="margin-left: 10px; padding: 2px 8px; font-size: 0.8em;">Выбрать</button>
            </div>`;
  });
  
  html += '</div>';
  
  listDiv.innerHTML = html;
  listDiv.style.display = 'block';
}

function showSuggestions() {
  const input = document.getElementById('timezone').value.toLowerCase();
  const suggestionsDiv = document.getElementById('suggestions');
  
  if (!input) {
    suggestionsDiv.style.display = 'none';
    return;
  }
  
  // Ищем совпадения в популярных и всех часовых поясах
  const matches = [...popularTimezones, ...allTimezones]
    .filter(tz => tz.toLowerCase().includes(input))
    .filter((tz, index, self) => self.indexOf(tz) === index)
    .slice(0, 10);
  
  if (matches.length === 0) {
    suggestionsDiv.style.display = 'none';
    return;
  }
  
  let html = '';
  matches.forEach(tz => {
    html += `<div class="suggestion-item" onclick="selectSuggestion('${tz}')">${tz}</div>`;
  });
  
  suggestionsDiv.innerHTML = html;
  suggestionsDiv.style.display = 'block';
}

function selectSuggestion(tz) {
  document.getElementById('timezone').value = tz;
  document.getElementById('suggestions').style.display = 'none';
  fetchTimeByTimezone();
}

function setTimezone(tz) {
  document.getElementById('timezone').value = tz;
  fetchTimeByTimezone();
  document.getElementById('timezones-list').style.display = 'none';
}

function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

function hideError() {
  document.getElementById('error-message').style.display = 'none';
}

// Закрываем подсказки при клике вне поля
document.addEventListener('click', function(e) {
  if (!e.target.closest('.timezone-input')) {
    document.getElementById('suggestions').style.display = 'none';
  }
});

// Инициализация при загрузке страницы
window.onload = function() {
  loadAllTimezones();
  resetToLocalTime(); // Начинаем с локального времени
};