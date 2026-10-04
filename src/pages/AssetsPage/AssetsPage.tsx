import { useMemo, useState } from 'react';
import {
  Building2,
  Car,
  Coins,
  CreditCard,
  House,
  Landmark,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import ReturnText from '@/components/ReturnText';
import StatCard from '@/components/StatCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FixedAssetForm from './FixedAssetForm';
import CashAssetForm from './CashAssetForm';
import InvestmentForm from './InvestmentForm';
import MetalForm from './MetalForm';
import LiabilityForm from './LiabilityForm';
import {
  CASH_TYPES,
  FIXED_TYPES,
  LIABILITY_TYPES,
  METAL_TYPES,
  STORAGE_KEYS,
} from '@/data/constants';
import { usePersistentList } from '@/hooks/usePersistentList';
import type {
  ICashAsset,
  IFixedAsset,
  IInvestment,
  IMetal,
  ILiability,
} from '@/data/types';
import { formatMoney } from '@/lib/format';
import {
  invGain,
  invMarketValue,
  invReturnRate,
  metalGain,
  metalMarketValue,
  metalReturnRate,
  summarize,
} from '@/lib/finance';
import { fetchGoldPrice, fetchQuotes, normalizeCode } from '@/lib/quotes';
import { genId } from '@/lib/store';

const iconBtn =
  'inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground';

export default function AssetsPage() {
  const fixed = usePersistentList<IFixedAsset>(STORAGE_KEYS.fixedAssets);
  const cash = usePersistentList<ICashAsset>(STORAGE_KEYS.cashAssets);
  const inv = usePersistentList<IInvestment>(STORAGE_KEYS.investments);
  const metal = usePersistentList<IMetal>(STORAGE_KEYS.metals);
  const liab = usePersistentList<ILiability>(STORAGE_KEYS.liabilities);

  const [fixedOpen, setFixedOpen] = useState(false);
  const [cashOpen, setCashOpen] = useState(false);
  const [invOpen, setInvOpen] = useState(false);
  const [metalOpen, setMetalOpen] = useState(false);
  const [liabOpen, setLiabOpen] = useState(false);
  const [fixedEdit, setFixedEdit] = useState<IFixedAsset | null>(null);
  const [cashEdit, setCashEdit] = useState<ICashAsset | null>(null);
  const [invEdit, setInvEdit] = useState<IInvestment | null>(null);
  const [metalEdit, setMetalEdit] = useState<IMetal | null>(null);
  const [liabEdit, setLiabEdit] = useState<ILiability | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshingGold, setRefreshingGold] = useState(false);

  const s = useMemo(
    () => summarize(fixed.items, cash.items, inv.items, metal.items, liab.items),
    [fixed.items, cash.items, inv.items, metal.items, liab.items],
  );

  const stockItems = inv.items.filter((i) => i.type === 'stock');
  const etfItems = inv.items.filter((i) => i.type === 'etf');
  const sortedFixed = [...fixed.items].sort((a, b) => b.value - a.value);
  const sortedLiab = [...liab.items].sort((a, b) => b.balance - a.balance);
  const monthlyPay = liab.items.reduce((a, l) => a + (l.monthlyPayment ?? 0), 0);

  const handleRefresh = async () => {
    const all = [...stockItems, ...etfItems];
    if (all.length === 0) {
      toast.info('暂无需要刷新的股票 / ETF');
      return;
    }
    setRefreshing(true);
    try {
      const quotes = await fetchQuotes(all.map((i) => i.code));
      let count = 0;
      for (const item of all) {
        const price = quotes[normalizeCode(item.code)];
        if (price) {
          inv.update(item.id, { currentPrice: price });
          count += 1;
        }
      }
      if (count > 0) toast.success(`已刷新 ${count} 只行情`);
      else toast.error('未获取到行情，请检查代码');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '刷新失败');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefreshGold = async () => {
    if (metal.items.length === 0) {
      toast.info('暂无贵金属记录');
      return;
    }
    setRefreshingGold(true);
    try {
      const goldPrice = await fetchGoldPrice();
      let count = 0;
      for (const m of metal.items) {
        if (m.type === 'gold') {
          metal.update(m.id, { currentPrice: goldPrice });
          count += 1;
        }
      }
      if (count > 0)
        toast.success(`已刷新 ${count} 项黄金，金价 ¥${goldPrice}/克`);
      else toast.info('仅黄金支持一键刷新，白银 / 铂金请手动填写');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '金价刷新失败');
    } finally {
      setRefreshingGold(false);
    }
  };

  const renderMetalTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>名称</TableHead>
          <TableHead>种类</TableHead>
          <TableHead className="text-right">克数</TableHead>
          <TableHead className="text-right">每克成本</TableHead>
          <TableHead className="text-right">现价</TableHead>
          <TableHead className="text-right">市值</TableHead>
          <TableHead className="text-right">收益</TableHead>
          <TableHead className="text-right">收益率</TableHead>
          <TableHead className="text-right">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {metal.items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
              暂无记录
            </TableCell>
          </TableRow>
        ) : (
          metal.items.map((m) => {
            const mv = metalMarketValue(m);
            const gain = metalGain(m);
            return (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {METAL_TYPES[m.type].label}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMoney(m.weight)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMoney(m.cost)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {m.currentPrice > 0 ? formatMoney(m.currentPrice) : '待刷新'}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {m.currentPrice > 0 ? formatMoney(mv) : '—'}
                </TableCell>
                <TableCell
                  className={`text-right tabular-nums ${gain >= 0 ? 'text-up' : 'text-down'}`}
                >
                  {m.currentPrice > 0 ? `${gain >= 0 ? '+' : ''}${formatMoney(gain)}` : '—'}
                </TableCell>
                <TableCell className="text-right">
                  <ReturnText value={m.currentPrice > 0 ? metalReturnRate(m) : 0} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className={iconBtn}
                      onClick={() => {
                        setMetalEdit(m);
                        setMetalOpen(true);
                      }}
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      className={iconBtn}
                      onClick={() => {
                        metal.remove(m.id);
                        toast.success('已删除');
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );

  const renderInvestTable = (list: IInvestment[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>名称</TableHead>
          <TableHead>代码</TableHead>
          <TableHead className="text-right">份额</TableHead>
          <TableHead className="text-right">每股成本</TableHead>
          <TableHead className="text-right">现价</TableHead>
          <TableHead className="text-right">市值</TableHead>
          <TableHead className="text-right">收益</TableHead>
          <TableHead className="text-right">收益率</TableHead>
          <TableHead className="text-right">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
              暂无记录
            </TableCell>
          </TableRow>
        ) : (
          list.map((item) => {
            const mv = invMarketValue(item);
            const gain = invGain(item);
            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-muted-foreground">{item.code}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMoney(item.shares)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMoney(item.cost, 3)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {item.currentPrice > 0 ? formatMoney(item.currentPrice, 3) : '待刷新'}
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatMoney(mv)}</TableCell>
                <TableCell className={`text-right tabular-nums ${gain >= 0 ? 'text-up' : 'text-down'}`}>
                  {gain >= 0 ? '+' : ''}
                  {formatMoney(gain)}
                </TableCell>
                <TableCell className="text-right">
                  <ReturnText value={invReturnRate(item)} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className={iconBtn}
                      onClick={() => {
                        setInvEdit(item);
                        setInvOpen(true);
                      }}
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      className={iconBtn}
                      onClick={() => {
                        inv.remove(item.id);
                        toast.success('已删除');
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );

  return (
    <div>
      <PageHeader
        title="资产负债"
        description="记录固定资产、现金资产与负债，计算各部分及整体收益率。"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="总资产"
          value={`¥${formatMoney(s.totalAssets)}`}
          icon={<Landmark className="size-4" />}
        />
        <StatCard
          label="总负债"
          value={`¥${formatMoney(s.totalLiabilities)}`}
          sub={`月供合计 ¥${formatMoney(monthlyPay)}`}
          icon={<CreditCard className="size-4" />}
        />
        <StatCard
          label="净资产"
          value={`¥${formatMoney(s.netWorth)}`}
          icon={<House className="size-4" />}
        />
        <StatCard
          label="整体收益率"
          value=""
          sub={<ReturnText value={s.totalReturnRate} className="text-2xl" />}
          icon={<TrendingUp className="size-4" />}
        />
      </div>

      <Tabs defaultValue="cash" className="mt-5">
        <TabsList>
          <TabsTrigger value="cash">现金资产</TabsTrigger>
          <TabsTrigger value="metal">贵金属</TabsTrigger>
          <TabsTrigger value="fixed">固定资产</TabsTrigger>
          <TabsTrigger value="liab">负债</TabsTrigger>
        </TabsList>

        {/* 现金资产 */}
        <TabsContent value="cash" className="grid gap-4">
          <Card className="gap-0">
            <div className="flex flex-wrap items-center justify-between gap-2 p-4 pb-2">
              <div className="flex items-center gap-2 font-medium">
                <TrendingUp className="size-4" />
                股票
                <Badge variant="secondary">{stockItems.length}</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                  <RefreshCw className={`size-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                  一键刷新行情
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setInvEdit(null);
                    setInvOpen(true);
                  }}
                >
                  <Plus className="size-3.5" />
                  添加股票
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto px-2 pb-3">{renderInvestTable(stockItems)}</div>
          </Card>

          <Card className="gap-0">
            <div className="flex items-center justify-between p-4 pb-2">
              <div className="flex items-center gap-2 font-medium">
                <TrendingUp className="size-4" />
                ETF 基金
                <Badge variant="secondary">{etfItems.length}</Badge>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setInvEdit(null);
                  setInvOpen(true);
                }}
              >
                <Plus className="size-3.5" />
                添加 ETF
              </Button>
            </div>
            <div className="overflow-x-auto px-2 pb-3">{renderInvestTable(etfItems)}</div>
          </Card>

          <Card className="gap-0">
            <div className="flex items-center justify-between p-4 pb-2">
              <div className="font-medium">移动现金 / 银行存款</div>
              <Button
                size="sm"
                onClick={() => {
                  setCashEdit(null);
                  setCashOpen(true);
                }}
              >
                <Plus className="size-3.5" />
                添加
              </Button>
            </div>
            <div className="divide-y px-2">
              {cash.items.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  暂无现金 / 存款记录
                </div>
              ) : (
                cash.items.map((item) => {
                  const gain = item.amount - item.principal;
                  return (
                    <div key={item.id} className="flex items-center gap-3 px-2 py-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          <Badge variant="secondary">{CASH_TYPES[item.type].label}</Badge>
                          {item.interestRate ? (
                            <span className="text-xs text-muted-foreground">
                              年利率 {item.interestRate}%
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        本金 {formatMoney(item.principal)}
                      </div>
                      <div className="w-28 text-right font-medium tabular-nums">
                        ¥{formatMoney(item.amount)}
                      </div>
                      <div className={`w-24 text-right tabular-nums ${gain >= 0 ? 'text-up' : 'text-down'}`}>
                        {gain >= 0 ? '+' : ''}
                        {formatMoney(gain)}
                      </div>
                      <div className="flex">
                        <button
                          type="button"
                          className={iconBtn}
                          onClick={() => {
                            setCashEdit(item);
                            setCashOpen(true);
                          }}
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          className={iconBtn}
                          onClick={() => {
                            cash.remove(item.id);
                            toast.success('已删除');
                          }}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </TabsContent>

        {/* 贵金属 */}
        <TabsContent value="metal">
          <Card className="gap-0">
            <div className="flex flex-wrap items-center justify-between gap-2 p-4 pb-2">
              <div className="flex items-center gap-2 font-medium">
                <Coins className="size-4" />
                贵金属（黄金 / 白银等）
                <Badge variant="secondary">{metal.items.length}</Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshGold}
                  disabled={refreshingGold}
                >
                  <RefreshCw className={`size-3.5 ${refreshingGold ? 'animate-spin' : ''}`} />
                  一键刷新金价
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setMetalEdit(null);
                    setMetalOpen(true);
                  }}
                >
                  <Plus className="size-3.5" />
                  添加贵金属
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto px-2 pb-3">{renderMetalTable()}</div>
          </Card>
        </TabsContent>

        {/* 固定资产 */}
        <TabsContent value="fixed">
          <Card className="gap-0">
            <div className="flex items-center justify-between p-4 pb-2">
              <div className="font-medium">房产 / 汽车</div>
              <Button
                size="sm"
                onClick={() => {
                  setFixedEdit(null);
                  setFixedOpen(true);
                }}
              >
                <Plus className="size-3.5" />
                添加固定资产
              </Button>
            </div>
            <div className="divide-y px-2">
              {sortedFixed.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  暂无固定资产记录
                </div>
              ) : (
                sortedFixed.map((item) => {
                  const gain = item.value - item.cost;
                  return (
                    <div key={item.id} className="flex items-center gap-3 px-2 py-3">
                      <div className="flex size-9 items-center justify-center rounded-md bg-muted">
                        {item.type === 'property' ? (
                          <Building2 className="size-4" />
                        ) : (
                          <Car className="size-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          <Badge variant="secondary">{FIXED_TYPES[item.type].label}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          成本 ¥{formatMoney(item.cost)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium tabular-nums">¥{formatMoney(item.value)}</div>
                        <div className={`text-xs tabular-nums ${gain >= 0 ? 'text-up' : 'text-down'}`}>
                          {gain >= 0 ? '+' : ''}
                          {formatMoney(gain)}
                        </div>
                      </div>
                      <div className="flex">
                        <button
                          type="button"
                          className={iconBtn}
                          onClick={() => {
                            setFixedEdit(item);
                            setFixedOpen(true);
                          }}
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          className={iconBtn}
                          onClick={() => {
                            fixed.remove(item.id);
                            toast.success('已删除');
                          }}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </TabsContent>

        {/* 负债 */}
        <TabsContent value="liab">
          <Card className="gap-0">
            <div className="flex items-center justify-between p-4 pb-2">
              <div className="font-medium">房贷 / 车贷 / 信用卡等</div>
              <Button
                size="sm"
                onClick={() => {
                  setLiabEdit(null);
                  setLiabOpen(true);
                }}
              >
                <Plus className="size-3.5" />
                添加负债
              </Button>
            </div>
            <div className="divide-y px-2">
              {sortedLiab.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  暂无负债记录
                </div>
              ) : (
                sortedLiab.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-2 py-3">
                    <div className="flex size-9 items-center justify-center rounded-md bg-muted">
                      <CreditCard className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.name}</span>
                        <Badge variant="secondary">{LIABILITY_TYPES[item.type].label}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.monthlyPayment ? `月供 ¥${formatMoney(item.monthlyPayment)}` : ''}
                      </div>
                    </div>
                    <div className="font-medium tabular-nums">¥{formatMoney(item.balance)}</div>
                    <div className="flex">
                      <button
                        type="button"
                        className={iconBtn}
                        onClick={() => {
                          setLiabEdit(item);
                          setLiabOpen(true);
                        }}
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        className={iconBtn}
                        onClick={() => {
                          liab.remove(item.id);
                          toast.success('已删除');
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <FixedAssetForm
        open={fixedOpen}
        onOpenChange={setFixedOpen}
        editing={fixedEdit}
        onSubmit={(data) => {
          if (fixedEdit) {
            fixed.update(fixedEdit.id, data);
            toast.success('已更新');
          } else {
            fixed.add({ ...data, id: genId() });
            toast.success('已添加');
          }
        }}
      />
      <CashAssetForm
        open={cashOpen}
        onOpenChange={setCashOpen}
        editing={cashEdit}
        onSubmit={(data) => {
          if (cashEdit) {
            cash.update(cashEdit.id, data);
            toast.success('已更新');
          } else {
            cash.add({ ...data, id: genId() });
            toast.success('已添加');
          }
        }}
      />
      <InvestmentForm
        open={invOpen}
        onOpenChange={setInvOpen}
        editing={invEdit}
        onSubmit={(data) => {
          if (invEdit) {
            inv.update(invEdit.id, data);
            toast.success('已更新');
          } else {
            inv.add({ ...data, id: genId() });
            toast.success('已添加');
          }
        }}
      />
      <MetalForm
        open={metalOpen}
        onOpenChange={setMetalOpen}
        editing={metalEdit}
        onSubmit={(data) => {
          if (metalEdit) {
            metal.update(metalEdit.id, data);
            toast.success('已更新');
          } else {
            metal.add({ ...data, id: genId() });
            toast.success('已添加');
          }
        }}
      />
      <LiabilityForm
        open={liabOpen}
        onOpenChange={setLiabOpen}
        editing={liabEdit}
        onSubmit={(data) => {
          if (liabEdit) {
            liab.update(liabEdit.id, data);
            toast.success('已更新');
          } else {
            liab.add({ ...data, id: genId() });
            toast.success('已添加');
          }
        }}
      />
    </div>
  );
}
