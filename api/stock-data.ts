import type { VercelRequest, VercelResponse } from '@vercel/node';

interface WeekData {
  startDate: string;
  endDate: string;
  open: number;
  high: number;
  low: number;
  close: number;
  changeRate: number;
}

interface StockResult {
  code: string;
  name: string;
  weeks: WeekData[];
}

async function fetchYahooChart(symbol: string, startUnix: number, endUnix: number) {
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${startUnix}&period2=${endUnix}&interval=1d`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; stock-simulator/1.0)' },
  });

  if (!res.ok) throw new Error(`Yahoo Finance API error: ${res.status}`);

  const data = await res.json();
  const result = data?.chart?.result?.[0];
  if (!result) throw new Error(`No data for ${symbol}`);

  const timestamps: number[] = result.timestamp || [];
  const quote = result.indicators?.quote?.[0] || {};
  const meta = result.meta || {};

  const days = timestamps.map((ts: number, i: number) => ({
    date: new Date(ts * 1000).toISOString().slice(0, 10),
    open: Math.round(quote.open?.[i] || 0),
    high: Math.round(quote.high?.[i] || 0),
    low: Math.round(quote.low?.[i] || 0),
    close: Math.round(quote.close?.[i] || 0),
  })).filter((d: { close: number }) => d.close > 0);

  return { days, name: meta.shortName || meta.symbol || symbol };
}

function splitIntoWeeks(days: { date: string; open: number; high: number; low: number; close: number }[], numWeeks: number): WeekData[] {
  if (days.length === 0) return [];

  const daysPerWeek = Math.max(1, Math.floor(days.length / numWeeks));
  const weeks: WeekData[] = [];

  for (let i = 0; i < numWeeks; i++) {
    const startIdx = i * daysPerWeek;
    const endIdx = i < numWeeks - 1 ? startIdx + daysPerWeek : days.length;
    const weekDays = days.slice(startIdx, endIdx);

    if (weekDays.length === 0) continue;

    const open = weekDays[0].open;
    const close = weekDays[weekDays.length - 1].close;
    const high = Math.max(...weekDays.map((d) => d.high));
    const low = Math.min(...weekDays.map((d) => d.low));
    const changeRate = open > 0 ? Math.round(((close - open) / open) * 10000) / 10000 : 0;

    weeks.push({
      startDate: weekDays[0].date,
      endDate: weekDays[weekDays.length - 1].date,
      open, high, low, close, changeRate,
    });
  }

  return weeks;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { codes, start, end, weeks: weeksParam } = req.query;

    if (!codes || !start || !end) {
      return res.status(400).json({ error: 'codes, start, end 파라미터가 필요합니다.' });
    }

    const stockCodes = (codes as string).split(',').map((c) => c.trim());
    const numWeeks = parseInt(weeksParam as string) || 6;
    const startDate = new Date(start as string);
    const endDate = new Date(end as string);
    const startUnix = Math.floor(startDate.getTime() / 1000);
    const endUnix = Math.floor(endDate.getTime() / 1000);

    const results: Record<string, StockResult> = {};

    for (const code of stockCodes) {
      const symbol = code.includes('.') ? code : `${code}.KS`;
      try {
        const { days, name } = await fetchYahooChart(symbol, startUnix, endUnix);
        const weeks = splitIntoWeeks(days, numWeeks);
        results[code] = { code, name, weeks };
      } catch (err) {
        results[code] = { code, name: code, weeks: [] };
      }
    }

    return res.status(200).json({ stocks: results, start: start as string, end: end as string, weeks: numWeeks });
  } catch (err) {
    return res.status(500).json({ error: '데이터 수집 중 오류가 발생했습니다.' });
  }
}
