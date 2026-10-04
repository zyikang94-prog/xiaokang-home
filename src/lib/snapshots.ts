import { genId, kvGet, kvSet } from '@/lib/store';
import { STORAGE_KEYS } from '@/data/constants';
import type {
  ICashAsset,
  IFixedAsset,
  IInvestment,
  IMetal,
  ILiability,
  INetWorthSnapshot,
} from '@/data/types';
import { currentMonthKey, todayStr } from '@/lib/format';
import { summarize } from '@/lib/finance';

/**
 * 记录 / 更新当月的资产快照（按月份去重）。
 * 每次打开总览或资产发生变更时调用：当月反映最新，历史月份冻结为当月最后一次值。
 * 幂等：同一月份重复调用结果一致。
 */
export function recordSnapshot(): INetWorthSnapshot[] {
  const s = summarize(
    kvGet<IFixedAsset[]>(STORAGE_KEYS.fixedAssets, []),
    kvGet<ICashAsset[]>(STORAGE_KEYS.cashAssets, []),
    kvGet<IInvestment[]>(STORAGE_KEYS.investments, []),
    kvGet<IMetal[]>(STORAGE_KEYS.metals, []),
    kvGet<ILiability[]>(STORAGE_KEYS.liabilities, []),
  );
  const month = currentMonthKey();
  const snaps = kvGet<INetWorthSnapshot[]>(STORAGE_KEYS.snapshots, []);
  const idx = snaps.findIndex((x) => x.month === month);
  const snap: INetWorthSnapshot = {
    id: idx >= 0 ? snaps[idx].id : genId(),
    month,
    date: todayStr(),
    totalAssets: s.totalAssets,
    netWorth: s.netWorth,
    cashTotal: s.cashTotal,
  };
  if (idx >= 0) snaps[idx] = snap;
  else snaps.push(snap);
  snaps.sort((a, b) => a.month.localeCompare(b.month));
  kvSet(STORAGE_KEYS.snapshots, snaps);
  return snaps;
}

export function getSnapshots(): INetWorthSnapshot[] {
  return kvGet<INetWorthSnapshot[]>(STORAGE_KEYS.snapshots, []);
}
