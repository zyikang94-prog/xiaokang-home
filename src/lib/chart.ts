// ECharts 用色（hex，避免 var()）；与主题 chart-1..5 对齐
export const CHART = {
  primary: '#356859',
  accent: '#C08A4A',
  green: '#7FA98C',
  brown: '#9C7A5B',
  red: '#B65C4B',
  gold: '#D9A441',
  up: '#C2483D',
  down: '#4E8D7C',
};

/** 通用 tooltip 金额格式 */
export const moneyAxisLabel = (v: number): string =>
  Math.abs(v) >= 10000 ? `${(v / 10000).toFixed(v % 10000 === 0 ? 0 : 1)}万` : `${v}`;
