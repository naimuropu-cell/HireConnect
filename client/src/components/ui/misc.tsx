import { cn } from '@/lib/utils';

export function Tabs({ value, onValueChange, items }: { value: string; onValueChange: (v: string) => void; items: { value: string; label: string }[] }) {
  return (
    <div className="inline-flex rounded-lg bg-slate-100 p-1">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onValueChange(item.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            value === item.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function Avatar({ src, className, children }: { src?: string | null; className?: string; children?: React.ReactNode }) {
  return (
    <div
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 overflow-hidden',
        className
      )}
    >
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : children}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-slate-200', className)} />;
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn('h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600', className)}
    />
  );
}

export function Switch({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-5 w-9 rounded-full transition-colors disabled:opacity-50',
        checked ? 'bg-indigo-600' : 'bg-slate-300'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
          checked ? 'left-[18px]' : 'left-0.5'
        )}
      />
    </button>
  );
}

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-slate-100', className)}>
      <div
        className="h-full rounded-full bg-indigo-600 transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
