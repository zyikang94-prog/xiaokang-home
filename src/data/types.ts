// 家庭财产数据模型
// EXPORTS: IIncome, IExpense, ExpenseKind, IFixedAsset, ICashAsset, IInvestment, ILiability

/** 支出大类：固定 / 生活 / 额外 */
export type ExpenseKind = 'fixed' | 'life' | 'extra';

/** 家庭收入（按月记录） */
export interface IIncome {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  category: string; // 收入来源
  note?: string;
}

/** 家庭支出（按月记录） */
export interface IExpense {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  kind: ExpenseKind;
  category: string; // 子分类
  note?: string;
}

/** 固定资产：房产 / 汽车 */
export interface IFixedAsset {
  id: string;
  type: 'property' | 'car';
  name: string;
  cost: number; // 购置成本
  value: number; // 当前估值
  purchaseDate?: string;
  note?: string;
}

/** 现金类：移动现金 / 银行存款 */
export interface ICashAsset {
  id: string;
  type: 'cash' | 'deposit';
  name: string;
  amount: number; // 当前余额
  principal: number; // 投入本金
  interestRate?: number; // 存款年利率（%）
  note?: string;
}

/** 投资类：股票 / ETF */
export interface IInvestment {
  id: string;
  type: 'stock' | 'etf';
  name: string;
  code: string; // 行情代码，如 sh600900 / sz000651
  shares: number; // 持有份额
  cost: number; // 每股成本（持仓总成本 = 份额 × 每股成本）
  currentPrice: number; // 当前价 / 单位净值
  note?: string;
}

/** 贵金属：黄金 / 白银 / 铂金 / 其他 */
export interface IMetal {
  id: string;
  type: 'gold' | 'silver' | 'platinum' | 'other';
  name: string;
  weight: number; // 克数
  cost: number; // 每克成本（元/克）
  currentPrice: number; // 当前每克价（元/克）
  note?: string;
}

/** 负债：房贷 / 车贷 / 信用卡 / 消费贷 / 其他 */
export interface ILiability {
  id: string;
  type: 'mortgage' | 'carloan' | 'creditcard' | 'consumer' | 'other';
  name: string;
  balance: number; // 剩余欠款
  monthlyPayment?: number; // 每月还款
  note?: string;
}

/** 净资产 / 总资产 / 现金资产月度快照（用于历年趋势） */
export interface INetWorthSnapshot {
  id: string;
  month: string; // YYYY-MM
  date: string; // YYYY-MM-DD
  totalAssets: number;
  netWorth: number;
  cashTotal: number;
}

/** 全部数据（用于备份/导入） */
export interface IBackup {
  version: number;
  exportedAt: string;
  app: string;
  incomes: IIncome[];
  expenses: IExpense[];
  fixedAssets: IFixedAsset[];
  cashAssets: ICashAsset[];
  investments: IInvestment[];
  metals: IMetal[];
  liabilities: ILiability[];
  snapshots: INetWorthSnapshot[];
}
