const DAY = 86400000;

function zonedParts(date, tz) {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const o = {};
  for (const p of f.formatToParts(date)) if (p.type !== 'literal') o[p.type] = Number(p.value);
  return o;
}

function offsetMs(date, tz) {
  const p = zonedParts(date, tz);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

function zonedMidnight(y, m, d, tz) {
  const guess = Date.UTC(y, m - 1, d);
  return new Date(guess - offsetMs(new Date(guess), tz));
}

export const startOfDay = (date, tz) => {
  const p = zonedParts(date, tz);
  return zonedMidnight(p.year, p.month, p.day, tz);
};
const startOfMonth = (date, tz) => {
  const p = zonedParts(date, tz);
  return zonedMidnight(p.year, p.month, 1, tz);
};
const startOfQuarter = (date, tz) => {
  const p = zonedParts(date, tz);
  return zonedMidnight(p.year, Math.floor((p.month - 1) / 3) * 3 + 1, 1, tz);
};
const startOfYear = (date, tz) => zonedMidnight(zonedParts(date, tz).year, 1, 1, tz);

function parseLocalDate(str, tz) {
  const guess = Date.parse(`${str}T00:00:00Z`);
  return new Date(guess - offsetMs(new Date(guess), tz));
}
const nextDay = (str) => new Date(Date.parse(`${str}T00:00:00Z`) + DAY).toISOString().slice(0, 10);

/** {$gte,$lt} for YYYY-MM-DD from/to (inclusive days) in the store timezone, or null. */
export function localDayRange(from, to, tz) {
  const r = {};
  if (from) r.$gte = parseLocalDate(from, tz);
  if (to) r.$lt = parseLocalDate(nextDay(to), tz);
  return Object.keys(r).length ? r : null;
}

/**
 * Resolves a named range into [start, end) plus the immediately preceding period of equal length.
 * Rolling ranges ("7d", "30d", "90d") are calendar days in the store timezone, including today.
 */
export function resolveRange({ range = '30d', from, to } = {}, tz = 'UTC') {
  const now = new Date();
  const today = startOfDay(now, tz);
  let start;
  let end = new Date(today.getTime() + DAY);
  switch (range) {
    case 'today': start = today; break;
    case '7d': start = new Date(today.getTime() - 6 * DAY); break;
    case '30d': start = new Date(today.getTime() - 29 * DAY); break;
    case '90d': start = new Date(today.getTime() - 89 * DAY); break;
    case 'month': start = startOfMonth(now, tz); break;
    case 'quarter': start = startOfQuarter(now, tz); break;
    case 'year': start = startOfYear(now, tz); break;
    case 'custom':
      start = parseLocalDate(from, tz);
      end = parseLocalDate(nextDay(to), tz);
      break;
    default: throw new Error(`Unknown range ${range}`);
  }
  const len = end.getTime() - start.getTime();
  const gran = range === 'today' ? 'hour' : len <= 92 * DAY ? 'day' : 'month';
  return { key: range, start, end, prevStart: new Date(start.getTime() - len), prevEnd: start, gran };
}

export const mongoFormat = { hour: '%Y-%m-%d %H', day: '%Y-%m-%d', month: '%Y-%m' };

export function bucketKey(date, tz, gran) {
  const p = zonedParts(date, tz);
  const pad = (n) => String(n).padStart(2, '0');
  if (gran === 'month') return `${p.year}-${pad(p.month)}`;
  const d = `${p.year}-${pad(p.month)}-${pad(p.day)}`;
  return gran === 'day' ? d : `${d} ${pad(p.hour)}`;
}

/** Every bucket key in the range (so charts show zeros instead of gaps). Future buckets are skipped. */
export function bucketKeys({ start, end, gran }, tz) {
  const stop = Math.min(end.getTime(), Date.now());
  const step = gran === 'hour' ? 3600e3 : gran === 'day' ? 6 * 3600e3 : DAY;
  const seen = new Set();
  const keys = [];
  for (let t = start.getTime(); t < stop; t += step) {
    const k = bucketKey(new Date(t), tz, gran);
    if (!seen.has(k)) { seen.add(k); keys.push(k); }
  }
  if (stop > start.getTime()) {
    const last = bucketKey(new Date(stop - 1), tz, gran);
    if (!seen.has(last)) keys.push(last);
  }
  return keys;
}

export const describeRange = (r, tz) => ({
  range: r.key,
  from: r.start.toISOString(),
  to: r.end.toISOString(),
  previousFrom: r.prevStart.toISOString(),
  previousTo: r.prevEnd.toISOString(),
  granularity: r.gran,
  timezone: tz,
});
