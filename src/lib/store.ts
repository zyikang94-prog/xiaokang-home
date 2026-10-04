import type { IBackup } from '@/data/types';
import { STORAGE_KEYS } from '@/data/constants';

const NS = 'xiaokang-home';

/** 读取（命名空间 + try/catch） */
export function kvGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${NS}:${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** 写入 */
export function kvSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(`${NS}:${key}`, JSON.stringify(value));
  } catch {
    /* 隐私模式 / 存储满，静默降级 */
  }
}

/** 生成 id（在事件回调中调用） */
export function genId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** 导出全部数据为对象 */
export function exportData(): IBackup {
  return {
    version: 1,
    app: '小康之家',
    exportedAt: new Date().toISOString(),
    incomes: kvGet(STORAGE_KEYS.incomes, []),
    expenses: kvGet(STORAGE_KEYS.expenses, []),
    fixedAssets: kvGet(STORAGE_KEYS.fixedAssets, []),
    cashAssets: kvGet(STORAGE_KEYS.cashAssets, []),
    investments: kvGet(STORAGE_KEYS.investments, []),
    metals: kvGet(STORAGE_KEYS.metals, []),
    liabilities: kvGet(STORAGE_KEYS.liabilities, []),
    snapshots: kvGet(STORAGE_KEYS.snapshots, []),
  };
}

/** 导入并覆盖全部数据 */
export function importData(data: IBackup): void {
  kvSet(STORAGE_KEYS.incomes, data.incomes ?? []);
  kvSet(STORAGE_KEYS.expenses, data.expenses ?? []);
  kvSet(STORAGE_KEYS.fixedAssets, data.fixedAssets ?? []);
  kvSet(STORAGE_KEYS.cashAssets, data.cashAssets ?? []);
  kvSet(STORAGE_KEYS.investments, data.investments ?? []);
  kvSet(STORAGE_KEYS.metals, data.metals ?? []);
  kvSet(STORAGE_KEYS.liabilities, data.liabilities ?? []);
  kvSet(STORAGE_KEYS.snapshots, data.snapshots ?? []);
}
