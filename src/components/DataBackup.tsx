import { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { exportData, importData } from '@/lib/store';
import type { IBackup } from '@/data/types';

/** 数据备份：导出 / 导入 JSON（用于侧栏底部，适配深底） */
export default function DataBackup() {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `小康之家-备份-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('已导出备份文件');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text()) as IBackup;
      if (data.app !== '小康之家') {
        toast.error('这不是「小康之家」的备份文件');
        return;
      }
      importData(data);
      toast.success('导入成功，页面即将刷新');
      window.setTimeout(() => window.location.reload(), 600);
    } catch {
      toast.error('文件解析失败，请确认是有效的备份文件');
    } finally {
      e.target.value = '';
    }
  };

  const btnClass =
    'inline-flex size-8 items-center justify-center rounded-md text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors';

  return (
    <div className="flex items-center gap-1">
      <button type="button" className={btnClass} onClick={handleExport} title="导出备份">
        <Download className="size-4" />
      </button>
      <button
        type="button"
        className={btnClass}
        onClick={() => fileRef.current?.click()}
        title="导入备份"
      >
        <Upload className="size-4" />
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleImport}
      />
    </div>
  );
}
