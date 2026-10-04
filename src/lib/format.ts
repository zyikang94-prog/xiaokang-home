/** 货币、百分比、日期格式化 */

export function formatMoney(n: number, digits = 2): string {
  return (Number.isFinite(n) ? n : 0).toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** 以万元显示 */
export function formatWan(n: number): string {
  return `${formatMoney(n / 10000)} 万`;
}

/** 收益率（传入小数） */
export function formatPercent(n: number, digits = 2): string {
  return `${(Number.isFinite(n) ? n * 100 : 0).toFixed(digits)}%`;
}

/** 日期 -> 月键 YYYY-MM */
export function monthKey(date: string): string {
  return date.slice(0, 7);
}

/** 日期 -> 年 */
export function yearOf(date: string): string {
  return date.slice(0, 4);
}

/** 今天 YYYY-MM-DD */
export function todayStr(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** 当前月键 */
export function currentMonthKey(): string {
  return todayStr().slice(0, 7);
}

/** 当前年 */
export function currentYear(): string {
  return String(new Date().getFullYear());
}

/** 中文月份标签 2026-09 -> 2026年9月 */
export function monthLabel(key: string): string {
  const [y, m] = key.split('-');
  return `${y}年${Number(m)}月`;
}

/** 年标签 */
export function yearLabel(y: string): string {
  return `${y}年`;
}
