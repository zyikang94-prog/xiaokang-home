import type {
  ExpenseKind,
  ICashAsset,
  IExpense,
  IFixedAsset,
  IInvestment,
  IMetal,
  ILiability,
} from '@/data/types';
import { monthKey, yearOf } from './format';

export const sum = (arr: number[]): number => arr.reduce((a, b) => a + b, 0);

/** 某一部分的成本、现值、收益、收益率 */
export interface PartFinance {
  cost: number;
  value: number;
  gain: number;
  returnRate: number;
}

/** 家庭财务总览 */
export interface FinanceSummary {
  fixed: PartFinance; // 固定资产
  cash: PartFinance; // 现金+存款
  stock: PartFinance; // 股票
  etf: PartFinance; // ETF
  metal: PartFinance; // 贵金属
  fixedTotal: number;
  cashOnHand: number;
  depositTotal: number;
  stockMarketValue: number;
  etfMarketValue: number;
  metalTotal: number;
  cashTotal: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  totalCost: number;
  totalGain: number;
  totalReturnRate: number;
}

/** 持仓总成本（份额 × 每股成本） */
export function invCost(inv: IInvestment): number {
  return inv.shares * inv.cost;
}

export function invMarketValue(inv: IInvestment): number {
  return inv.shares * inv.currentPrice;
}

export function invGain(inv: IInvestment): number {
  return invMarketValue(inv) - invCost(inv);
}

export function invReturnRate(inv: IInvestment): number {
  const cost = invCost(inv);
  return cost > 0 ? invGain(inv) / cost : 0;
}

/** 贵金属总成本（克数 × 每克成本） */
export function metalCost(m: IMetal): number {
  return m.weight * m.cost;
}

export function metalMarketValue(m: IMetal): number {
  return m.weight * m.currentPrice;
}

export function metalGain(m: IMetal): number {
  return metalMarketValue(m) - metalCost(m);
}

export function metalReturnRate(m: IMetal): number {
  return m.cost > 0 ? (m.currentPrice - m.cost) / m.cost : 0;
}

function part(cost: number, value: number): PartFinance {
  return { cost, value, gain: value - cost, returnRate: cost > 0 ? (value - cost) / cost : 0 };
}

export function summarize(
  fixedAssets: IFixedAsset[],
  cashAssets: ICashAsset[],
  investments: IInvestment[],
  metals: IMetal[],
  liabilities: ILiability[],
): FinanceSummary {
  const fixedCost = sum(fixedAssets.map((f) => f.cost));
  const fixedTotal = sum(fixedAssets.map((f) => f.value));

  const cashOnHand = sum(cashAssets.filter((c) => c.type === 'cash').map((c) => c.amount));
  const cashPrincipal = sum(cashAssets.filter((c) => c.type === 'cash').map((c) => c.principal));
  const depositTotal = sum(cashAssets.filter((c) => c.type === 'deposit').map((c) => c.amount));
  const depositPrincipal = sum(
    cashAssets.filter((c) => c.type === 'deposit').map((c) => c.principal),
  );

  const stockMV = sum(
    investments.filter((i) => i.type === 'stock').map(invMarketValue),
  );
  const stockCost = sum(investments.filter((i) => i.type === 'stock').map(invCost));
  const etfMV = sum(investments.filter((i) => i.type === 'etf').map(invMarketValue));
  const etfCost = sum(investments.filter((i) => i.type === 'etf').map(invCost));

  const metalMV = sum(metals.map(metalMarketValue));
  const metalCostTotal = sum(metals.map(metalCost));

  const cashTotal = cashOnHand + depositTotal + stockMV + etfMV;
  const totalAssets = fixedTotal + cashTotal + metalMV;
  const totalLiabilities = sum(liabilities.map((l) => l.balance));
  const netWorth = totalAssets - totalLiabilities;

  const totalCost =
    fixedCost + cashPrincipal + depositPrincipal + stockCost + etfCost + metalCostTotal;
  const totalGain = totalAssets - totalCost;
  const totalReturnRate = totalCost > 0 ? totalGain / totalCost : 0;

  return {
    fixed: part(fixedCost, fixedTotal),
    cash: part(cashPrincipal + depositPrincipal, cashOnHand + depositTotal),
    stock: part(stockCost, stockMV),
    etf: part(etfCost, etfMV),
    metal: part(metalCostTotal, metalMV),
    fixedTotal,
    cashOnHand,
    depositTotal,
    stockMarketValue: stockMV,
    etfMarketValue: etfMV,
    metalTotal: metalMV,
    cashTotal,
    totalAssets,
    totalLiabilities,
    netWorth,
    totalCost,
    totalGain,
    totalReturnRate,
  };
}

/** 某年 12 个月的金额（初始化 0） */
export function monthlyTotals(
  items: Array<{ date: string; amount: number }>,
  year: string,
): Record<string, number> {
  const result: Record<string, number> = {};
  for (let m = 1; m <= 12; m += 1) {
    result[`${year}-${String(m).padStart(2, '0')}`] = 0;
  }
  for (const it of items) {
    const k = monthKey(it.date);
    if (k.startsWith(year)) result[k] = (result[k] ?? 0) + it.amount;
  }
  return result;
}

/** 按年汇总 */
export function yearlyTotals(
  items: Array<{ date: string; amount: number }>,
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const it of items) {
    const y = yearOf(it.date);
    result[y] = (result[y] ?? 0) + it.amount;
  }
  return result;
}

/** 某年三大类支出合计 */
export function expenseByKind(items: IExpense[], year: string): Record<ExpenseKind, number> {
  const result: Record<ExpenseKind, number> = { fixed: 0, life: 0, extra: 0 };
  for (const it of items) {
    if (it.date.startsWith(year)) result[it.kind] += it.amount;
  }
  return result;
}
