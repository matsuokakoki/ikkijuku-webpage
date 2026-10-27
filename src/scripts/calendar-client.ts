import { fetchClosures, monthPeriod, parseClosures, type Closures } from '../lib/closures';
const TTL = 5 * 60 * 1000;
for (const calendar of document.querySelectorAll<HTMLElement>('[data-live-calendar]')) {
  const month = calendar.dataset.month!;
  const status = calendar.querySelector<HTMLElement>('[data-calendar-status]')!;
  const period = monthPeriod(month);
  const key = 'ikkijuku:closures:v1:' + month;
  let lastTime = Date.parse(calendar.dataset.fetchedAt || '') || 0;
  let busy = false;
  function paint(data: Closures) {
    const rows = new Map(data.closures.map((x) => [x.date, x.reason]));
    for (const cell of calendar.querySelectorAll<HTMLElement>('[data-date]')) {
      const date = cell.dataset.date!;
      const closed = rows.has(date);
      cell.classList.toggle('closed', closed);
      const label = cell.querySelector<HTMLElement>('[data-closure-label]')!;
      label.textContent = closed
        ? rows.get(date) || '休講'
        : cell.classList.contains('sunday')
          ? '定休日'
          : '';
    }
  }
  function readCache() {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || 'null');
      if (
        !saved ||
        !Number.isFinite(saved.time) ||
        saved.time > Date.now() + 60000 ||
        saved.time < lastTime
      )
        return;
      const data = parseClosures(saved.data, period.from, period.to);
      lastTime = saved.time;
      paint(data);
    } catch {
      /* Public cache is optional; never replace valid HTML with bad cache data. */
    }
  }
  function displayTime() {
    status.textContent =
      '最終確認：' +
      new Date(lastTime).toLocaleString('ja-JP', {
        timeZone: 'Asia/Tokyo',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    status.classList.remove('calendar-warning');
  }
  async function refresh(force = false) {
    if (busy || document.hidden) return;
    if (!force && lastTime && Date.now() - lastTime < TTL) {
      displayTime();
      return;
    }
    busy = true;
    try {
      const data = await fetchClosures(month);
      paint(data);
      lastTime = Date.now();
      displayTime();
      try {
        localStorage.setItem(key, JSON.stringify({ time: lastTime, data }));
      } catch {
        /* Private browsing / full storage must not break the calendar. */
      }
    } catch {
      status.textContent = '最新情報を確認できませんでした。前回確認した休講日を表示しています。';
      status.classList.add('calendar-warning');
    } finally {
      busy = false;
    }
  }
  readCache();
  // A freshly built page is already a successful fetch; respect the five-minute cache.
  void refresh();
  const timer = window.setInterval(() => void refresh(), TTL);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) void refresh();
  });
  window.addEventListener('online', () => void refresh(true));
  window.addEventListener('pagehide', () => window.clearInterval(timer), { once: true });
}
