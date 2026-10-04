import type { ExpenseKind } from './types';

/** 本地存储 key */
export const STORAGE_KEYS = {
  incomes: 'incomes',
  expenses: 'expenses',
  fixedAssets: 'fixedAssets',
  cashAssets: 'cashAssets',
  investments: 'investments',
  metals: 'metals',
  liabilities: 'liabilities',
  snapshots: 'snapshots',
} as const;

/** 用于换算人民币每克金价的黄金 ETF（国泰黄金，每份约 0.01 克，金价 = 价格 × 100） */
export const GOLD_QUOTE_CODE = 'sh518800';

/** 收入来源默认分类 */
export const INCOME_CATEGORIES = ['工资', '奖金', '理财收益', '兼职', '公积金', '报销', '其他'];

/** 支出三大类 */
export const EXPENSE_KINDS: Record<ExpenseKind, { label: string; hint: string }> = {
  fixed: { label: '固定支出', hint: '房贷、车贷、保险、房租等每月固定' },
  life: { label: '生活支出', hint: '餐饮、购物、交通、日用品等日常' },
  extra: { label: '额外支出', hint: '人情、旅行、大件等非经常' },
};

/** 支出子分类（可自定义） */
export const EXPENSE_CATEGORIES: Record<ExpenseKind, string[]> = {
  fixed: ['房贷月供', '车贷月供', '房租', '保险', '物业', '话费宽带', '订阅会员', '其他固定'],
  life: ['餐饮', '生鲜食材', '购物', '交通', '水电燃气', '日用品', '医疗', '教育', '娱乐', '其他生活'],
  extra: ['人情往来', '旅行', '大件采购', '大额医疗', '红白喜事', '其他额外'],
};

export const FIXED_TYPES: Record<string, { label: string }> = {
  property: { label: '房产' },
  car: { label: '汽车' },
};

export const CASH_TYPES: Record<string, { label: string }> = {
  cash: { label: '移动现金' },
  deposit: { label: '银行存款' },
};

export const INVEST_TYPES: Record<string, { label: string }> = {
  stock: { label: '股票' },
  etf: { label: 'ETF基金' },
};

export const METAL_TYPES: Record<string, { label: string }> = {
  gold: { label: '黄金' },
  silver: { label: '白银' },
  platinum: { label: '铂金' },
  other: { label: '其他贵金属' },
};

export const LIABILITY_TYPES: Record<string, { label: string }> = {
  mortgage: { label: '房贷' },
  carloan: { label: '车贷' },
  creditcard: { label: '信用卡' },
  consumer: { label: '消费贷' },
  other: { label: '其他负债' },
};
