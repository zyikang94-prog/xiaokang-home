// 行情一键刷新（通过动态 script 加载腾讯行情，绕过 CORS；需联网）
import { GOLD_QUOTE_CODE } from '@/data/constants';

/** 将 6 位代码补全为带交易所前缀的代码（6/5 开头沪市，0/1/3 开头深市） */
export function normalizeCode(code: string): string {
  const c = code.trim().toLowerCase();
  if (c.startsWith('sh') || c.startsWith('sz')) return c;
  const head = c.charAt(0);
  if (head === '6' || head === '5') return `sh${c}`;
  return `sz${c}`;
}

/** 批量获取行情，返回 { 代码: 最新价 } */
export function fetchQuotes(codes: string[]): Promise<Record<string, number>> {
  const unique = [...new Set(codes.map(normalizeCode).filter(Boolean))];
  if (unique.length === 0) return Promise.resolve({});

  return new Promise((resolve, reject) => {
    const old = document.getElementById('quote-batch');
    if (old) old.remove();

    const s = document.createElement('script');
    s.id = 'quote-batch';
    s.src = `https://qt.gtimg.cn/q=${unique.join(',')}&t=${Date.now()}`;

    s.onload = () => {
      const w = window as unknown as Record<string, unknown>;
      const result: Record<string, number> = {};
      for (const code of unique) {
        const raw = w[`v_${code}`];
        if (typeof raw === 'string') {
          const parts = raw.split('~');
          const price = Number(parts[3]);
          if (Number.isFinite(price) && price > 0) result[code] = price;
        }
      }
      if (Object.keys(result).length > 0) resolve(result);
      else reject(new Error('未获取到行情，请检查代码'));
    };
    s.onerror = () => reject(new Error('行情请求失败，请检查网络'));
    document.head.appendChild(s);
  });
}

/** 获取人民币每克金价（黄金 ETF 每份约 0.01 克，金价 = 现价 × 100） */
export async function fetchGoldPrice(): Promise<number> {
  const quotes = await fetchQuotes([GOLD_QUOTE_CODE]);
  const price = quotes[normalizeCode(GOLD_QUOTE_CODE)];
  if (price > 0) return Math.round(price * 100 * 100) / 100;
  throw new Error('未获取到黄金价格');
}
