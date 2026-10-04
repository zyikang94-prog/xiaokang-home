import { useCallback, useState } from 'react';
import { kvGet, kvSet } from '@/lib/store';

/** 持久化列表：增删改查并同步到本地存储 */
export function usePersistentList<T extends { id: string }>(key: string) {
  const [items, setItems] = useState<T[]>(() => kvGet<T[]>(key, []));

  const add = useCallback(
    (item: T) => {
      setItems((prev) => {
        const next = [item, ...prev];
        kvSet(key, next);
        return next;
      });
    },
    [key],
  );

  const update = useCallback(
    (id: string, patch: Partial<T>) => {
      setItems((prev) => {
        const next = prev.map((it) => (it.id === id ? { ...it, ...patch } : it));
        kvSet(key, next);
        return next;
      });
    },
    [key],
  );

  const remove = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = prev.filter((it) => it.id !== id);
        kvSet(key, next);
        return next;
      });
    },
    [key],
  );

  const replaceAll = useCallback(
    (next: T[]) => {
      setItems(next);
      kvSet(key, next);
    },
    [key],
  );

  return { items, add, update, remove, replaceAll };
}
